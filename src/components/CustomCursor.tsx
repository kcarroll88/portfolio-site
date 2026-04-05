'use client';

import { useEffect, useRef } from 'react';

export default function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    const dot = dotRef.current;
    const ring = ringRef.current;
    if (!dot || !ring) return;

    let mouseX = 0;
    let mouseY = 0;
    let ringX = 0;
    let ringY = 0;
    let raf: number;

    const onMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      dot.style.transform = `translate(${mouseX - 4}px, ${mouseY - 4}px)`;
    };

    const animateRing = () => {
      ringX += (mouseX - ringX) * 0.12;
      ringY += (mouseY - ringY) * 0.12;
      ring.style.transform = `translate(${ringX - 20}px, ${ringY - 20}px)`;
      raf = requestAnimationFrame(animateRing);
    };

    const onMouseEnterLink = () => {
      ring.style.width = '48px';
      ring.style.height = '48px';
      ring.style.borderColor = 'rgba(201, 150, 58, 0.8)';
      ring.style.marginTop = '-4px';
      ring.style.marginLeft = '-4px';
    };

    const onMouseLeaveLink = () => {
      ring.style.width = '40px';
      ring.style.height = '40px';
      ring.style.borderColor = 'rgba(201, 150, 58, 0.4)';
      ring.style.marginTop = '0';
      ring.style.marginLeft = '0';
    };

    const addLinkListeners = () => {
      document
        .querySelectorAll('a, button, [data-cursor="pointer"]')
        .forEach((el) => {
          el.addEventListener('mouseenter', onMouseEnterLink);
          el.addEventListener('mouseleave', onMouseLeaveLink);
        });
    };

    window.addEventListener('mousemove', onMouseMove);
    animateRing();
    addLinkListeners();

    const observer = new MutationObserver(addLinkListeners);
    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      cancelAnimationFrame(raf);
      observer.disconnect();
    };
  }, []);

  return (
    <>
      {/* Small dot */}
      <div
        ref={dotRef}
        className="fixed top-0 left-0 w-2 h-2 rounded-full bg-gold pointer-events-none z-[9999] will-change-transform"
        style={{ backgroundColor: 'var(--gold)' }}
      />
      {/* Lagging ring */}
      <div
        ref={ringRef}
        className="fixed top-0 left-0 w-10 h-10 rounded-full pointer-events-none z-[9998] will-change-transform transition-[width,height,border-color] duration-200"
        style={{
          border: '1px solid rgba(201, 150, 58, 0.4)',
        }}
      />
    </>
  );
}
