import type { MouseEvent } from 'react';
import { BigHeader } from '../components/BigHeader';
import { Link } from '../components/Link';
import type { NavigationItem } from '../content/navigation';

type HomeSectionProps = {
  name: string;
  navigation: NavigationItem[];
  activeHref?: string;
  onNavigate: (href: string) => void;
};

export function HomeSection({ name, navigation, activeHref, onNavigate }: HomeSectionProps) {
  const isActive = Boolean(activeHref);

  function handleNavigation(event: MouseEvent<HTMLAnchorElement>, href: string) {
    event.preventDefault();
    onNavigate(href);
  }

  return (
    <section className={`home-section${isActive ? ' home-section--active' : ''}`} aria-label="Introduction">
      <BigHeader>
        <Link className="home-title-link" href="/" onClick={(event) => handleNavigation(event, '/')}>
          {name}
        </Link>
      </BigHeader>
      <nav className="home-section__links" aria-label="Explore">
        {navigation.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            aria-current={activeHref === item.href ? 'page' : undefined}
            onClick={(event) => handleNavigation(event, item.href)}
          >
            {item.label}
          </Link>
        ))}
      </nav>
    </section>
  );
}
