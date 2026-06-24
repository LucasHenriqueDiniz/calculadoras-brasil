import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { calculators, type CalculatorMeta } from "@/data/calculators";

export function RelatedCalculators({
  excludeSlug,
  slugs,
}: {
  excludeSlug?: string;
  slugs?: string[];
}) {
  let list: CalculatorMeta[];
  if (slugs && slugs.length > 0) {
    list = slugs
      .map((s) => calculators.find((c) => c.slug === s))
      .filter((c): c is CalculatorMeta => Boolean(c));
  } else {
    list = calculators.filter((c) => c.slug !== excludeSlug);
  }

  return (
    <section aria-labelledby="related-heading" className="space-y-4">
      <h2 id="related-heading" className="font-display text-2xl text-foreground">
        Calculadoras relacionadas
      </h2>
      <ul className="grid gap-3 sm:grid-cols-2">
        {list.map((c) => {
          const Icon = c.icon;
          return (
            <li key={c.slug}>
              <Link
                to={c.path}
                className="group flex h-full items-center gap-3 rounded-2xl border border-border bg-surface p-4 shadow-[var(--shadow-card)] transition hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-[var(--shadow-card-hover)]"
              >
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary-soft text-primary">
                  <Icon className="h-5 w-5" aria-hidden />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-medium text-foreground">{c.shortTitle}</p>
                  <p className="truncate text-xs text-muted-foreground">{c.tagline}</p>
                </div>
                <ArrowRight
                  className="h-4 w-4 shrink-0 text-muted-foreground transition group-hover:translate-x-0.5 group-hover:text-primary"
                  aria-hidden
                />
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
