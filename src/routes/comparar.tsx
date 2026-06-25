import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { PageShell, PageHeader, Prose } from "@/components/layout/PageShell";
import { absoluteUrl } from "@/lib/site";

const comparisons = [
  {
    slug: "streaming",
    title: "Streaming: Netflix vs Disney+ vs Prime vs HBO Max",
    description: "Qual é o melhor custo-benefício para você?",
    keyword: "netflix vs disney",
    volume: "~500 buscas/mês",
  },
  {
    slug: "academia",
    title: "Academia vs Treino em Casa vs Online",
    description: "Qual modalidade compensa mais?",
    keyword: "academia vs treino em casa",
    volume: "~300 buscas/mês",
  },
  {
    slug: "mudanca",
    title: "Mudança Profissional vs DIY",
    description: "Vale a pena contratar mudançadora?",
    keyword: "mudança profissional vale a pena",
    volume: "~200 buscas/mês",
  },
  {
    slug: "energia",
    title: "Energia Tradicional vs Energia Solar",
    description: "Quanto custa e quanto economiza?",
    keyword: "energia solar vale a pena",
    volume: "~400 buscas/mês",
  },
];

export const Route = createFileRoute("/comparar")({
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
        content: "Decisões comuns comparadas lado a lado. Netflix vs Disney+, academia vs home gym, e mais.",
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
      <PageHeader
        eyebrow="Guias de Comparação"
        title="Compare custos lado a lado"
        description="Decisões comuns, análise clara. Netflix vs Disney+, academia vs treino em casa, e mais."
      />

      <Prose>
        <p>
          Muitas decisões financeiras envolvem escolher entre opções. Aqui você compara lado a lado
          o que realmente importa: preço, comodidade, qualidade e valor total.
        </p>

        <p>
          Cada comparação considera critérios realistas — não é só preço, mas custo-benefício real
          para sua situação.
        </p>
      </Prose>

      {/* Comparações */}
      <div className="my-12 grid gap-6 md:grid-cols-2">
        {comparisons.map((comp) => (
          <Link
            key={comp.slug}
            to={`/comparar/${comp.slug}`}
            className="group flex flex-col rounded-xl border border-border bg-surface p-6 shadow-sm transition hover:border-primary hover:shadow-md"
          >
            <h3 className="mb-2 font-display text-lg font-semibold text-foreground group-hover:text-primary">
              {comp.title}
            </h3>
            <p className="mb-4 flex-grow text-sm text-muted-foreground">{comp.description}</p>
            <div className="mb-4 flex items-center gap-4 text-xs text-muted-foreground">
              <span className="truncate">"{comp.keyword}"</span>
              <span className="whitespace-nowrap">{comp.volume}</span>
            </div>
            <span className="inline-flex items-center gap-2 font-medium text-primary">
              Ver comparação <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
            </span>
          </Link>
        ))}
      </div>

      {/* Call to action */}
      <div className="my-12 rounded-lg border border-border bg-surface p-8 text-center">
        <h3 className="mb-4 text-xl font-semibold text-foreground">
          Não encontrou a comparação que procura?
        </h3>
        <p className="mb-6 text-muted-foreground">
          Use nossas calculadoras para comparar opções personalizadas.
        </p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 rounded-md bg-primary px-6 py-3 font-semibold text-primary-foreground hover:opacity-90"
        >
          Ver todas as calculadoras <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </PageShell>
  );
}
