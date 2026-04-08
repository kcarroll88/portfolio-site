'use client';

import { motion, useInView } from 'framer-motion';
import { useRef, useState } from 'react';

interface Project {
  name: string;
  tagline: string;
  description: string;
  stack: string[];
  link?: string;
  password?: string;
  status: 'live' | 'in-progress' | 'complete';
  featured?: boolean;
}

const PROJECTS: Project[] = [
  {
    name: 'Apex CRM Sales Intelligence',
    tagline: 'RAG-Powered Competitive Intelligence Agent',
    description:
      'A hybrid RAG sales assistant built with LangChain and Claude. Answers competitive questions by searching internal battlecards and playbooks, live web data, or both — depending on what the question needs. Uses a ReAct agent to reason step-by-step and pick the right tool for each query. Includes an LLM-as-judge eval suite scoring answers on relevance, groundedness, and completeness.',
    stack: ['Python', 'LangChain', 'Anthropic Claude', 'Voyage AI', 'ChromaDB', 'Tavily', 'Streamlit', 'Docker', 'Railway'],
    link: 'https://apex-sales-intel-production.up.railway.app',
    password: 'apex2026',
    status: 'live',
    featured: true,
  },
  {
    name: 'Valletta Command Center',
    tagline: 'Full-Stack Band Management Platform',
    description:
      'A purpose-built command center for a real working rock band — replacing scattered Google Docs, spreadsheets, and group chats with a single integrated system. Features 12 AI personas (band manager, publicist, booking agent, finance specialist, and more) with distinct personalities and live write access to the database. Syncs from Google Calendar, Spotify, Square, YouTube, Instagram, and Discord. Includes a Felix Discord bot that consults the full AI team mid-conversation.',
    stack: ['FastAPI', 'React', 'SQLite', 'Anthropic Claude', 'Discord.py', 'Google APIs', 'Square API', 'Spotify API', 'SSE'],
    link: 'https://github.com/kcarroll88/valletta-app',
    status: 'live',
  },
  {
    name: 'Meridian Analytics Intelligence Assistant',
    tagline: 'Dual-Source ReAct Research Agent',
    description:
      'An AI research assistant that routes natural language queries to internal documents or live web search — automatically. Built on the ReAct agent pattern with a visual reasoning trace so you can follow every thought, action, and observation in real time. Combines Voyage AI semantic search over a ChromaDB knowledge base with Tavily web retrieval in a single query.',
    stack: ['Python', 'LangChain', 'Anthropic Claude', 'Voyage AI', 'ChromaDB', 'Tavily', 'Streamlit'],
    link: 'https://github.com/kcarroll88/meridian-ops-intel',
    status: 'live',
  },
  {
    name: 'Nexus Support Assistant',
    tagline: 'RAG-Powered Knowledge Base Q&A',
    description:
      'A support tool that answers questions by searching a knowledge base of PDF documents. Loads docs into a vector database, finds relevant chunks via semantic search, and generates concise answers using Claude — with full source attribution. Built with LangChain, Chroma, Voyage AI embeddings, and Streamlit.',
    stack: ['Python', 'LangChain', 'Anthropic Claude', 'Voyage AI', 'ChromaDB', 'Streamlit', 'pypdf'],
    link: 'https://nexus-support-assistant-azq3guy4xvxbpnpyacswuq.streamlit.app',
    status: 'live',
  },
  {
    name: 'RAG Document Chat',
    tagline: 'AI-Powered Document Q&A',
    description:
      'A production-style Retrieval Augmented Generation system that lets users upload a PDF and ask natural language questions — getting answers grounded exclusively in their document. No hallucination, no out-of-scope responses. Demonstrates the RAG pattern powering the next generation of B2B AI features.',
    stack: ['Python', 'Anthropic Claude', 'Voyage AI', 'ChromaDB', 'Streamlit', 'pypdf'],
    link: 'https://kcarroll-ai.streamlit.app',
    status: 'live',
  },
];

const STATUS_STYLES = {
  live: { dot: '#28CA41', label: 'Live' },
  'in-progress': { dot: '#FFBD2E', label: 'In Progress' },
  complete: { dot: 'var(--gold)', label: 'Complete' },
};

