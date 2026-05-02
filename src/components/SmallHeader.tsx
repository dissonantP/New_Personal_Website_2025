import type { PropsWithChildren } from 'react';

export function SmallHeader({ children }: PropsWithChildren) {
  return <p className="small-header">{children}</p>;
}
