import { BigHeader } from '../components/BigHeader';

type ServicesSectionProps = {
  onBack: () => void;
};

export function ServicesSection({ onBack }: ServicesSectionProps) {
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
        <BigHeader className="page-title">Services</BigHeader>
      </header>
      <p className="page-blurb">
        Software design and implementation, creative technology prototypes, interactive media,
        and technical consulting for production-minded teams.
      </p>
    </>
  );
}
