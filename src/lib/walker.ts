/*
 * Walker demo client: the data side of /walker (no React in this file).
 *
 * Why it is built this way, in plain language:
 *
 * - Recorded trajectories, not re-simulation. The trainer runs Box2D in Python. A browser physics
 *   engine is a different implementation whose floating-point results differ in the last digits,
 *   and walking is chaotic: a one-in-ten-million difference at step 10 can become a fall at step
 *   300. So the trainer records what actually happened (x, y and angle of the hull and four leg
 *   segments, 25 times a second) and this page only draws shapes from those numbers. It also means
 *   a visitor can never make the server simulate anything.
 *
 * - Interpolation. Replays hold 25 frames per second; screens refresh at 60 or more. Drawing each
 *   recorded frame for several screen refreshes would stutter, so between frame i and i+1 we blend
 *   linearly by how far we are between them in time. Positions move a few millimetres per frame,
 *   so a straight line between samples is indistinguishable from the real path.
 *
 * - SSE with a polling fallback. The live counter uses Server-Sent Events (`EventSource` on
 *   /v1/stream): one long HTTP response the server writes a line to whenever a generation
 *   finishes, so a new champion shows up the moment it exists, and the browser reconnects by
 *   itself (sending Last-Event-ID so nothing is missed). Some proxies and networks break long
 *   responses, so after two failures in a row we switch to asking /v1/status every 5 seconds,
 *   which works everywhere, and try the stream again once a minute.
 *
 * - Ghosts on the same course. Every replay is that generation's champion walking one fixed
 *   showcase course (the ML "held-out test set": training ground changes every generation, the
 *   exam stays the same). Because the ground is identical, drawing older champions as translucent
 *   ghosts next to the current one is a fair race: any difference is the brain, not the terrain.
 *   The flip side, said on the page too: a champion can be unlucky on that one course, so its
 *   replay score may differ from its training score.
 *
 * Contract: walker-trainer docs/replay-format.md (format version 1). The decoder below is a typed
 * port of docs/decode-replay.mjs and was checked against docs/fixtures/sample-replay-v1.bin.
 */

export const WALKER_API_BASE = (
  process.env.NEXT_PUBLIC_WALKER_API_BASE || 'http://localhost:8000'
).replace(/\/+$/, '');

// ---------------------------------------------------------------------------------------------
// Types (field names follow the API's JSON)

export interface GenerationSummary {
  generation: number;
  attempts: number;
  champion_score: number;
  champion_tests: number;
  mean_score: number;
  best_ever: number;
  is_record: boolean;
  showcase_score: number;
  showcase_steps: number;
  created_at: string;
  has_replay: boolean;
}

export interface WalkerStatus {
  generation: number;
  attempts: number;
  best_ever: number | null;
  champion_score: number | null;
  mean_score: number | null;
  showcase_score: number | null;
  showcase_steps: number | null;
  showcase_seed: number | null;
  updated_at: string | null;
  seconds_since_update: number | null;
  viewers: number;
}

export interface GenerationList {
  latest: number;
  start: number;
  limit: number;
  items: GenerationSummary[];
  next_from: number | null;
}

export interface Course {
  seed: number;
  points: number;
  step_x: number;
  y: number[];
}

export interface Replay {
  frames: number;
  channels: number;
  recordEvery: number;
  fps: number;
  /** Quantised integers, frame-major: q[i * channels + c]. */
  q: Int16Array;
  /** World units (x, y) and radians (angle), frame-major: data[i * channels + c]. */
  data: Float32Array;
}

export interface LoadedReplay {
  requested: number;
  /** The generation the bytes belong to (differs from `requested` if retention thinned it). */
  generation: number;
  exact: boolean;
  replay: Replay;
}

/** What the live counter shows, from either an SSE event or a /v1/status poll. */
export interface Counter {
  generation: number;
  attempts: number;
  bestEver: number | null;
  /** Present when the update came from the stream (a full generation summary). */
  summary: GenerationSummary | null;
}

