import type { AnchorHTMLAttributes, ReactNode } from 'react';

type LinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  children: ReactNode;
};

export function Link({ children, className, ...props }: LinkProps) {
  const classes = ['link', className].filter(Boolean).join(' ');

  return (
    <a className={classes} {...props}>
      {children}
    </a>
  );
}
