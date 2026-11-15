import { TextPage } from './components/TextPage';
import { pageText } from './content/page';

export function App() {
  return (
    <main className="app-shell">
      <TextPage text={pageText} />
    </main>
  );
}
