export interface FAQItem {
  question: string;
  answer: string;
}

export function FAQSection({
  items,
  title = "Perguntas frequentes",
}: {
  items: FAQItem[];
  title?: string;
}) {
  return (
    <section aria-labelledby="faq-heading" className="space-y-4">
      <h2 id="faq-heading" className="font-display text-2xl text-foreground">
        {title}
      </h2>
      <div className="divide-y divide-border overflow-hidden rounded-2xl border border-border bg-surface shadow-[var(--shadow-card)]">
        {items.map((item) => (
          <details key={item.question} className="group">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-3 p-4 font-medium text-foreground transition-colors marker:hidden hover:bg-muted/40 sm:px-5">
              <span>{item.question}</span>
              <span
                className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-primary-soft text-lg leading-none text-primary transition group-open:rotate-45"
                aria-hidden
              >
                +
              </span>
            </summary>
            <p className="px-4 pb-4 text-sm leading-relaxed text-foreground/80 sm:px-5">
              {item.answer}
            </p>
          </details>
        ))}
      </div>
    </section>
  );
}
