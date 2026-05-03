import type { AnchorHTMLAttributes, PropsWithChildren } from 'react';

type LinkProps = PropsWithChildren<AnchorHTMLAttributes<HTMLAnchorElement>>;

export function Link({ children, className = '', ...props }: LinkProps) {
  return (
    <a className={`link ${className}`.trim()} {...props}>
      <span className="link-label">{children}</span>
    </a>
  );
}
