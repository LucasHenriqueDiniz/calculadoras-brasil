import { Link } from "@tanstack/react-router";
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
                className="flex items-start gap-3 rounded-xl border border-border bg-surface p-4 transition hover:border-primary/40 hover:bg-primary-soft/30"
              >
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-primary-soft text-primary">
                  <Icon className="h-4 w-4" aria-hidden />
                </span>
                <div>
                  <p className="font-medium text-foreground">{c.shortTitle}</p>
                  <p className="text-xs text-muted-foreground">{c.tagline}</p>
                </div>
              </Link>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
