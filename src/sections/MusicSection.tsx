import { BigHeader } from '../components/BigHeader';

type MusicSectionProps = {
  onBack: () => void;
};

export function MusicSection({ onBack }: MusicSectionProps) {
  return (
    <>
      <header className="page-header">
        <a
          className="page-back"
          href="#"
          onClick={(event) => {
            event.preventDefault();
            onBack();
          }}
        >
          &lt;
        </a>
        <BigHeader className="page-title">Music</BigHeader>
      </header>
      <p className="page-blurb">
        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer vitae
        sem at neque fermentum gravida.
      </p>
    </>
  );
}
