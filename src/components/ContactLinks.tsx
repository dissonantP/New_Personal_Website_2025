import { Link } from './Link';

type ContactLinksProps = {
  links: { label: string; href: string }[];
};

export function ContactLinks({ links }: ContactLinksProps) {
  return (
    <p className="contact-links">
      {links.map((link) => (
        <Link key={link.href} href={link.href}>
          {link.label}
        </Link>
      ))}
    </p>
  );
}
