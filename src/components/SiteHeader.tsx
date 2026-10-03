import { Link } from './Link';
import type { NavigationItem } from '../content/navigation';

type SiteHeaderProps = {
  name: string;
  navigation: NavigationItem[];
};

export function SiteHeader({ name, navigation }: SiteHeaderProps) {
  return (
    <header className="site-header">
      <a className="site-header__name" href="/" aria-label={`${name} home`}>
        {name}
      </a>
      <nav className="site-header__navigation" aria-label="Primary navigation">
        {navigation.map((item) => (
          <Link key={item.href} href={item.href}>
            {item.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
