import { ChevronDown, HelpCircle } from "lucide-react";

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
    <section aria-labelledby="faq-heading" className="space-y-5">
      <div className="flex items-center gap-3">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary-soft text-primary">
          <HelpCircle className="h-5 w-5" aria-hidden />
        </span>
        <div>
          <h2 id="faq-heading" className="font-display text-2xl text-foreground">
            {title}
          </h2>
          <p className="text-sm text-muted-foreground">
            Tire as principais dúvidas sobre como interpretar e usar a estimativa.
          </p>
        </div>
      </div>

      <div className="divide-y divide-border overflow-hidden rounded-2xl border border-border bg-surface shadow-[var(--shadow-card)]">
        {items.map((item) => (
          <details key={item.question} className="group open:bg-primary-soft/10">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-5 py-4 font-medium text-foreground transition-colors marker:hidden hover:bg-muted/40">
              <span className="text-pretty">{item.question}</span>
              <span
                className="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-border bg-background text-muted-foreground transition group-open:rotate-180 group-open:border-primary/40 group-open:bg-primary-soft group-open:text-primary"
                aria-hidden
              >
                <ChevronDown className="h-4 w-4" />
              </span>
            </summary>
            <p className="px-5 pb-4 text-sm leading-relaxed text-foreground/80">{item.answer}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
