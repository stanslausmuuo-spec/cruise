interface LegalSection {
  title: string;
  content: string;
}

interface LegalDocumentProps {
  title: string;
  intro?: string;
  lastUpdated: string;
  sections: LegalSection[];
}

function LegalDocument({ title, intro, lastUpdated, sections }: LegalDocumentProps) {
  return (
    <div className="min-h-screen pt-20 pb-16 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="font-heading text-4xl font-bold text-charcoal dark:text-cream mb-4">
            {title}
          </h1>
          <p className="text-sm text-charcoal/60 dark:text-cream/60">
            Last updated: {lastUpdated}
          </p>
          {intro && (
            <p className="text-sm text-charcoal/70 dark:text-cream/70 leading-relaxed max-w-2xl mx-auto mt-4">
              {intro}
            </p>
          )}
        </div>

        <div className="space-y-8">
          {sections.map((s, i) => (
            <section key={s.title}>
              <h2 className="font-heading text-lg font-bold text-charcoal dark:text-cream mb-3">
                {i + 1}. {s.title}
              </h2>
              <p className="text-sm text-charcoal/70 dark:text-cream/70 leading-relaxed whitespace-pre-line">
                {s.content}
              </p>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}

export { LegalDocument };
