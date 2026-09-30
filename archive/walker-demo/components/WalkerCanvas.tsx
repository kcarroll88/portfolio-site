'use client';

import { useEffect, useRef } from 'react';
import {
  HULL_POLY,
  LEG_HALF,
  START_X,
  TERRAIN_HEIGHT,
  flatCourse,
  replayDuration,
  samplePose,
  type Course,
  type Replay,
} from '@/lib/walker';

export interface Run {
  /** Stable identity; a new key restarts playback. */
  key: string;
  replay: Replay;
  label: string;
}

interface Props {
  course: Course | null;
  main: Run | null;
  ghosts: Run[];
  /** Called each time playback reaches the end (after a short hold), before it loops. */
  onLoopEnd?: () => void;
}

const HOLD_SECONDS = 1.2;

// Colours from the site's tokens (tailwind.config.ts / globals.css).
const GOLD = '#C9963A';
const GOLD_LIGHT = '#DBA84A';
const GOLD_DIM = '#8B6526';
const CREAM = '#E8E4DC';
const NAVY_900 = '#0B1F3A';
const NAVY_700 = '#163559';
const NAVY_600 = '#1E4470';

/**
 * Draws recorded trajectories on the fixed showcase course. Playback runs on its own clock
 * (requestAnimationFrame, so ~60 fps) and interpolates between the replay's 25 fps frames.
 * Props are read through refs so a new counter value never restarts the animation loop.
 */
