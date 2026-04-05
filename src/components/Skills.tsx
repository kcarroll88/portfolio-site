'use client';

import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';

const SKILL_GROUPS = [
  {
    category: 'AI & ML',
    icon: '⬡',
    skills: [
      'Large Language Models',
      'AI Agents',
      'Multi-Agent Systems',
      'Prompt Engineering',
      'RAG (Retrieval-Augmented Generation)',
      'Vector Embeddings',
      'Semantic Search',
      'OpenAI API',
      'Anthropic / Claude API',
    ],
  },
  {
    category: 'Automation & Integration',
    icon: '⬡',
    skills: [
      'Make (Integromat)',
      'Webhook Architecture',
      'Workflow Automation',
      'Twilio (SMS/Voice)',
      'API Integrations',
      'Event-Driven Systems',
      'Data Pipelines',
    ],
  },
  {
    category: 'Systems Design',
    icon: '⬡',
    skills: [
      'AI Systems Architecture',
      'Automation Architecture',
      'Data Structuring',
      'Workflow Optimization',
      'Process Mapping',
      'Rapid Prototyping',
      'Product Thinking',
    ],
  },
  {
    category: 'Development',
    icon: '⬡',
    skills: [
      'Python',
      'Next.js',
      'TypeScript',
      'Supabase',
      'SQLite',
      'ChromaDB',
      'Git',
      'REST APIs',
      'Database Design',
      'Full-Stack Prototyping',
    ],
  },
];

export default function Skills() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section id="skills" className="relative py-28 lg:pl-20">
      <div className="max-w-6xl mx-auto px-6 lg:px-16">
        <div className="flex items-center gap-4 mb-12">
          <span className="section-number hidden sm:inline">04 / SKILLS</span>
          <div className="w-8 h-px hidden sm:block" style={{ background: 'var(--glass-border)' }} />
          <h2
            className="text-3xl lg:text-4xl font-bold"
            style={{ fontFamily: 'var(--font-space-grotesk)', color: 'var(--cream)' }}
          >
            What I Work With
          </h2>
          <div className="flex-1 h-px" style={{ background: 'var(--glass-border)' }} />
        </div>

        <div ref={ref} className="grid md:grid-cols-2 gap-6">
          {SKILL_GROUPS.map((group, gi) => (
            <motion.div
              key={group.category}
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ delay: gi * 0.1, duration: 0.5 }}
              className="glass rounded-xl overflow-hidden"
            >
              <div
                className="px-5 py-4 flex items-center gap-2"
                style={{ borderBottom: '1px solid var(--glass-border)' }}
              >
                <span
                  style={{ color: 'var(--gold)', fontSize: '0.6rem' }}
                >
                  {group.icon}
                </span>
                <span
                  className="text-xs tracking-widest uppercase"
                  style={{ fontFamily: 'var(--font-jetbrains-mono)', color: 'var(--gold)' }}
                >
                  {group.category}
                </span>
              </div>
              <div className="p-5">
                <div className="flex flex-wrap gap-2">
                  {group.skills.map((skill, si) => (
                    <motion.span
                      key={skill}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={inView ? { opacity: 1, scale: 1 } : {}}
                      transition={{ delay: gi * 0.1 + si * 0.03 }}
                      className="tag"
                    >
                      {skill}
                    </motion.span>
                  ))}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
