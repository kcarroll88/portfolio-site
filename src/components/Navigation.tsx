'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const NAV_ITEMS = [
  { id: 'hero', label: 'Home' },
  { id: 'about', label: 'About' },
  { id: 'projects', label: 'Projects' },
  { id: 'experience', label: 'Experience' },
  { id: 'skills', label: 'Skills' },
  { id: 'contact', label: 'Contact' },
];

const SOCIAL_LINKS = [
  {
    label: 'GitHub',
    href: 'https://github.com/kcarroll88',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
        <path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0 1 12 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" />
      </svg>
    ),
  },
  {
    label: 'LinkedIn',
    href: 'https://www.linkedin.com/in/keenanacarroll/',
    icon: (
      <svg viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 0 1-2.063-2.065 2.064 2.064 0 1 1 2.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
      </svg>
    ),
  },
  {
    label: 'Email',
    href: 'mailto:hello@keenancarroll.com',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="w-4 h-4">
        <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
      </svg>
    ),
  },
];

export default function Navigation() {
  const [activeSection, setActiveSection] = useState('hero');
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { rootMargin: '-40% 0px -40% 0px', threshold: 0 }
    );

    NAV_ITEMS.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    const getScrollTop = () => {
      const el = document.getElementById('scroll-root');
      return el ? el.scrollTop : window.scrollY;
    };
    const onScroll = () => setVisible(getScrollTop() > 80);
    const scrollEl = document.getElementById('scroll-root') ?? window;
    scrollEl.addEventListener('scroll', onScroll);

    return () => {
      observer.disconnect();
      scrollEl.removeEventListener('scroll', onScroll);
    };
  }, []);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    setMobileOpen(false);
  };

  return (
    <>
      {/* Desktop sidebar */}
      <motion.nav
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: visible ? 1 : 0, x: visible ? 0 : -20 }}
        transition={{ duration: 0.4 }}
        className="fixed left-0 top-0 h-full z-50 hidden lg:flex flex-col items-center justify-between py-10 px-6 w-20"
        aria-label="Primary navigation"
      >
        {/* Initials */}
        <button
          onClick={() => scrollTo('hero')}
          className="font-sans font-bold text-lg text-gold tracking-widest"
          style={{ color: 'var(--gold)' }}
        >
          KC
        </button>

        {/* Section dots */}
        <div className="flex flex-col items-center gap-6">
          {NAV_ITEMS.map(({ id, label }) => (
            <div
              key={id}
              className="relative flex items-center"
              onMouseEnter={() => setHoveredItem(id)}
              onMouseLeave={() => setHoveredItem(null)}
            >
              <button
                onClick={() => scrollTo(id)}
                className="w-2 h-2 rounded-full transition-all duration-300 flex-shrink-0"
                style={{
                  backgroundColor:
                    activeSection === id
                      ? 'var(--gold)'
                      : 'var(--cream-dim)',
                  transform: activeSection === id ? 'scale(1.5)' : 'scale(1)',
                }}
                aria-label={`Navigate to ${label}`}
              />
              <AnimatePresence>
                {hoveredItem === id && (
                  <motion.span
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -8 }}
                    transition={{ duration: 0.15 }}
                    className="absolute left-5 whitespace-nowrap font-mono text-xs text-cream-muted pointer-events-none"
                    style={{
                      color: 'var(--cream-muted)',
                      fontFamily: 'var(--font-jetbrains-mono)',
                      fontSize: '0.7rem',
                      letterSpacing: '0.1em',
                    }}
                  >
                    {label}
                  </motion.span>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>

        {/* Social links */}
        <div className="flex flex-col items-center gap-4">
          {SOCIAL_LINKS.map(({ label, href, icon }) => (
            <a
              key={label}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={label}
              className="transition-colors duration-200"
              style={{ color: 'var(--cream-dim)' }}
              onMouseEnter={(e) =>
                (e.currentTarget.style.color = 'var(--gold)')
              }
              onMouseLeave={(e) =>
                (e.currentTarget.style.color = 'var(--cream-dim)')
              }
            >
              {icon}
            </a>
          ))}
          <div
            className="w-px h-12 mt-2"
            style={{ backgroundColor: 'var(--glass-border)' }}
          />
        </div>
      </motion.nav>

      {/* Mobile top bar — wrapper clips content at viewport top edge */}
      <div
        className="fixed top-0 left-0 right-0 z-50 lg:hidden"
        style={{ overflow: 'hidden' }}
      >
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: visible ? 1 : 0 }}
          className="px-6 flex items-center justify-between"
          style={{
            background: 'linear-gradient(to bottom, rgba(11, 31, 58, 1) 0%, rgba(11, 31, 58, 0.95) 35%, rgba(11, 31, 58, 0.6) 70%, rgba(11, 31, 58, 0.35) 100%)',
            backdropFilter: 'blur(14px)',
            WebkitBackdropFilter: 'blur(14px)',
            borderBottom: '1px solid var(--glass-border)',
            paddingTop: 'calc(env(safe-area-inset-top, 0px) + 1rem)',
            paddingBottom: '1rem',
          }}
        >
        <button
          onClick={() => scrollTo('hero')}
          className="font-sans font-bold text-base tracking-widest"
          style={{ color: 'var(--gold)' }}
        >
          KC
        </button>
        <button
          onClick={() => setMobileOpen((v) => !v)}
          className="flex flex-col gap-1.5 p-1"
          aria-label="Toggle menu"
        >
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="block w-5 h-px transition-all duration-300"
              style={{
                backgroundColor: 'var(--cream)',
                transform:
                  mobileOpen && i === 0
                    ? 'rotate(45deg) translateY(6px)'
                    : mobileOpen && i === 2
                    ? 'rotate(-45deg) translateY(-6px)'
                    : mobileOpen && i === 1
                    ? 'scaleX(0)'
                    : 'none',
              }}
            />
          ))}
        </button>
        </motion.div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-14 left-0 right-0 z-40 glass lg:hidden px-6 py-6"
          >
            {NAV_ITEMS.map(({ id, label }) => (
              <button
                key={id}
                onClick={() => scrollTo(id)}
                className="block w-full text-left py-3 font-mono text-sm border-b transition-colors duration-200"
                style={{
                  fontFamily: 'var(--font-jetbrains-mono)',
                  color:
                    activeSection === id
                      ? 'var(--gold)'
                      : 'var(--cream-muted)',
                  borderColor: 'var(--glass-border-subtle)',
                }}
              >
                {label}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
