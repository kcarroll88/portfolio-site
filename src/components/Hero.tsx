'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import ChatInterface from './ChatInterface';

const TAGLINES = [
  'AI Systems Builder',
  'Automation Architect',
  'Systems Designer',
  'AI-Powered Infrastructure',
];

export default function Hero() {
  const [taglineIndex, setTaglineIndex] = useState(0);
  const [displayed, setDisplayed] = useState('');
  const [deleting, setDeleting] = useState(false);

  // Typewriter effect for taglines
  useEffect(() => {
    const current = TAGLINES[taglineIndex];
    let timeout: ReturnType<typeof setTimeout>;

    if (!deleting && displayed.length < current.length) {
      timeout = setTimeout(() => {
        setDisplayed(current.slice(0, displayed.length + 1));
      }, 60);
    } else if (!deleting && displayed.length === current.length) {
      timeout = setTimeout(() => setDeleting(true), 2400);
    } else if (deleting && displayed.length > 0) {
      timeout = setTimeout(() => {
        setDisplayed(displayed.slice(0, -1));
      }, 35);
    } else if (deleting && displayed.length === 0) {
      setDeleting(false);
      setTaglineIndex((i) => (i + 1) % TAGLINES.length);
    }

    return () => clearTimeout(timeout);
  }, [displayed, deleting, taglineIndex]);

  const scrollToProjects = () => {
    document.getElementById('projects')?.scrollIntoView({ behavior: 'smooth' });
  };

  const scrollToContact = () => {
    document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section
      id="hero"
      className="relative min-h-screen flex items-center"
      style={{ paddingLeft: '5rem' }}
    >
      <div className="w-full max-w-7xl mx-auto px-6 lg:px-16 py-20">
        <div className="grid lg:grid-cols-[1fr_auto] gap-12 lg:gap-20 items-center">
          {/* Left — Identity */}
          <div>
            {/* Location pill */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 mb-8"
            >
              <span
                className="w-1.5 h-1.5 rounded-full animate-pulse"
                style={{ background: 'var(--gold)' }}
              />
              <span
                className="text-xs tracking-[0.2em] uppercase"
                style={{
                  fontFamily: 'var(--font-jetbrains-mono)',
                  color: 'var(--cream-muted)',
                }}
              >
                Raleigh, NC
              </span>
            </motion.div>

            {/* Name */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
            >
              <p
                className="text-base mb-2"
                style={{
                  fontFamily: 'var(--font-jetbrains-mono)',
                  color: 'var(--cream-muted)',
                }}
              >
                Hey, I&apos;m
              </p>
              <h1
                className="text-6xl lg:text-8xl font-bold leading-none tracking-tight mb-6"
                style={{
                  fontFamily: 'var(--font-space-grotesk)',
                  color: 'var(--cream)',
                }}
              >
                Keenan
                <br />
                <span style={{ color: 'var(--gold)' }}>Carroll</span>
              </h1>
            </motion.div>

            {/* Typewriter tagline */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="mb-8 h-8 flex items-center"
            >
              <span
                className="text-xl lg:text-2xl"
                style={{
                  fontFamily: 'var(--font-jetbrains-mono)',
                  color: 'var(--cream-muted)',
                }}
              >
                {displayed}
                <span
                  className="animate-blink ml-0.5"
                  style={{ color: 'var(--gold)' }}
                >
                  |
                </span>
              </span>
            </motion.div>

            {/* Description */}
            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.75 }}
              className="text-base lg:text-lg leading-relaxed max-w-lg mb-10"
              style={{
                fontFamily: 'var(--font-body)',
                color: 'var(--cream-muted)',
              }}
            >
              I design and build AI-powered systems that automate real-world business operations —
              bridging the gap between AI capability and{' '}
              <span style={{ color: 'var(--cream)' }}>real-world execution</span>.
            </motion.p>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9 }}
              className="flex flex-wrap gap-4"
            >
              <button onClick={scrollToProjects} className="btn-primary">
                View Work
              </button>
              <button onClick={scrollToContact} className="btn-ghost">
                Get In Touch
              </button>
            </motion.div>

            {/* Scroll hint */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.4 }}
              className="mt-16 hidden lg:flex items-center gap-3"
            >
              <div className="flex flex-col gap-1">
                <motion.div
                  animate={{ y: [0, 6, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="w-0.5 h-4 mx-auto"
                  style={{ background: 'var(--cream-dim)' }}
                />
              </div>
              <span
                className="text-xs tracking-widest uppercase"
                style={{
                  fontFamily: 'var(--font-jetbrains-mono)',
                  color: 'var(--cream-dim)',
                }}
              >
                Scroll
              </span>
            </motion.div>
          </div>

          {/* Right — Chat */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5, duration: 0.7 }}
            className="hidden lg:flex flex-col"
          >
            <p
              className="text-xs tracking-[0.2em] uppercase mb-4 text-center"
              style={{
                fontFamily: 'var(--font-jetbrains-mono)',
                color: 'var(--cream-dim)',
              }}
            >
              Chat with my AI ↓
            </p>
            <ChatInterface />
          </motion.div>
        </div>

        {/* Mobile chat below */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="lg:hidden mt-12"
        >
          <p
            className="text-xs tracking-[0.2em] uppercase mb-4"
            style={{
              fontFamily: 'var(--font-jetbrains-mono)',
              color: 'var(--cream-dim)',
            }}
          >
            Chat with my AI ↓
          </p>
          <ChatInterface />
        </motion.div>
      </div>
    </section>
  );
}
