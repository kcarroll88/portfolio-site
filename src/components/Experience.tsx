'use client';

import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';

const EXPERIENCE = [
  {
    role: 'Independent AI Builder & Product Developer',
    company: 'Self',
    period: '2023 — Present',
    type: 'current',
    description:
      'Design and ship AI-powered systems for real-world business operations. Building tools across real estate, construction, civic tech, and communication automation. Focus on production-grade systems — not demos.',
    highlights: [
      'Shipped Dwello, a landlord SaaS platform with AI-assisted workflows',
      'Built automated communication pipelines processing SMS/email with LLM intent extraction',
      'Developing construction operations platform with multi-agent task coordination',
    ],
  },
  {
    role: 'Enablement Manager',
    company: 'Technology Sector',
    period: '2022 — Present',
    type: 'current',
    description:
      'Manages internal and external enablement programs in a technology environment. Developing systems thinking and cross-functional coordination skills that directly inform how I design AI workflows today.',
    highlights: [
      'Cross-functional program management and stakeholder alignment',
      'Systems design and process documentation at scale',
      'Technology adoption and training program delivery',
    ],
  },
  {
    role: 'Tier III Technical Engineer',
    company: 'Technology Sector',
    period: '2020 — 2022',
    type: 'past',
    description:
      'Handled complex escalations and deep technical troubleshooting as the final tier of support. Built a strong foundation in diagnosing systems at the code and infrastructure level — experience that directly shapes how I approach building and debugging AI systems today.',
    highlights: [
      'Owned resolution of high-complexity technical escalations',
      'Developed deep product knowledge across multiple system layers',
      'Collaborated cross-functionally with engineering to surface and resolve recurring issues',
    ],
  },
];

export default function Experience() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section id="experience" className="relative py-28 lg:pl-20">
      <div className="max-w-6xl mx-auto px-6 lg:px-16">
        <div className="flex items-center gap-4 mb-12">
          <span className="section-number hidden sm:inline">03 / EXPERIENCE</span>
          <div className="w-8 h-px hidden sm:block" style={{ background: 'var(--glass-border)' }} />
          <h2
            className="text-3xl lg:text-4xl font-bold"
            style={{ fontFamily: 'var(--font-space-grotesk)', color: 'var(--cream)' }}
          >
            Where I&apos;ve Been
          </h2>
          <div className="flex-1 h-px" style={{ background: 'var(--glass-border)' }} />
        </div>

        <div ref={ref} className="relative">
          {/* Timeline line */}
          <div
            className="absolute left-0 top-2 bottom-2 w-px hidden lg:block"
            style={{ background: 'var(--glass-border)' }}
          />

          <div className="space-y-12">
            {EXPERIENCE.map((exp, i) => (
              <motion.div
                key={exp.role}
                initial={{ opacity: 0, x: -20 }}
                animate={inView ? { opacity: 1, x: 0 } : {}}
                transition={{ delay: i * 0.15, duration: 0.5 }}
                className="lg:pl-10 relative"
              >
                {/* Timeline dot */}
                <div
                  className="absolute -left-1.5 top-2 w-3 h-3 rounded-full hidden lg:block"
                  style={{
                    background: exp.type === 'current' ? 'var(--gold)' : 'var(--navy-700)',
                    border: '2px solid var(--gold)',
                  }}
                />

                <div className="glass rounded-xl p-6 lg:p-8">
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-4">
                    <div>
                      <h3
                        className="text-xl font-bold mb-1"
                        style={{ fontFamily: 'var(--font-space-grotesk)', color: 'var(--cream)' }}
                      >
                        {exp.role}
                      </h3>
                      <p
                        className="text-sm"
                        style={{ fontFamily: 'var(--font-jetbrains-mono)', color: 'var(--gold)' }}
                      >
                        {exp.company}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {exp.type === 'current' && (
                        <span
                          className="w-1.5 h-1.5 rounded-full animate-pulse"
                          style={{ background: '#28CA41' }}
                        />
                      )}
                      <span
                        className="text-xs"
                        style={{
                          fontFamily: 'var(--font-jetbrains-mono)',
                          color: 'var(--cream-muted)',
                        }}
                      >
                        {exp.period}
                      </span>
                    </div>
                  </div>

                  <p
                    className="text-sm leading-relaxed mb-5"
                    style={{ color: 'var(--cream-muted)', fontFamily: 'var(--font-body)' }}
                  >
                    {exp.description}
                  </p>

                  <ul className="space-y-2">
                    {exp.highlights.map((h) => (
                      <li key={h} className="flex gap-3 text-sm">
                        <span style={{ color: 'var(--gold)', flexShrink: 0, marginTop: '2px' }}>
                          ▸
                        </span>
                        <span style={{ color: 'var(--cream-muted)', fontFamily: 'var(--font-body)' }}>
                          {h}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
