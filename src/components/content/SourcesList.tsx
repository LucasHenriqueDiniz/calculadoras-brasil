import { BookOpen, ExternalLink } from "lucide-react";

export interface SourceItem {
  label: string;
  href: string;
  note?: string;
}

/**
 * Lista de fontes consultadas em uma página editorial. Deixa explícito de onde
 * vêm as faixas de preço e as regras citadas, e quando o conteúdo foi revisado.
 */
export function SourcesList({
  items,
  reviewedAt,
  title = "Fontes e metodologia",
}: {
  items: SourceItem[];
  reviewedAt?: string;
  title?: string;
}) {
  if (items.length === 0) return null;

  return (
    <section
      aria-labelledby="fontes-heading"
      className="not-prose my-8 rounded-2xl border border-border bg-surface p-6 shadow-[var(--shadow-card)]"
    >
      <div className="flex items-center gap-3">
        <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-primary-soft text-primary">
          <BookOpen className="h-4 w-4" aria-hidden />
        </span>
        <h2 id="fontes-heading" className="font-display text-xl text-foreground">
          {title}
        </h2>
      </div>

      <ul className="mt-4 space-y-3 text-sm leading-relaxed text-foreground/85">
        {items.map((item) => (
          <li key={item.href} className="flex items-start gap-2">
            <ExternalLink className="mt-1 h-3.5 w-3.5 shrink-0 text-primary" aria-hidden />
            <span>
              <a
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-primary underline underline-offset-2"
              >
                {item.label}
              </a>
              {item.note ? <span className="text-muted-foreground"> — {item.note}</span> : null}
            </span>
          </li>
        ))}
      </ul>

      {reviewedAt ? (
        <p className="mt-4 text-xs text-muted-foreground">
          Conteúdo revisado em {reviewedAt}. Preços e regras mudam com frequência: confirme os
          valores atuais com fornecedores e com as fontes oficiais antes de decidir.
        </p>
      ) : null}
    </section>
  );
}
