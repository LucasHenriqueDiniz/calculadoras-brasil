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
      <div className="divide-y divide-border rounded-xl border border-border bg-surface">
        {items.map((item) => (
          <details key={item.question} className="group p-4">
            <summary className="cursor-pointer list-none font-medium text-foreground marker:hidden">
              <span className="inline-flex w-full items-center justify-between gap-3">
                {item.question}
                <span className="text-primary transition group-open:rotate-45" aria-hidden>
                  +
                </span>
              </span>
            </summary>
            <p className="mt-2 text-sm leading-relaxed text-foreground/80">{item.answer}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
