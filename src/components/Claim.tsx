import type { ReactNode } from 'react';

type ClaimProps = {
  children: ReactNode;
  caption?: ReactNode;
};

export function Claim({ children, caption }: ClaimProps) {
  return (
    <div className="claim">
      <p className="claim__headline">{children}</p>
      {caption && <p className="claim__caption">{caption}</p>}
    </div>
  );
}
