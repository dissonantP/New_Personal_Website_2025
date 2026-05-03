import { BigHeader } from '../components/BigHeader';

type ArtSectionProps = {
  onBack: () => void;
};

export function ArtSection({ onBack }: ArtSectionProps) {
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
        <BigHeader className="page-title">Art</BigHeader>
      </header>
      <p className="page-blurb">
        Lorem ipsum dolor sit amet, consectetur adipiscing elit. Integer vitae
        sem at neque fermentum gravida.
      </p>
    </>
  );
}
