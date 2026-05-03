import { forwardRef } from 'react';
import type { HTMLAttributes, PropsWithChildren } from 'react';

type BoxProps = PropsWithChildren<HTMLAttributes<HTMLElement>>;

export const Box = forwardRef<HTMLElement, BoxProps>(function Box(
  { children, className = '', ...props },
  ref,
) {
  return (
    <section className={`box ${className}`.trim()} ref={ref} {...props}>
      {children}
    </section>
  );
});