export default function WalkerCanvas({ course, main, ghosts, onLoopEnd }: Props) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const props = useRef({ course, main, ghosts, onLoopEnd });
  props.current = { course, main, ghosts, onLoopEnd };

  // Restart the clock whenever the main replay changes.
  const clockStart = useRef(0);
  const mainKey = main?.key ?? '';
  useEffect(() => {
    clockStart.current = performance.now();
  }, [mainKey]);

  useEffect(() => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    if (!wrap || !canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let raf = 0;
    let cssW = 0;
    let cssH = 0;
    let camX = START_X - 4;
    const pose = new Float32Array(15);
    const monoFont =
      getComputedStyle(document.documentElement).getPropertyValue('--font-jetbrains-mono').trim() ||
      'monospace';

    const resize = () => {
      const r = wrap.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      cssW = Math.max(1, r.width);
      cssH = Math.max(1, r.height);
      canvas.width = Math.round(cssW * dpr);
      canvas.height = Math.round(cssH * dpr);
      canvas.style.width = `${cssW}px`;
      canvas.style.height = `${cssH}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    const ro = new ResizeObserver(resize);
    ro.observe(wrap);
    resize();

    type ToScreen = (wx: number, wy: number) => [number, number];

    // Rotate a body-frame polygon by `a`, translate it to (x, y), then map to the screen.
    const drawBody = (
      x: number,
      y: number,
      a: number,
      poly: ReadonlyArray<readonly [number, number]>,
      toScreen: ToScreen,
    ) => {
      const cos = Math.cos(a);
      const sin = Math.sin(a);
      ctx.beginPath();
      poly.forEach(([px, py], k) => {
        const [sx, sy] = toScreen(x + px * cos - py * sin, y + px * sin + py * cos);
        if (k === 0) ctx.moveTo(sx, sy);
        else ctx.lineTo(sx, sy);
      });
      ctx.closePath();
    };

    const box = (hw: number, hh: number): Array<[number, number]> => [
      [-hw, -hh],
      [hw, -hh],
      [hw, hh],
      [-hw, hh],
    ];
    const legPolys = LEG_HALF.map(([hw, hh]) => box(hw, hh));

    const drawWalker = (p: Float32Array, toScreen: ToScreen, style: 'main' | 'ghost') => {
      const ghost = style === 'ghost';
      ctx.lineWidth = ghost ? 1 : 1.5;
      // Far leg (B: bodies 3, 4) first and darker, then near leg (A: bodies 1, 2), then the hull.
      const order = [3, 4, 1, 2];
      for (const b of order) {
        drawBody(p[b * 3], p[b * 3 + 1], p[b * 3 + 2], legPolys[b - 1], toScreen);
        const far = b >= 3;
        if (ghost) {
          ctx.fillStyle = far ? 'rgba(232, 228, 220, 0.06)' : 'rgba(232, 228, 220, 0.12)';
          ctx.strokeStyle = 'rgba(232, 228, 220, 0.35)';
        } else {
          ctx.fillStyle = far ? GOLD_DIM : GOLD;
          ctx.strokeStyle = far ? 'rgba(201, 150, 58, 0.6)' : GOLD_LIGHT;
        }
        ctx.fill();
        ctx.stroke();
      }
      drawBody(p[0], p[1], p[2], HULL_POLY, toScreen);
      if (ghost) {
        ctx.fillStyle = 'rgba(232, 228, 220, 0.14)';
        ctx.strokeStyle = 'rgba(232, 228, 220, 0.5)';
      } else {
        ctx.fillStyle = 'rgba(201, 150, 58, 0.85)';
        ctx.strokeStyle = CREAM;
      }
      ctx.fill();
      ctx.stroke();
    };

    const frame = (now: number) => {
      const { course: c, main: m, ghosts: gs, onLoopEnd: loopEnd } = props.current;
      const crs = c ?? flatCourse();
      const W = cssW;
      const H = cssH;

      // Playback clock shared by the main run and its ghosts, so they start together.
      const runs = m ? [m, ...gs] : gs;
      const duration = runs.reduce((d, r) => Math.max(d, replayDuration(r.replay)), 0);
      let t = (now - clockStart.current) / 1000;
      if (runs.length > 0 && t > duration + HOLD_SECONDS) {
        clockStart.current = now;
        t = 0;
        loopEnd?.();
      }

      // Camera: gymnasium keeps the hull a fifth of the way in from the left.
      const viewUnits = W < 640 ? 12 : 20;
      const scale = W / viewUnits;
      const courseEnd = (crs.points - 1) * crs.step_x;
      let targetX = START_X - viewUnits / 5;
      if (m) {
        samplePose(m.replay, t, pose);
        targetX = pose[0] - viewUnits / 5;
      }
      targetX = Math.max(0, Math.min(courseEnd - viewUnits, targetX));
      camX += (targetX - camX) * (t < 0.05 ? 1 : 0.15);
      const groundScreenY = H * 0.72;
      const toScreen = (wx: number, wy: number): [number, number] => [
        (wx - camX) * scale,
        groundScreenY - (wy - TERRAIN_HEIGHT) * scale,
      ];

      // Sky.
      const sky = ctx.createLinearGradient(0, 0, 0, H);
      sky.addColorStop(0, NAVY_900);
      sky.addColorStop(1, '#0F2847');
      ctx.fillStyle = sky;
      ctx.fillRect(0, 0, W, H);

      // Distance markers every 5 units, so motion reads even on flat ground.
      ctx.font = `10px ${monoFont}`;
      ctx.textAlign = 'center';
      for (let mx = Math.ceil(camX / 5) * 5; mx <= camX + viewUnits; mx += 5) {
        const [sx] = toScreen(mx, 0);
        ctx.strokeStyle = 'rgba(232, 228, 220, 0.05)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(sx, 0);
        ctx.lineTo(sx, H);
        ctx.stroke();
        ctx.fillStyle = 'rgba(168, 164, 156, 0.45)';
        ctx.fillText(`${mx}m`, sx, 14);
      }

      // Terrain: polyline over the course, filled to the bottom of the view.
      const i0 = Math.max(0, Math.floor(camX / crs.step_x) - 1);
      const i1 = Math.min(crs.points - 1, Math.ceil((camX + viewUnits) / crs.step_x) + 1);
      ctx.beginPath();
      const [fx] = toScreen(i0 * crs.step_x, 0);
      ctx.moveTo(fx, H);
      for (let i = i0; i <= i1; i++) {
        const [sx, sy] = toScreen(i * crs.step_x, crs.y[i]);
        ctx.lineTo(sx, sy);
      }
      const [lx] = toScreen(i1 * crs.step_x, 0);
      ctx.lineTo(lx, H);
      ctx.closePath();
      const ground = ctx.createLinearGradient(0, groundScreenY - 40, 0, H);
      ground.addColorStop(0, NAVY_600);
      ground.addColorStop(1, NAVY_700);
      ctx.fillStyle = ground;
      ctx.fill();
      ctx.beginPath();
      for (let i = i0; i <= i1; i++) {
        const [sx, sy] = toScreen(i * crs.step_x, crs.y[i]);
        if (i === i0) ctx.moveTo(sx, sy);
        else ctx.lineTo(sx, sy);
      }
      ctx.strokeStyle = 'rgba(201, 150, 58, 0.55)';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Finish line.
      if (courseEnd - camX < viewUnits + 1) {
        const [ex, ey] = toScreen(courseEnd, crs.y[crs.points - 1]);
        ctx.strokeStyle = GOLD;
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.moveTo(ex, ey);
        ctx.lineTo(ex, ey - 3 * scale);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      // Ghosts first (behind), then the main walker.
      ctx.textAlign = 'center';
      for (const g of gs) {
        samplePose(g.replay, t, pose);
        const [hx, hy] = toScreen(pose[0], pose[1]);
        if (hx < -20) {
          ctx.fillStyle = 'rgba(232, 228, 220, 0.55)';
          ctx.textAlign = 'left';
          ctx.fillText(`◀ ${g.label}`, 6, groundScreenY - 3.2 * scale - 12 * gs.indexOf(g));
          ctx.textAlign = 'center';
          continue;
        }
        if (hx > W + 20) {
          ctx.fillStyle = 'rgba(232, 228, 220, 0.55)';
          ctx.textAlign = 'right';
          ctx.fillText(`${g.label} ▶`, W - 6, groundScreenY - 3.2 * scale - 12 * gs.indexOf(g));
          ctx.textAlign = 'center';
          continue;
        }
        drawWalker(pose, toScreen, 'ghost');
        ctx.fillStyle = 'rgba(232, 228, 220, 0.6)';
        ctx.fillText(g.label, hx, hy - 1.1 * scale);
      }
      if (m) {
        samplePose(m.replay, t, pose);
        drawWalker(pose, toScreen, 'main');
        const [hx, hy] = toScreen(pose[0], pose[1]);
        ctx.fillStyle = GOLD_LIGHT;
        ctx.fillText(m.label, hx, hy - 1.1 * scale);
      }

      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
    };
  }, []);

  return (
    <div ref={wrapRef} className="absolute inset-0">
      <canvas ref={canvasRef} className="block" aria-label="Walker replay" role="img" />
    </div>
  );
}
