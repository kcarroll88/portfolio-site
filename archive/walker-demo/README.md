# Paused: live walker demo (/walker)

An earlier run built a live `/walker` page: a canvas that replays each generation's champion,
a generation scrub timeline and ghost walkers, fed by the walker-trainer read-only API
(`~/Code/walker-trainer`). On 2026-09-30 the owner paused the live demo, so the code is kept
here, outside `src/`, where it is not routed, type-checked (see `tsconfig.json` exclude) or built.

To bring it back: move `page.tsx` to `src/app/walker/page.tsx`, `components/` to
`src/components/walker/`, `walker.ts` to `src/lib/walker.ts`, `env.example` to `.env.example`,
and `git apply archive/walker-demo/cursor-and-overlay-optout.patch` (lets /walker use the native
cursor and hides the noise overlay).
