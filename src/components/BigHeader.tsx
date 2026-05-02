import type { HTMLAttributes, PropsWithChildren } from 'react';

type BigHeaderProps = PropsWithChildren<HTMLAttributes<HTMLHeadingElement>>;

export function BigHeader({ children, className = '', ...props }: BigHeaderProps) {
  return (
    <h1 className={`big-header ${className}`.trim()} {...props}>
      {children}
    </h1>
  );
}
