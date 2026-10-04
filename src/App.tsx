import { useEffect, useState } from 'react';
import { siteNavigation } from './content/navigation';
import { HomeSection } from './sections/HomeSection';
import { PageContent } from './sections/PageContent';

function getPathname() {
  return window.location.pathname;
}

export function App() {
  const [pathname, setPathname] = useState(getPathname);
  const activeItem = siteNavigation.find((item) => item.href === pathname);

  useEffect(() => {
    function handlePopState() {
      setPathname(getPathname());
    }

    window.addEventListener('popstate', handlePopState);

    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  function navigate(href: string) {
    if (href === pathname) {
      return;
    }

    window.history.pushState(null, '', href);
    setPathname(href);
  }

  return (
    <main className={`app-shell${activeItem ? ' app-shell--section' : ''}`}>
      <HomeSection
        name="MAX PLEANER"
        navigation={siteNavigation}
        activeHref={activeItem?.href}
        onNavigate={navigate}
      />
      {activeItem && (
        <PageContent label={activeItem.label} content={activeItem.content} />
      )}
    </main>
  );
}
