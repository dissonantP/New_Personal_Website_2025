import { useEffect, useRef, useState } from 'react';
import { Box } from './components/Box';
import { P5Home } from './components/P5Home';
import { ArtSection } from './sections/ArtSection';
import { PortfolioSection } from './sections/PortfolioSection';
import { MusicSection } from './sections/MusicSection';
import { ServicesSection } from './sections/ServicesSection';
import type { SiteSectionId } from './navigation/types';

export function App() {
  const [section, setSection] = useState<SiteSectionId>('home');
  const [isFading, setIsFading] = useState(false);
  const timeoutRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  function navigate(nextSection: SiteSectionId) {
    if (nextSection === section) {
      return;
    }

    setIsFading(true);
    timeoutRef.current = window.setTimeout(() => {
      setSection(nextSection);
      setIsFading(false);
    }, 220);
  }

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
