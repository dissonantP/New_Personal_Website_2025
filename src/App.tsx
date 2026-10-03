import { siteNavigation } from './content/navigation';
import { HomeSection } from './sections/HomeSection';

export function App() {
  return (
    <main className="app-shell">
      <HomeSection name="MAX PLEANER" navigation={siteNavigation} />
    </main>
  );
}
