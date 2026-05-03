import { useEffect, useRef, useState } from 'react';
import { Box } from './components/Box';
import { P5Home } from './components/P5Home';
import { ArtSection } from './sections/ArtSection';
import { MusicSection } from './sections/MusicSection';
import { SoftwareSection } from './sections/SoftwareSection';

type SectionId = 'home' | 'software' | 'creative' | 'music';

const sections = {
  software: {
    label: 'software',
  },
  creative: {
    label: 'art',
  },
  music: {
    label: 'music',
  },
} satisfies Record<Exclude<SectionId, 'home'>, {
  label: string;
}>;

const sectionLinks = Object.entries(sections) as Array<
  [Exclude<SectionId, 'home'>, (typeof sections)[Exclude<SectionId, 'home'>]]
>;

const homeItems = sectionLinks.map(([id, item]) => ({ id, label: item.label }));

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
      case 'software':
        return <SoftwareSection onBack={() => navigate('home')} />;
      case 'creative':
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
        className={`intro ${section === 'home' ? 'home-intro' : 'page-intro'} ${
          isFading ? 'intro-fading' : ''
        }`}
      >
        {section === 'home' ? (
          <P5Home items={homeItems} onNavigate={navigate} />
        ) : (
          renderSection()
        )}
      </Box>
    </main>
  );
}
