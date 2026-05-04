import { useEffect, useRef, useState } from 'react';
import { Box } from './components/Box';
import { P5Home } from './components/P5Home';
import { ServicesSection } from './sections/ServicesSection';
import { SoftwareSection } from './sections/SoftwareSection';

type SectionId = 'home' | 'portfolio' | 'services';

export function App() {
  const [section, setSection] = useState<SectionId>('home');
  const [isFading, setIsFading] = useState(false);
  const timeoutRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        window.clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  function navigate(nextSection: SectionId) {
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
        return <SoftwareSection onBack={() => navigate('home')} title="Portfolio" />;
      case 'services':
        return <ServicesSection onBack={() => navigate('home')} />;
      default:
        return null;
    }
  }

  return (
    <main className="app-shell">
      <Box
        className={`intro ${section === 'home' ? 'home-intro' : 'page-intro'} ${
          isFading ? 'intro-fading' : ''
        }`}
      >
        {section === 'home' ? (
          <P5Home onNavigate={navigate} />
        ) : (
          renderSection()
        )}
      </Box>
    </main>
  );
}
