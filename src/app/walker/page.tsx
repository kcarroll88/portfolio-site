import type { Metadata } from 'next';
import Link from 'next/link';
import WalkerDemo from '@/components/walker/WalkerDemo';

export const metadata: Metadata = {
  title: 'A walker learning to walk — Keenan Carroll',
  description:
    'A live neuroevolution run: a 2D walker learning to walk, generation by generation, replayed from recorded trajectories.',
};

export default function WalkerPage() {
  return (
    <main className="relative min-h-screen px-6 py-12 sm:px-10 lg:px-24">
      <div className="mx-auto max-w-5xl flex flex-col gap-8">
        <header className="flex flex-col gap-3">
          <Link href="/" className="section-number link-underline w-fit">
            ← keenancarroll.com
          </Link>
          <h1 className="font-sans text-3xl sm:text-4xl font-bold text-cream">
            A walker <span className="text-gold-gradient">learning to walk</span>
          </h1>
          <p className="max-w-2xl text-cream-muted leading-relaxed">
            Thirty small neural networks try to walk. The best five are kept, copied with a little random
            change, and tried again. There is no backpropagation, only selection and mutation. This page
            follows that run live and replays each generation&apos;s champion.
          </p>
        </header>

        <WalkerDemo />

        <section className="glass-subtle rounded-md p-6 flex flex-col gap-3 text-sm text-cream-muted leading-relaxed">
          <h2 className="section-number">How this page works</h2>
          <p>
            <strong className="text-cream">Recorded, not re-simulated.</strong> The trainer records where the
            body and legs actually were, 25 times a second. A browser physics engine would not reproduce the
            same walk: walking is chaotic, and tiny floating-point differences grow into a fall.
          </p>
          <p>
            <strong className="text-cream">Smoothed to your screen.</strong> Between two recorded frames the
            page blends positions by time, so 25 recorded frames play smoothly at 60.
          </p>
          <p>
            <strong className="text-cream">Live, with a fallback.</strong> New generations arrive over a
            Server-Sent Events stream the moment they finish. If the stream fails twice, the page asks for the
            status every five seconds instead.
          </p>
          <p>
            <strong className="text-cream">Ghosts on one course.</strong> Every replay walks the same fixed
            course, like an exam that never changes, so earlier champions can race the current one fairly.
          </p>
        </section>
      </div>
    </main>
  );
}