function FeaturedProject({ project }: { project: Project }) {
  return (
    <div
      className="glass rounded-xl p-8 lg:p-10 relative overflow-hidden group transition-all duration-500"
      style={{ border: '1px solid rgba(201, 150, 58, 0.25)' }}
    >
      {/* Background accent */}
      <div
        className="absolute top-0 right-0 w-64 h-64 rounded-full blur-3xl pointer-events-none transition-opacity duration-500 opacity-10 group-hover:opacity-20"
        style={{ background: 'var(--gold)', transform: 'translate(30%, -30%)' }}
      />

      <div className="grid lg:grid-cols-[1fr_auto] gap-8 items-start relative z-10">
        <div>
          <div className="flex items-center gap-3 mb-3">
            <span
              className="text-xs tracking-widest uppercase"
              style={{ fontFamily: 'var(--font-jetbrains-mono)', color: 'var(--gold)' }}
            >
              Featured Project
            </span>
          </div>
          <h3
            className="text-3xl lg:text-4xl font-bold mb-2"
            style={{ fontFamily: 'var(--font-space-grotesk)', color: 'var(--cream)' }}
          >
            {project.name}
          </h3>
          <p
            className="text-base mb-4"
            style={{ fontFamily: 'var(--font-jetbrains-mono)', color: 'var(--gold)' }}
          >
            {project.tagline}
          </p>
          <p
            className="text-base leading-relaxed max-w-xl"
            style={{ color: 'var(--cream-muted)', fontFamily: 'var(--font-body)' }}
          >
            {project.description}
          </p>
        </div>

        <div className="flex flex-col items-end gap-4">
          {/* Status */}
          <div className="flex items-center gap-2">
            <span
              className="w-2 h-2 rounded-full animate-pulse"
              style={{ background: STATUS_STYLES[project.status].dot }}
            />
            <span
              className="text-xs"
              style={{ fontFamily: 'var(--font-jetbrains-mono)', color: 'var(--cream-muted)' }}
            >
              {STATUS_STYLES[project.status].label}
            </span>
          </div>

          {/* Link */}
          {project.link && (
            <a
              href={project.link}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary flex items-center gap-2"
            >
              Visit
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-3.5 h-3.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 19.5l15-15m0 0H8.25m11.25 0v11.25" />
              </svg>
            </a>
          )}

          {/* Password */}
          {project.password && (
            <div className="text-right">
              <span
                className="text-xs tracking-widest uppercase block mb-1"
                style={{ fontFamily: 'var(--font-jetbrains-mono)', color: 'var(--cream-muted)' }}
              >
                Demo password
              </span>
              <span
                className="text-sm px-3 py-1 rounded"
                style={{
                  fontFamily: 'var(--font-jetbrains-mono)',
                  color: 'var(--gold)',
                  background: 'rgba(201, 150, 58, 0.1)',
                  border: '1px solid rgba(201, 150, 58, 0.2)',
                }}
              >
                {project.password}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Stack */}
      <div className="flex flex-wrap gap-2 mt-6 relative z-10">
        {project.stack.map((tech) => (
          <span key={tech} className="tag">{tech}</span>
        ))}
      </div>
    </div>
  );
}

function ProjectCard({ project, index }: { project: Project; index: number }) {
  const [hovered, setHovered] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ delay: index * 0.1 }}
      className="glass rounded-xl p-6 flex flex-col gap-4 group transition-all duration-300 relative overflow-hidden"
      style={{
        border: hovered ? '1px solid rgba(201, 150, 58, 0.3)' : '1px solid var(--glass-border-subtle)',
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Top row */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span
              className="w-1.5 h-1.5 rounded-full"
              style={{ background: STATUS_STYLES[project.status].dot }}
            />
            <span
              className="text-xs"
              style={{ fontFamily: 'var(--font-jetbrains-mono)', color: 'var(--cream-dim)', fontSize: '0.65rem' }}
            >
              {STATUS_STYLES[project.status].label}
            </span>
          </div>
          <h3
            className="text-xl font-bold"
            style={{ fontFamily: 'var(--font-space-grotesk)', color: 'var(--cream)' }}
          >
            {project.name}
          </h3>
          <p
            className="text-xs mt-1"
            style={{ fontFamily: 'var(--font-jetbrains-mono)', color: 'var(--gold)' }}
          >
            {project.tagline}
          </p>
        </div>

        {project.link && (
          <a
            href={project.link}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-shrink-0 transition-colors duration-200 mt-1"
            style={{ color: hovered ? 'var(--gold)' : 'var(--cream-dim)' }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 19.5l15-15m0 0H8.25m11.25 0v11.25" />
            </svg>
          </a>
        )}
      </div>

      <p
        className="text-sm leading-relaxed flex-1"
        style={{ color: 'var(--cream-muted)', fontFamily: 'var(--font-body)' }}
      >
        {project.description}
      </p>

      <div className="flex flex-wrap gap-1.5">
        {project.stack.map((tech) => (
          <span key={tech} className="tag" style={{ fontSize: '0.65rem', padding: '0.2rem 0.5rem' }}>
            {tech}
          </span>
        ))}
      </div>
    </motion.div>
  );
}

export default function Projects() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });
  const featured = PROJECTS.find((p) => p.featured)!;
  const rest = PROJECTS.filter((p) => !p.featured);

  return (
    <section id="projects" className="relative py-28 lg:pl-20">
      <div className="max-w-6xl mx-auto px-6 lg:px-16">
        <div className="flex items-center gap-4 mb-12">
          <span className="section-number hidden sm:inline">02 / PROJECTS</span>
          <div className="w-8 h-px hidden sm:block" style={{ background: 'var(--glass-border)' }} />
          <h2
            className="text-3xl lg:text-4xl font-bold"
            style={{ fontFamily: 'var(--font-space-grotesk)', color: 'var(--cream)' }}
          >
            What I&apos;ve Built
          </h2>
          <div className="flex-1 h-px" style={{ background: 'var(--glass-border)' }} />
        </div>

        <motion.div
          ref={ref}
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
          className="mb-10"
        >
          <FeaturedProject project={featured} />
        </motion.div>

        <div className="grid md:grid-cols-2 gap-6">
          {rest.map((project, i) => (
            <ProjectCard key={project.name} project={project} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
