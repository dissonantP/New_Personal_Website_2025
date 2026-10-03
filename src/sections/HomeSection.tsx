import { BigHeader } from '../components/BigHeader';
import { Link } from '../components/Link';
import type { NavigationItem } from '../content/navigation';

type HomeSectionProps = {
  name: string;
  navigation: NavigationItem[];
};

export function HomeSection({ name, navigation }: HomeSectionProps) {
  return (
    <section className="home-section" aria-label="Introduction">
      <BigHeader>{name}</BigHeader>
      <nav className="home-section__links" aria-label="Explore">
        {navigation.map((item) => (
          <Link key={item.href} href={item.href}>
            {item.label}
          </Link>
        ))}
      </nav>
    </section>
  );
}
