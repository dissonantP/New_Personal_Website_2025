import type { ReactNode } from 'react';

type PageContentProps = {
  label: string;
  children: ReactNode;
};

export function PageContent({ label, children }: PageContentProps) {
  return (
    <section className="page-content" aria-label={`${label} content`}>
      <div className="page-content__body">{children}</div>
    </section>
  );
}
