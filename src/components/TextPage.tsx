import type { ReactNode } from 'react';
import { Link } from './Link';

const linkPattern = /\[([^\]]+)\]\(([^)]+)\)/g;
const headingPattern = /^#+\s+(.*)$/;

function renderLinks(text: string): ReactNode[] {
  const parts: ReactNode[] = [];
  let lastIndex = 0;

  for (const match of text.matchAll(linkPattern)) {
    const [whole, label, href] = match;
    parts.push(text.slice(lastIndex, match.index));
    parts.push(
      <Link key={match.index} href={href}>
        {label}
      </Link>,
    );
    lastIndex = match.index + whole.length;
  }

  parts.push(text.slice(lastIndex));
  return parts;
}

function renderLine(line: string, index: number, lines: string[]): ReactNode {
  const heading = line.match(headingPattern);
  const content = heading ? <strong className="text-page__heading">{heading[1]}</strong> : renderLinks(line);
  const newline = index < lines.length - 1 ? '\n' : '';

  return (
    <span key={index}>
      {content}
      {newline}
    </span>
  );
}

type TextPageProps = {
  text: string;
};

// Renders plain text in a <pre>: "#" headings become bold, [label](url) becomes a link.
export function TextPage({ text }: TextPageProps) {
  const lines = text.split('\n');

  return <pre className="text-page">{lines.map(renderLine)}</pre>;
}
