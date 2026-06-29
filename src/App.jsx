import { lazy, Suspense, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import Hero from './components/Hero';
import AtTheMomentBar from './components/AtTheMomentBar';
import AboutSection from './components/AboutSection';
import ArtworksSection from './components/ArtworksSection';
import ProjectsSection from './components/ProjectsSection';
import VideosSection from './components/VideosSection';
import CoreSection from './components/CoreSection';
import LanguagesSection from './components/LanguagesSection';
import ClientsMarquee from './components/ClientsMarquee';
import ContactSection from './components/ContactSection';
import ProfileLogo from './components/ProfileLogo';
import LoadingScreen from './components/LoadingScreen';
import { useSectionDepthOfField } from './hooks/useSectionDepthOfField';

// The journey is a heavy WebGL experience — lazy-load it so its bundle (three +
// R3F + the DeLorean) only downloads when the visitor enters #journey.
const JourneyPage = lazy(() => import('./journey/JourneyPage'));
// Project case studies — their own routed pages at #project/<slug>.
const ProjectPage = lazy(() => import('./components/ProjectPage'));

const BLUR_TRANSITION = { duration: 0.42, ease: [0.16, 1, 0.3, 1] };

export default function App() {
  // Site-wide depth of field: the section filling the viewport is sharp, the
  // rest blur with distance. (Re-enabled by request.)
  useSectionDepthOfField();

  // Hash route: "My Journey" -> #journey, project pages -> #project/<slug>.
  const [hash, setHash] = useState(() => (typeof window !== 'undefined' ? window.location.hash : ''));
  useEffect(() => {
    const onHash = () => setHash(window.location.hash);
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);
  const journeyOpen = hash === '#journey';
  const projectSlug = hash.startsWith('#project/') ? decodeURIComponent(hash.slice('#project/'.length)) : null;
  const overlayOpen = journeyOpen || !!projectSlug;
  const exitJourney = () => {
    // drop the fragment without a scroll jump or extra history entry
    history.replaceState(null, '', window.location.pathname + window.location.search);
    setHash('');
  };

  return (
    <>
      {/* Main site — hidden (and its videos/WebGL paused) while an overlay runs */}
      <div style={overlayOpen ? { display: 'none' } : undefined}>
        <LoadingScreen />
        <main className="min-h-screen w-full bg-ink text-white">
          <Hero />
          <AtTheMomentBar />
          <AboutSection />
          <ArtworksSection />
          <ProjectsSection />
          <VideosSection />
          <CoreSection />
          <LanguagesSection />
          <ClientsMarquee />
          <ContactSection />
        </main>
        {/* Persistent top-left AN. logo — morphs to a profile card on hover */}
        <ProfileLogo />
      </div>

      <AnimatePresence>
        {journeyOpen && (
          <motion.div
            key="journey"
            className="fixed inset-0 z-[200]"
            initial={{ opacity: 0, filter: 'blur(28px)' }}
            animate={{ opacity: 1, filter: 'blur(0px)' }}
            exit={{ opacity: 0, filter: 'blur(28px)' }}
            transition={BLUR_TRANSITION}
          >
            <Suspense fallback={<div className="fixed inset-0 bg-[#0a0a1f]" />}>
              <JourneyPage onExit={exitJourney} />
            </Suspense>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Project case-study pages — fast blur transition, keyed per slug so
          project-to-project navigation also wipes through a motion blur */}
      <AnimatePresence mode="wait">
        {projectSlug && (
          <motion.div
            key={`project-${projectSlug}`}
            className="relative z-[200]"
            initial={{ opacity: 0, filter: 'blur(26px)' }}
            animate={{ opacity: 1, filter: 'blur(0px)' }}
            exit={{ opacity: 0, filter: 'blur(26px)' }}
            transition={BLUR_TRANSITION}
          >
            <Suspense fallback={<div className="fixed inset-0 bg-ink" />}>
              <ProjectPage slug={projectSlug} />
            </Suspense>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
