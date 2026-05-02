import type { HTMLAttributes, PropsWithChildren } from 'react';

type BoxProps = PropsWithChildren<HTMLAttributes<HTMLDivElement>>;

export function Box({ children, className = '', ...props }: BoxProps) {
  return (
    <section className={`box ${className}`.trim()} {...props}>
      {children}
    </section>
  );
}
