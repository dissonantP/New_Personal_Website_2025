import { useEffect, useRef, useState } from 'react';
import { Box } from './components/Box';
import { BigHeader } from './components/BigHeader';
import { Link } from './components/Link';
import { SmallHeader } from './components/SmallHeader';

type SectionId = 'home' | 'software' | 'creative' | 'music';

const sections = {
  software: {
    label: 'Software Development',
    title: 'Software Development',
    body: 'Professional software work, engineering systems, and applied product development.',
  },
  creative: {
    label: 'Creative Technology',
    title: 'Creative Technology',
    body: 'Experimental interfaces, interactive media, and technology-led creative work.',
  },
  music: {
    label: 'Music',
    title: 'Music',
    body: 'Original music, performance projects, and sound-focused work.',
  },
} satisfies Record<Exclude<SectionId, 'home'>, {
  label: string;
  title: string;
  body: string;
}>;

const sectionLinks = Object.entries(sections) as Array<
  [Exclude<SectionId, 'home'>, (typeof sections)[Exclude<SectionId, 'home'>]]
>;

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

  return (
    <main className="app-shell">
      <Box className={`intro ${isFading ? 'intro-fading' : ''}`}>
        {section === 'home' ? (
          <>
            <BigHeader className="home-title">MAX PLEANER</BigHeader>
            <nav className="section-nav" aria-label="Website sections">
              {sectionLinks.map(([id, item]) => (
                <Link
                  href={`#${id}`}
                  key={id}
                  onClick={(event) => {
                    event.preventDefault();
                    navigate(id);
                  }}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </>
        ) : (
          <>
            <SmallHeader>MAX PLEANER</SmallHeader>
            <BigHeader>{sections[section].title}</BigHeader>
            <p>{sections[section].body}</p>
            <nav className="section-nav section-nav-secondary" aria-label="Website sections">
              <Link
                href="#"
                onClick={(event) => {
                  event.preventDefault();
                  navigate('home');
                }}
              >
                Home
              </Link>
              {sectionLinks
                .filter(([id]) => id !== section)
                .map(([id, item]) => (
                  <Link
                    href={`#${id}`}
                    key={id}
                    onClick={(event) => {
                      event.preventDefault();
                      navigate(id);
                    }}
                  >
                    {item.label}
                  </Link>
                ))}
            </nav>
          </>
        )}
      </Box>
    </main>
  );
}