export type FeedState = 'connecting' | 'live' | 'polling' | 'reconnecting';

// ---------------------------------------------------------------------------------------------
// Replay decoder (format version 1)

export const POS_SCALE = 256; // x, y channels: integer / 256 = world units
export const ANGLE_SCALE = 4096; // angle channels: integer / 4096 = radians

export async function decodeReplay(buffer: ArrayBuffer): Promise<Replay> {
  const bytes = new Uint8Array(buffer);
  if (bytes[0] !== 1) throw new Error(`unsupported replay format version ${bytes[0]}`);

  // Byte 0 is the version; everything after it is a plain gzip stream (not Content-Encoding,
  // so the browser does not decompress it for us).
  const stream = new Blob([bytes.subarray(1)])
    .stream()
    .pipeThrough(new DecompressionStream('gzip'));
  const raw = await new Response(stream).arrayBuffer();
  const view = new DataView(raw);

  const frames = view.getUint16(0, true);
  const channels = view.getUint8(2);
  const recordEvery = view.getUint8(3); // physics steps per frame; physics runs at 50 Hz
  if (raw.byteLength !== 4 + frames * channels * 2) {
    throw new Error('replay payload has the wrong size');
  }
  if (frames < 1 || channels !== 15) throw new Error('replay has no frames or unexpected channels');

  const q = new Int16Array(frames * channels);
  const data = new Float32Array(frames * channels);
  for (let c = 0; c < channels; c++) {
    const scale = c % 3 === 2 ? ANGLE_SCALE : POS_SCALE;
    let prev = 0;
    for (let i = 0; i < frames; i++) {
      const d = view.getInt16(4 + (c * frames + i) * 2, true); // channel-major on the wire
      const v = i === 0 ? d : ((prev + d) << 16) >> 16; // int16 wrap-around add
      prev = v;
      q[i * channels + c] = v;
      data[i * channels + c] = v / scale;
    }
  }
  return { frames, channels, recordEvery, fps: 50 / recordEvery, q, data };
}

/** Seconds of motion in a replay. */
export function replayDuration(r: Replay): number {
  return (r.frames - 1) / r.fps;
}

/**
 * Pose at time `t` seconds, linearly interpolated between the two recorded frames around it.
 * Writes 15 numbers (5 bodies x [x, y, angle]) into `out` and returns it.
 */
export function samplePose(r: Replay, t: number, out: Float32Array): Float32Array {
  const f = Math.max(0, Math.min(r.frames - 1, t * r.fps));
  const i = Math.floor(f);
  const j = Math.min(r.frames - 1, i + 1);
  const a = f - i;
  const ch = r.channels;
  for (let c = 0; c < ch; c++) {
    const v0 = r.data[i * ch + c];
    let d = r.data[j * ch + c] - v0;
    if (c % 3 === 2) {
      // Angles: take the short way round in case a value wrapped past +-pi.
      if (d > Math.PI) d -= 2 * Math.PI;
      else if (d < -Math.PI) d += 2 * Math.PI;
    }
    out[c] = v0 + d * a;
  }
  return out;
}

// ---------------------------------------------------------------------------------------------
// Body shapes, in world units (gymnasium bipedal_walker.py, SCALE = 30)

const S = 30;
export const HULL_POLY: ReadonlyArray<readonly [number, number]> = [
  [-30 / S, 9 / S],
  [6 / S, 9 / S],
  [34 / S, 1 / S],
  [34 / S, -8 / S],
  [-30 / S, -8 / S],
];
const LEG_W = 8 / S;
const LEG_H = 34 / S;
/** Half extents [halfWidth, halfHeight] for body 1..4: upper A, lower A, upper B, lower B. */
export const LEG_HALF: ReadonlyArray<readonly [number, number]> = [
  [LEG_W / 2, LEG_H / 2],
  [(0.8 * LEG_W) / 2, LEG_H / 2],
  [LEG_W / 2, LEG_H / 2],
  [(0.8 * LEG_W) / 2, LEG_H / 2],
];
export const TERRAIN_STEP = 14 / S;
export const TERRAIN_HEIGHT = 400 / S / 4; // the env's flat ground level
export const START_X = (TERRAIN_STEP * 20) / 2;

