import { SiteHeader } from './components/SiteHeader';
import { siteNavigation } from './content/navigation';

export function App() {
  return (
    <main className="app-shell">
      <SiteHeader name="MAX PLEANER" navigation={siteNavigation} />
    </main>
  );
}
