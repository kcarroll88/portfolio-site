'use client';

import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';

export default function Contact() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section id="contact" className="relative py-28 pb-40 lg:pl-20">
      <div className="max-w-6xl mx-auto px-6 lg:px-16">
        <div className="flex items-center gap-4 mb-16">
          <span className="section-number hidden sm:inline">05 / CONTACT</span>
          <div className="w-8 h-px hidden sm:block" style={{ background: 'var(--glass-border)' }} />
          <h2
            className="text-3xl lg:text-4xl font-bold"
            style={{ fontFamily: 'var(--font-space-grotesk)', color: 'var(--cream)' }}
          >
            Get In Touch
          </h2>
          <div className="flex-1 h-px" style={{ background: 'var(--glass-border)' }} />
        </div>

        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="max-w-2xl"
        >
          <p
            className="text-xl leading-relaxed mb-4"
            style={{ color: 'var(--cream-muted)', fontFamily: 'var(--font-body)' }}
          >
            I&apos;m currently open to conversations about{' '}
            <span style={{ color: 'var(--cream)' }}>AI consulting</span>,{' '}
            <span style={{ color: 'var(--cream)' }}>collaboration</span>, and{' '}
            <span style={{ color: 'var(--cream)' }}>building together</span>.
          </p>
          <p
            className="text-base leading-relaxed mb-10"
            style={{ color: 'var(--cream-muted)', fontFamily: 'var(--font-body)' }}
          >
            If you have a problem that AI could solve, or you&apos;re building something in the
            AI/automation space — let&apos;s talk.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 mb-14">
            <a
              href="mailto:hello@keenancarroll.com"
              className="btn-primary inline-flex items-center gap-2"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-4 h-4">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
              </svg>
              Say Hello
            </a>
            <a
              href="https://www.linkedin.com/in/keenanacarroll/"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-ghost inline-flex items-center gap-2"
            >
              LinkedIn
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-3.5 h-3.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 19.5l15-15m0 0H8.25m11.25 0v11.25" />
              </svg>
            </a>
          </div>

          {/* Divider */}
          <div className="h-px mb-10" style={{ background: 'var(--glass-border)' }} />

          {/* Footer */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <p
              className="text-sm"
              style={{ fontFamily: 'var(--font-jetbrains-mono)', color: 'var(--cream-dim)' }}
            >
              Designed & Built by{' '}
              <span style={{ color: 'var(--gold)' }}>Keenan Carroll</span>
            </p>
            <div className="flex items-center gap-4">
              <a
                href="https://github.com/kcarroll88"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs link-underline transition-colors duration-200"
                style={{ fontFamily: 'var(--font-jetbrains-mono)', color: 'var(--cream-dim)' }}
                onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--cream-muted)')}
                onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--cream-dim)')}
              >
                GitHub
              </a>
              <a
                href="https://www.linkedin.com/in/keenanacarroll/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs link-underline transition-colors duration-200"
                style={{ fontFamily: 'var(--font-jetbrains-mono)', color: 'var(--cream-dim)' }}
                onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--cream-muted)')}
                onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--cream-dim)')}
              >
                LinkedIn
              </a>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
