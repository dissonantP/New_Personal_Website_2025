import { useCallback, useEffect, useRef, useState } from 'react';
import { Box } from './components/Box';
import { P5Home } from './components/P5Home';
import { ArtSection } from './sections/ArtSection';
import { PortfolioSection } from './sections/PortfolioSection';
import { MusicSection } from './sections/MusicSection';
import { ServicesSection } from './sections/ServicesSection';
import type { SiteSectionId } from './navigation/types';

const SECTION_PATHS: Record<SiteSectionId, string> = {
  home: '/',
  portfolio: '/portfolio',
  services: '/services',
  art: '/art',
  music: '/music',
};

function getSectionFromPath(pathname: string): SiteSectionId {
  const match = Object.entries(SECTION_PATHS).find(([, path]) => path === pathname);

  return (match?.[0] as SiteSectionId | undefined) ?? 'home';
}

export function App() {
  const [section, setSection] = useState<SiteSectionId>(() => getSectionFromPath(window.location.pathname));
  const [isFading, setIsFading] = useState(false);
  const timeoutRef = useRef<number | null>(null);

  useEffect(() => {
    function handlePopState() {
      setSection(getSectionFromPath(window.location.pathname));
      setIsFading(false);
    }

    window.addEventListener('popstate', handlePopState);

    return () => {
      window.removeEventListener('popstate', handlePopState);
      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const navigate = useCallback((nextSection: SiteSectionId) => {
    if (nextSection === section) {
      return;
    }

    setIsFading(true);
    timeoutRef.current = window.setTimeout(() => {
      setSection(nextSection);
      setIsFading(false);
      window.history.pushState(null, '', SECTION_PATHS[nextSection]);
    }, 220);
  }, [section]);

  function renderSection() {
    switch (section) {
      case 'portfolio':
        return <PortfolioSection onNavigate={navigate} />;
      case 'services':
        return <ServicesSection onNavigate={navigate} />;
      case 'art':
        return <ArtSection onBack={() => navigate('home')} />;
      case 'music':
        return <MusicSection onBack={() => navigate('home')} />;
      default:
        return null;
    }
  }

  return (
    <main className="app-shell">
      <Box
        className={`intro ${section === 'home' ? 'home-intro' : 'scene-intro'} ${
          isFading ? 'intro-fading' : ''
        }`}
      >
        {section === 'home' ? <P5Home onNavigate={navigate} /> : renderSection()}
      </Box>
    </main>
  );
}
