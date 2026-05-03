import { BigHeader } from '../components/BigHeader';

type SoftwareSectionProps = {
  onBack: () => void;
};

export function SoftwareSection({ onBack }: SoftwareSectionProps) {
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
        <BigHeader className="page-title">Software</BigHeader>
      </header>
      <p className="page-blurb">
        <p>I wrote my first lines of code in 2013, just after finishing my Politics degree.</p>
        <p>I learned full-stack web development through free online curricula such as FreeCodeCamp / Odin Project and through structured courses (Code Union, App Academy). </p>
        <p>My first roles were at social networking startups in the mid 2010s, building Ruby on Rails backends for photo-sharing mobile apps (Sobrr, Timeset)</p>
        <p>I had a brief foray into the HR analytics space (Atipica) before joining an Education technology company (Edcast) where I stayed for 4 years. There, in addition to full stack work, I built an analytics system with Golang and InfluxDB time-series database.</p>
        <p>At the time I was a hobbyist game developer, and found the intersections of my experience (full-stack) and interests (3D) at Hover, a property tech company making digital twins of houses. In my 6 years there I spent most of my time as a lead on the home-interiors scanning product. This involved the development of 3D modeling tools, automatic entity tagging & measurement extraction, floor plan imagery generation, and complex algorithms to convert floor plans to parameterized formats for insurance-industry-specific integrations.</p>
        <p>Most recently (as of 2026) I've joined the CAD team at Dandy which is a digital dental lab (scanning teeth and manufacturing crowns / removables).</p>
        <p>My speciality on the backend is Ruby on Rails, and on the frontend I'm comfortable with modern Typescript / React stacks.</p>
      </p>
    </>
  );
}
