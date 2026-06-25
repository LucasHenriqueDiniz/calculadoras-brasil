import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Dumbbell, Scale, Sun, Tv, Truck } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { PageShell } from "@/components/layout/PageShell";
import { absoluteUrl } from "@/lib/site";

interface Comparison {
  slug: string;
  to: "/comparar/streaming" | "/comparar/academia" | "/comparar/mudanca" | "/comparar/energia";
  title: string;
  description: string;
  icon: LucideIcon;
  /** Opções comparadas lado a lado. */
  options: string[];
  /** Métrica de apoio mostrada no rodapé do card. */
  highlight: string;
  highlightLabel: string;
}

const comparisons: Comparison[] = [
  {
    slug: "streaming",
    to: "/comparar/streaming",
    title: "Netflix vs Disney+ vs Prime vs HBO Max",
    description: "Preço, catálogo e qualidade lado a lado para achar o melhor custo-benefício.",
    icon: Tv,
    options: ["Netflix", "Disney+", "Prime Video", "HBO Max"],
    highlight: "R$ 15 – 55/mês",
    highlightLabel: "Faixa de preço",
  },
  {
    slug: "academia",
    to: "/comparar/academia",
    title: "Academia vs Treino em Casa vs Online",
    description: "Quanto custa cada modalidade e qual entrega mais resultado pelo que você paga.",
    icon: Dumbbell,
    options: ["Academia", "Em casa", "Online"],
    highlight: "3 modalidades",
    highlightLabel: "Comparadas",
  },
  {
    slug: "mudanca",
    to: "/comparar/mudanca",
    title: "Mudança profissional vs por conta própria",
    description: "Contratar transportadora ou fazer você mesmo? Veja custo, tempo e risco.",
    icon: Truck,
    options: ["Transportadora", "Por conta própria"],
    highlight: "Custo + tempo",
    highlightLabel: "Critérios",
  },
  {
    slug: "energia",
    to: "/comparar/energia",
    title: "Energia tradicional vs energia solar",
    description: "Investimento inicial, economia mensal e em quanto tempo o painel se paga.",
    icon: Sun,
    options: ["Tradicional", "Solar"],
    highlight: "Payback do painel",
    highlightLabel: "Foco da análise",
  },
];

export const Route = createFileRoute("/comparar/")({
  head: () => ({
    meta: [
      { title: "Comparador de Custos — Calcule Brasil" },
      {
        name: "description",
        content:
          "Compare custos: streaming, academia, mudança, energia solar. Veja qual opção compensa mais para você.",
      },
      { property: "og:title", content: "Comparador de Custos — Calcule Brasil" },
      {
        property: "og:description",
        content:
          "Decisões comuns comparadas lado a lado. Netflix vs Disney+, academia vs home gym, e mais.",
      },
      { property: "og:url", content: absoluteUrl("/comparar") },
    ],
    links: [{ rel: "canonical", href: absoluteUrl("/comparar") }],
  }),
  component: ComparationHub,
});

function ComparationHub() {
  return (
    <PageShell>
      <section className="relative overflow-hidden border-b border-border bg-surface">
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-56 bg-primary-soft/40 [mask-image:radial-gradient(60%_100%_at_50%_0,black,transparent)]"
          aria-hidden
        />
        <div className="relative mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20">
          <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary-soft px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-primary">
            <Scale className="h-3.5 w-3.5" aria-hidden /> Guias de comparação
          </p>
          <h1 className="max-w-2xl text-balance font-display text-4xl text-foreground sm:text-5xl">
            Compare custos lado a lado
          </h1>
          <p className="mt-5 max-w-2xl text-pretty text-lg leading-relaxed text-muted-foreground">
            Muitas decisões financeiras são uma escolha entre opções. Aqui você vê preço,
            comodidade e custo-benefício real — não só o número mais barato.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-16">
        <ul className="grid gap-5 md:grid-cols-2">
          {comparisons.map((comp) => {
            const Icon = comp.icon;
            return (
              <li key={comp.slug}>
                <Link
                  to={comp.to}
                  className="group flex h-full flex-col rounded-2xl border border-border bg-surface p-6 shadow-[var(--shadow-card)] transition hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-[var(--shadow-card-hover)]"
                >
                  <div className="flex items-start gap-4">
                    <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-primary-soft text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                      <Icon className="h-6 w-6" aria-hidden />
                    </span>
                    <h2 className="font-display text-lg font-semibold leading-snug text-foreground">
                      {comp.title}
                    </h2>
                  </div>

                  <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                    {comp.description}
                  </p>

                  <ul className="mt-5 flex flex-wrap gap-2">
                    {comp.options.map((option) => (
                      <li
                        key={option}
                        className="rounded-full border border-border bg-background px-3 py-1 text-xs font-medium text-foreground/80"
                      >
                        {option}
                      </li>
                    ))}
                  </ul>

                  <div className="mt-6 flex items-end justify-between gap-4 border-t border-border/70 pt-4">
                    <div>
                      <p className="text-xs uppercase tracking-wide text-muted-foreground">
                        {comp.highlightLabel}
                      </p>
                      <p className="mt-0.5 text-sm font-semibold text-foreground">
                        {comp.highlight}
                      </p>
                    </div>
                    <span className="inline-flex items-center gap-1 text-sm font-medium text-primary">
                      Ver comparação
                      <ArrowRight
                        className="h-4 w-4 transition group-hover:translate-x-0.5"
                        aria-hidden
                      />
                    </span>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>

        <div className="mt-12 rounded-2xl border border-border bg-surface p-8 text-center shadow-[var(--shadow-card)]">
          <h2 className="font-display text-xl font-semibold text-foreground">
            Não encontrou a comparação que procura?
          </h2>
          <p className="mx-auto mt-3 max-w-md text-muted-foreground">
            Use as calculadoras para montar uma comparação personalizada com os seus próprios
            valores.
          </p>
          <Link
            to="/"
            className="mt-6 inline-flex items-center gap-2 rounded-md bg-primary px-6 py-3 font-semibold text-primary-foreground transition hover:opacity-90"
          >
            Ver todas as calculadoras <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
        </div>
      </section>
    </PageShell>
  );
}
