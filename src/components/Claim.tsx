import type { ReactNode } from 'react';

type ClaimProps = {
  children: ReactNode;
};

export function Claim({ children }: ClaimProps) {
  return <p className="claim">{children}</p>;
}