/** Flat stand-in ground, drawn before /v1/course has arrived so the canvas is never blank. */
export function flatCourse(): Course {
  const points = 200;
  return { seed: -1, points, step_x: TERRAIN_STEP, y: new Array(points).fill(TERRAIN_HEIGHT) };
}

// ---------------------------------------------------------------------------------------------
// HTTP

export class WalkerHttpError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

async function get(path: string, timeoutMs = 8000): Promise<Response> {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(`${WALKER_API_BASE}${path}`, { signal: ctrl.signal });
    if (!res.ok) {
      let detail = res.statusText;
      try {
        detail = ((await res.json()) as { detail?: string }).detail ?? detail;
      } catch {
        /* body was not JSON */
      }
      throw new WalkerHttpError(res.status, `${res.status} ${detail}`);
    }
    return res;
  } finally {
    clearTimeout(timer);
  }
}

export async function fetchStatus(): Promise<WalkerStatus> {
  return (await get('/v1/status')).json();
}

export async function fetchCourse(): Promise<Course> {
  return (await get('/v1/course')).json();
}

/** Ascending page of summaries. `limit` is 1..500 on the server. */
export async function fetchGenerations(from: number, limit: number): Promise<GenerationList> {
  const f = Math.max(1, Math.floor(from));
  const l = Math.max(1, Math.min(500, Math.floor(limit)));
  return (await get(`/v1/generations?from=${f}&limit=${l}`)).json();
}

/** The newest `count` summaries (two requests: one to learn `latest`, one for the window). */
export async function fetchRecentGenerations(count = 500): Promise<GenerationList> {
  const probe = await fetchGenerations(1, 1);
  if (probe.latest <= 1) return probe;
  return fetchGenerations(Math.max(1, probe.latest - count + 1), count);
}

// Replays are immutable, so an in-memory cache (plus the browser's HTTP cache) absorbs repeats.
const replayCache = new Map<number, Promise<LoadedReplay>>();

export function fetchReplay(n: number): Promise<LoadedReplay> {
  const hit = replayCache.get(n);
  if (hit) return hit;
  const p = (async () => {
    const res = await get(`/v1/generations/${n}/replay`, 15000);
    const served = Number(res.headers.get('X-Replay-Generation'));
    const exact = res.headers.get('X-Replay-Exact') !== '0';
    const replay = await decodeReplay(await res.arrayBuffer());
    return { requested: n, generation: Number.isFinite(served) && served > 0 ? served : n, exact, replay };
  })();
  replayCache.set(n, p);
  p.catch(() => replayCache.delete(n)); // do not cache failures
  if (replayCache.size > 48) {
    const oldest = replayCache.keys().next().value;
    if (oldest !== undefined) replayCache.delete(oldest);
  }
  return p;
}

// ---------------------------------------------------------------------------------------------
// Live feed: SSE first, polling after two failures in a row

export interface LiveFeedOptions {
  onCounter: (c: Counter) => void;
  onState: (s: FeedState) => void;
  pollMs?: number;
  /** While polling, how often to try the stream again. */
  upgradeMs?: number;
}

