import { useEffect, useState } from 'react';
import { siteNavigation } from './content/navigation';
import { HomeSection } from './sections/HomeSection';

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
        <section className="page-content" aria-labelledby="page-content-title">
          <h2 id="page-content-title" className="page-content__title">
            {activeItem.label}
          </h2>
        </section>
      )}
    </main>
  );
}
