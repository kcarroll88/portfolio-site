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
    <main className="relative">
      {/* Background */}
      <ParticleCanvas />

      {/* Navigation */}
      <Navigation />

      {/* Sections */}
      <Hero />
      <About />
      <Projects />
      <Experience />
      <Skills />
      <Contact />
    </main>
  );
}
