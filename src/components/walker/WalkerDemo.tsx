'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import WalkerCanvas, { type Run } from './WalkerCanvas';
import {
  WALKER_API_BASE,
  fetchCourse,
  fetchGenerations,
  fetchRecentGenerations,
  fetchReplay,
  formatInt,
  formatScore,
  openLiveFeed,
  pickGhosts,
  snapToReplay,
  type Counter,
  type Course,
  type FeedState,
  type GenerationSummary,
  type LoadedReplay,
} from '@/lib/walker';

const MAX_GHOSTS = 4;

interface Shown {
  loaded: LoadedReplay;
  summary: GenerationSummary | null;
}

function toRun(s: Shown): Run {
  return { key: `main-${s.loaded.generation}`, replay: s.loaded.replay, label: `gen ${s.loaded.generation}` };
}

const FEED_LABEL: Record<FeedState, string> = {
  connecting: 'Connecting',
  live: 'Live',
  polling: 'Live (polling)',
  reconnecting: 'Reconnecting',
};

export default function WalkerDemo() {
  const [course, setCourse] = useState<Course | null>(null);
  const [counter, setCounter] = useState<Counter | null>(null);
  const [feed, setFeed] = useState<FeedState>('connecting');
  const [history, setHistory] = useState<GenerationSummary[]>([]);
  const [mode, setMode] = useState<'live' | 'scrub'>('live');
  const [target, setTarget] = useState<number | null>(null);
  const [shown, setShown] = useState<Shown | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [ghostsOn, setGhostsOn] = useState(false);
  const [ghosts, setGhosts] = useState<Run[]>([]);

  const pendingLive = useRef<Shown | null>(null);
  const historyRef = useRef<GenerationSummary[]>([]);
  historyRef.current = history;
  const modeRef = useRef(mode);
  modeRef.current = mode;
  const shownRef = useRef(shown);
  shownRef.current = shown;
  const loadSeq = useRef(0);

  // Opt out of the site-wide custom cursor and noise overlay here: a canvas you scrub and a
  // range slider want the native cursor, and the overlay sits on top of the drawing.
  useEffect(() => {
    const root = document.documentElement;
    root.classList.add('walker-page');
    return () => root.classList.remove('walker-page');
  }, []);

  // Summary for one generation: from the loaded history, else one small request.
  const summaryFor = useCallback(async (g: number): Promise<GenerationSummary | null> => {
    const hit = historyRef.current.find((it) => it.generation === g);
    if (hit) return hit;
    try {
      const page = await fetchGenerations(g, 1);
      return page.items.find((it) => it.generation === g) ?? null;
    } catch {
      return null;
    }
  }, []);

  /**
   * Load generation `n` as the main replay. In live mode a new champion waits for the current
   * replay to finish (swapped in at the loop end) so a walk is never cut off mid-stride.
   */
  const loadMain = useCallback(
    async (n: number, how: 'now' | 'at-loop-end') => {
      const seq = ++loadSeq.current;
      setLoading(true);
      try {
        const loaded = await fetchReplay(n);
        const summary = await summaryFor(loaded.generation);
        if (seq !== loadSeq.current) return;
        const next = { loaded, summary };
        setLoadError(null);
        if (how === 'at-loop-end' && shownRef.current) pendingLive.current = next;
        else {
          pendingLive.current = null;
          setShown(next);
        }
      } catch (e) {
        if (seq !== loadSeq.current) return;
        setLoadError(e instanceof Error ? e.message : 'could not load the replay');
      } finally {
        if (seq === loadSeq.current) setLoading(false);
      }
    },
    [summaryFor],
  );

  const onLoopEnd = useCallback(() => {
    if (pendingLive.current && modeRef.current === 'live') {
      setShown(pendingLive.current);
      pendingLive.current = null;
    }
  }, []);

  const refreshHistory = useCallback(async () => {
    try {
      const page = await fetchRecentGenerations(500);
      setHistory(page.items);
    } catch {
      /* the feed shows the connection state; the scrubber keeps what it had */
    }
  }, []);

  // Live feed (SSE, falling back to polling).
  useEffect(() => openLiveFeed({ onCounter: setCounter, onState: setFeed }), []);

  const connected = feed === 'live' || feed === 'polling';

  // Course and history: fetched once connected, retried after a reconnect if they failed.
  useEffect(() => {
    if (!connected) return;
    if (!course) fetchCourse().then(setCourse).catch(() => undefined);
    if (historyRef.current.length === 0) void refreshHistory();
  }, [connected, course, refreshHistory]);

  // A new generation arrived.
  const latest = counter?.generation ?? 0;
  const lastSeen = useRef(0);
  useEffect(() => {
    if (!counter || counter.generation <= 0 || counter.generation === lastSeen.current) return;
    const first = lastSeen.current === 0;
    lastSeen.current = counter.generation;

    const s = counter.summary;
    if (s) {
      setHistory((h) => {
        if (h.some((it) => it.generation === s.generation)) return h;
        const next = [...h, s].sort((a, b) => a.generation - b.generation);
        return next.length > 500 ? next.slice(next.length - 500) : next;
      });
    } else if (!first) {
      void refreshHistory(); // polling carries no summary; re-read the list (cached 5 s server-side)
    }

    // First load always asks (the server substitutes the nearest kept replay if needed).
    if (modeRef.current === 'live' && (first || !s || s.has_replay)) {
      void loadMain(counter.generation, first ? 'now' : 'at-loop-end');
    }
  }, [counter, loadMain, refreshHistory]);

  // Scrubbing: the slider moves freely, the load waits until it rests for a moment.
  useEffect(() => {
    if (mode !== 'scrub' || target === null) return;
    const id = setTimeout(() => {
      void loadMain(snapToReplay(historyRef.current, target), 'now');
    }, 250);
    return () => clearTimeout(id);
  }, [mode, target, loadMain]);

  const goLive = () => {
    setMode('live');
    setTarget(null);
    if (latest > 0) void loadMain(latest, 'now');
  };

  // Ghosts: up to four earlier champions, all on the same showcase course.
  const shownGen = shown?.loaded.generation ?? 0;
  const ghostKey = useMemo(
    () => (ghostsOn && shownGen > 1 ? pickGhosts(history, shownGen, MAX_GHOSTS).join(',') : ''),
    [ghostsOn, shownGen, history],
  );
  useEffect(() => {
    if (!ghostKey) {
      setGhosts([]);
      return;
    }
    let cancelled = false;
    const gens = ghostKey.split(',').map(Number);
    Promise.allSettled(gens.map((g) => fetchReplay(g))).then((results) => {
      if (cancelled) return;
      const seen = new Set<number>();
      const runs: Run[] = [];
      for (const r of results) {
        if (r.status !== 'fulfilled') continue;
        const g = r.value.generation;
        if (seen.has(g) || g === shownGen) continue;
        seen.add(g);
        runs.push({ key: `ghost-${g}`, replay: r.value.replay, label: `gen ${g}` });
      }
      setGhosts(runs.slice(0, MAX_GHOSTS));
    });
    return () => {
      cancelled = true;
    };
  }, [ghostKey, shownGen]);

  const mainRun = useMemo(() => (shown ? toRun(shown) : null), [shown]);

  const sliderValue = mode === 'scrub' && target !== null ? target : shownGen || latest;
  const summary = shown?.summary ?? null;
  const substituted = shown && !shown.loaded.exact;

  let overlay: string | null = null;
  if (!connected) {
    overlay =
      feed === 'connecting'
        ? 'Connecting to the trainer…'
        : 'The trainer is offline or unreachable. Reconnecting automatically…';
  } else if (latest === 0) {
    overlay = 'Connected. Waiting for the first generation to finish…';
  } else if (!shown) {
    overlay = loadError ? `Could not load the replay (${loadError}). Retrying on the next generation.` : 'Loading the replay…';
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Live counter */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p
          className="font-mono text-lg sm:text-2xl text-cream tracking-wide"
          aria-live="polite"
          style={{ fontFamily: 'var(--font-jetbrains-mono)' }}
        >
          Generation <span className="text-gold">{formatInt(counter?.generation)}</span>
          <span className="text-cream-dim"> · </span>
          Attempt <span className="text-gold">{formatInt(counter?.attempts)}</span>
          <span className="text-cream-dim"> · </span>
          Best <span className="text-gold">{formatScore(counter?.bestEver)}</span>
        </p>
        <span
          className="flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-cream-muted"
          style={{ fontFamily: 'var(--font-jetbrains-mono)' }}
        >
          <span
            className={`inline-block w-2 h-2 rounded-full ${connected ? 'bg-gold animate-pulse' : 'bg-cream-dim'}`}
          />
          {FEED_LABEL[feed]}
        </span>
      </div>

      {/* Canvas */}
      <div className="relative w-full h-[320px] sm:h-[420px] rounded-md overflow-hidden glass">
        <WalkerCanvas course={course} main={mainRun} ghosts={ghosts} onLoopEnd={onLoopEnd} />
        {overlay && (
          <div className="absolute inset-0 flex items-center justify-center p-6 pointer-events-none">
            <p
              className="glass-subtle rounded px-4 py-3 text-sm text-cream-muted text-center max-w-md"
              style={{ fontFamily: 'var(--font-jetbrains-mono)' }}
            >
              {overlay}
            </p>
          </div>
        )}
        {shown && (
          <p
            className="absolute top-3 right-4 text-[0.7rem] text-cream-muted"
            style={{ fontFamily: 'var(--font-jetbrains-mono)' }}
          >
            {mode === 'live' ? 'following the newest champion' : 'history'}
            {loading ? ' · loading…' : ''}
          </p>
        )}
      </div>

      {/* Timeline scrubber and ghosts */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center gap-4">
          <label htmlFor="walker-scrub" className="section-number shrink-0">
            Timeline
          </label>
          <input
            id="walker-scrub"
            type="range"
            min={1}
            max={Math.max(1, latest)}
            step={1}
            value={Math.max(1, sliderValue)}
            disabled={latest < 2}
            onChange={(e) => {
              setMode('scrub');
              setTarget(Number(e.target.value));
            }}
            className="w-full accent-[#C9963A] disabled:opacity-40"
            aria-valuetext={`generation ${sliderValue}`}
          />
          <span
            className="shrink-0 w-24 text-right text-sm text-cream"
            style={{ fontFamily: 'var(--font-jetbrains-mono)' }}
          >
            gen {formatInt(sliderValue || null)}
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={goLive}
            disabled={mode === 'live' || latest === 0}
            className="btn-ghost !py-2 !px-4 disabled:opacity-40"
          >
            Jump to live
          </button>
          <button
            type="button"
            onClick={() => setGhostsOn((v) => !v)}
            aria-pressed={ghostsOn}
            className={`${ghostsOn ? 'btn-primary' : 'btn-ghost'} !py-2 !px-4`}
          >
            Ghosts {ghostsOn ? 'on' : 'off'}
          </button>
          {ghostsOn && (
            <span className="text-xs text-cream-muted" style={{ fontFamily: 'var(--font-jetbrains-mono)' }}>
              {ghosts.length > 0
                ? `${ghosts.length} earlier champion${ghosts.length === 1 ? '' : 's'}: ${ghosts.map((g) => g.label).join(', ')}`
                : shownGen > 1
                  ? 'loading earlier champions…'
                  : 'no earlier generations yet'}
            </span>
          )}
        </div>
        {substituted && shown && (
          <p className="text-xs text-cream-muted" style={{ fontFamily: 'var(--font-jetbrains-mono)' }}>
            Generation {formatInt(shown.loaded.requested)} has no stored replay (older replays are thinned to
            save space), so this is showing generation {formatInt(shown.loaded.generation)}, the nearest one kept.
          </p>
        )}
      </div>

      {/* Honest labels */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Stat
          label="Score on this replay"
          value={formatScore(summary?.showcase_score)}
          note={`Generation ${formatInt(shownGen || null)}'s champion on the fixed showcase course.`}
        />
        <Stat
          label={`Champion mean score${summary ? ` over ${summary.champion_tests} tests` : ''}`}
          value={formatScore(summary?.champion_score)}
          note="What picked it: its average over several training courses."
        />
        <Stat
          label="Population mean score"
          value={formatScore(summary?.mean_score)}
          note="The average of all 30 brains that generation."
        />
      </div>
      <p className="text-sm text-cream-muted leading-relaxed">
        Every replay is the champion walking the same fixed showcase course, so replays and ghosts are comparable
        across generations. It may score differently there than in training, where the ground changes every
        generation: a strong walker can be unlucky on one course. &ldquo;Best&rdquo; is the highest champion mean
        score so far; &ldquo;Attempt&rdquo; counts every walk run, re-tests included.
      </p>
      {!connected && (
        <p className="text-xs text-cream-dim" style={{ fontFamily: 'var(--font-jetbrains-mono)' }}>
          API: {WALKER_API_BASE}
        </p>
      )}
    </div>
  );
}

function Stat({ label, value, note }: { label: string; value: string; note: string }) {
  return (
    <div className="glass-subtle rounded-md p-4">
      <p className="section-number !text-[0.65rem]">{label}</p>
      <p className="mt-1 text-2xl text-cream" style={{ fontFamily: 'var(--font-jetbrains-mono)' }}>
        {value}
      </p>
      <p className="mt-1 text-xs text-cream-muted">{note}</p>
    </div>
  );
}
