import type { ReactNode } from 'react';

type BigHeaderProps = {
  children: ReactNode;
};

export function BigHeader({ children }: BigHeaderProps) {
  return <h1 className="big-header">{children}</h1>;
}
