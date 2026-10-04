type PageContentProps = {
  label: string;
  content: string[];
};

export function PageContent({ label, content }: PageContentProps) {
  return (
    <section className="page-content" aria-label={`${label} content`}>
      <div className="page-content__body">
        {content.map((paragraph) => (
          <p key={paragraph}>{paragraph}</p>
        ))}
      </div>
    </section>
  );
}