export function openLiveFeed({
  onCounter,
  onState,
  pollMs = 5000,
  upgradeMs = 60000,
}: LiveFeedOptions): () => void {
  let closed = false;
  let es: EventSource | null = null;
  let failures = 0;
  let pollTimer: ReturnType<typeof setTimeout> | null = null;
  let retryTimer: ReturnType<typeof setTimeout> | null = null;
  let pollingSince = 0;

  const clearTimers = () => {
    if (pollTimer) clearTimeout(pollTimer);
    if (retryTimer) clearTimeout(retryTimer);
    pollTimer = retryTimer = null;
  };

  const startStream = () => {
    if (closed) return;
    if (typeof EventSource === 'undefined') return startPolling();
    onState(failures === 0 ? 'connecting' : 'reconnecting');
    const source = new EventSource(`${WALKER_API_BASE}/v1/stream`);
    es = source;
    source.onopen = () => {
      failures = 0;
      onState('live');
    };
    source.addEventListener('generation', (e) => {
      failures = 0;
      onState('live');
      try {
        const s = JSON.parse((e as MessageEvent<string>).data) as GenerationSummary;
        onCounter({ generation: s.generation, attempts: s.attempts, bestEver: s.best_ever, summary: s });
      } catch {
        /* a malformed event is skipped; the next one carries the full state again */
      }
    });
    source.onerror = () => {
      if (closed) return;
      failures += 1;
      if (failures >= 2) {
        source.close();
        es = null;
        startPolling();
      } else if (source.readyState === EventSource.CLOSED) {
        // An HTTP error (429, 503) closes EventSource for good; retry once by hand.
        source.close();
        es = null;
        onState('reconnecting');
        retryTimer = setTimeout(startStream, 3000);
      } else {
        onState('reconnecting'); // the browser retries on its own after `retry: 3000`
      }
    };
  };

  const startPolling = () => {
    if (closed) return;
    pollingSince = Date.now();
    const tick = async () => {
      if (closed) return;
      try {
        const s = await fetchStatus();
        if (closed) return;
        onState('polling');
        onCounter({ generation: s.generation, attempts: s.attempts, bestEver: s.best_ever, summary: null });
        if (Date.now() - pollingSince >= upgradeMs) {
          failures = 0;
          return startStream();
        }
      } catch {
        if (closed) return;
        onState('reconnecting');
      }
      pollTimer = setTimeout(tick, pollMs);
    };
    void tick();
  };

  startStream();

  return () => {
    closed = true;
    clearTimers();
    es?.close();
    es = null;
  };
}

// ---------------------------------------------------------------------------------------------
// Scrubber helpers

/** The generation in `items` with a replay that is closest to `n` (ties go to the older). */
export function snapToReplay(items: GenerationSummary[], n: number): number {
  let best = -1;
  let bestDist = Infinity;
  for (const it of items) {
    if (!it.has_replay) continue;
    const d = Math.abs(it.generation - n);
    if (d < bestDist || (d === bestDist && it.generation < best)) {
      best = it.generation;
      bestDist = d;
    }
  }
  return best > 0 ? best : n; // nothing known locally: the server substitutes the nearest itself
}

/** Up to `max` earlier generations with replays, spread evenly across the history before `current`. */
export function pickGhosts(items: GenerationSummary[], current: number, max = 4): number[] {
  const candidates = items.filter((it) => it.has_replay && it.generation < current).map((it) => it.generation);
  if (candidates.length > 0) {
    if (candidates.length <= max) return candidates;
    const out: number[] = [];
    for (let k = 0; k < max; k++) {
      const idx = Math.round(((k + 0.5) * (candidates.length - 1)) / max);
      if (!out.includes(candidates[idx])) out.push(candidates[idx]);
    }
    return out;
  }
  // No local history: ask the server for evenly spaced generations and let it snap to the nearest kept.
  const out: number[] = [];
  for (let k = 1; k <= max; k++) {
    const g = Math.floor((current * k) / (max + 1));
    if (g >= 1 && g < current && !out.includes(g)) out.push(g);
  }
  return out;
}

export function formatScore(v: number | null | undefined): string {
  if (v === null || v === undefined || !Number.isFinite(v)) return '—';
  return v.toFixed(1);
}

export function formatInt(v: number | null | undefined): string {
  if (v === null || v === undefined || !Number.isFinite(v)) return '—';
  return Math.round(v).toLocaleString('en-US');
}
