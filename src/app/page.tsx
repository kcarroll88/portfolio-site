import ParticleCanvas from '@/components/ParticleCanvas';
import Navigation from '@/components/Navigation';
import Hero from '@/components/Hero';
import About from '@/components/About';
import Projects from '@/components/Projects';
import Experience from '@/components/Experience';
import Skills from '@/components/Skills';
import Contact from '@/components/Contact';

export default function Home() {
  return (
    <>
      <Navigation />

      {/* On mobile: fixed scroll container with clip-path locks the clipping boundary
          to the viewport regardless of scroll position */}
      <div id="scroll-root">
        <main className="relative">
          <ParticleCanvas />
          <Hero />
          <About />
          <Projects />
          <Experience />
          <Skills />
          <Contact />
        </main>
      </div>
    </>
  );
}
