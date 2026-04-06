'use client';

import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';
import { useRef } from 'react';

const FOCUS_AREAS = [
  { icon: '⬡', label: 'AI Agents', desc: 'Multi-agent systems coordinating tasks across platforms' },
  { icon: '⬡', label: 'Automation', desc: 'Intelligent communication and workflow pipelines' },
  { icon: '⬡', label: 'Data Systems', desc: 'Structuring unorganized data into usable infrastructure' },
  { icon: '⬡', label: 'Operations', desc: 'Reducing manual work in operations-heavy businesses' },
];

function SectionHeader({ number, title }: { number: string; title: string }) {
  return (
    <div className="flex items-center gap-4 mb-12">
      <span className="section-number hidden sm:inline">{number}</span>
      <div className="w-8 h-px hidden sm:block" style={{ background: 'var(--glass-border)' }} />
      <h2
        className="text-3xl lg:text-4xl font-bold"
        style={{ fontFamily: 'var(--font-space-grotesk)', color: 'var(--cream)' }}
      >
        {title}
      </h2>
      <div className="flex-1 h-px" style={{ background: 'var(--glass-border)' }} />
    </div>
  );
}

export default function About() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section id="about" className="relative py-28 lg:pl-20">
      <div className="max-w-6xl mx-auto px-6 lg:px-16">
        <SectionHeader number="01 / ABOUT" title="About Me" />

        <motion.div
          ref={ref}
          initial={{ opacity: 0 }}
          animate={inView ? { opacity: 1 } : {}}
          transition={{ duration: 0.6 }}
          className="grid lg:grid-cols-[1fr_340px] gap-12 lg:gap-20"
        >
          {/* Bio */}
          <div className="space-y-6">
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.1 }}
              className="text-lg leading-relaxed"
              style={{ color: 'var(--cream-muted)', fontFamily: 'var(--font-body)' }}
            >
              I design and build AI-powered systems that solve real business problems — from{' '}
              <span style={{ color: 'var(--cream)' }}>support automation and document intelligence</span>{' '}
              to multi-agent platforms that replace entire workflows. My focus is on production-grade
              systems that work, not experiments that demo well.
            </motion.p>

            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.2 }}
              className="text-lg leading-relaxed"
              style={{ color: 'var(--cream-muted)', fontFamily: 'var(--font-body)' }}
            >
              I&apos;m currently transitioning into AI engineering after years in{' '}
              <span style={{ color: 'var(--gold)' }}>enterprise SaaS</span> — first as a Tier III
              Technical Engineer, then as an Enablement Manager at WalkMe, now acquired by SAP. That
              background gives me something most AI engineers don&apos;t have: I understand how
              enterprise software actually gets used, where it breaks, and what teams need from it.
            </motion.p>

            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: 0.3 }}
              className="text-lg leading-relaxed"
              style={{ color: 'var(--cream-muted)', fontFamily: 'var(--font-body)' }}
            >
              My goal is to build AI systems that close the gap between what&apos;s{' '}
              <span style={{ color: 'var(--cream)' }}>technically possible</span> and what businesses
              can actually use.
            </motion.p>
          </div>

          {/* Terminal-style focus card */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={inView ? { opacity: 1, x: 0 } : {}}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="glass rounded-xl overflow-hidden"
          >
            {/* Card header */}
            <div
              className="px-4 py-3 flex items-center gap-2"
              style={{ borderBottom: '1px solid var(--glass-border)' }}
            >
              <span
                className="text-xs tracking-widest uppercase"
                style={{ fontFamily: 'var(--font-jetbrains-mono)', color: 'var(--gold)' }}
              >
                $ focus.areas
              </span>
            </div>

            {/* Focus items */}
            <div className="p-4 space-y-4">
              {FOCUS_AREAS.map((area, i) => (
                <motion.div
                  key={area.label}
                  initial={{ opacity: 0, x: 12 }}
                  animate={inView ? { opacity: 1, x: 0 } : {}}
                  transition={{ delay: 0.4 + i * 0.1 }}
                  className="flex gap-3"
                >
                  <span style={{ color: 'var(--gold)', fontSize: '0.6rem', marginTop: '4px' }}>
                    {area.icon}
                  </span>
                  <div>
                    <p
                      className="text-sm font-medium mb-0.5"
                      style={{ color: 'var(--cream)', fontFamily: 'var(--font-jetbrains-mono)' }}
                    >
                      {area.label}
                    </p>
                    <p
                      className="text-xs leading-relaxed"
                      style={{ color: 'var(--cream-muted)', fontFamily: 'var(--font-body)' }}
                    >
                      {area.desc}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Status bar */}
            <div
              className="px-4 py-2.5 flex items-center gap-2"
              style={{ borderTop: '1px solid var(--glass-border)' }}
            >
              <span
                className="w-1.5 h-1.5 rounded-full animate-pulse"
                style={{ background: '#28CA41' }}
              />
              <span className="flex flex-col">
                <span
                  className="text-xs"
                  style={{ fontFamily: 'var(--font-jetbrains-mono)', color: 'var(--cream-dim)' }}
                >
                  currently building
                </span>
                <span
                  className="text-xs"
                  style={{ fontFamily: 'var(--font-jetbrains-mono)', color: 'var(--cream)' }}
                >
                  langchain-rag
                </span>
              </span>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
