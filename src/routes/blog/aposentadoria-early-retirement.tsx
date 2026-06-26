import { createFileRoute } from "@tanstack/react-router";
import { PageShell, PageHeader, Prose } from "@/components/layout/PageShell";
import { RelatedCalculators } from "@/components/calculator/RelatedCalculators";
import { absoluteUrl } from "@/lib/site";

export const Route = createFileRoute("/blog/aposentadoria-early-retirement")({
  head: () => ({
    meta: [
      { title: "Aposentadoria Antecipada: Quanto Poupar? | Calcule Brasil" },
      { name: "description", content: "Estratégia FIRE: quanto poupar para se aposentar cedo e viver de renda." },
    ],
    links: [{ rel: "canonical", href: absoluteUrl("/blog/aposentadoria-early-retirement") }],
  }),
  component: BlogPost,
});

function BlogPost() {
  return (
    <PageShell>
      <article>
        <PageHeader eyebrow="guia • 8 min" title="Aposentadoria Antecipada: Quanto Poupar?" description="Estratégia FIRE para se aposentar cedo." />
        <Prose>
          <h2>Regra 4%</h2>
          <p>Se você poup ar R$ 1 milhão, pode gastar R$ 40 mil/ano de forma sustentável (4% ao ano).</p>

          <h2>Quanto Poupar?</h2>
          <p>Se gasta R$ 30 mil/mês: precisa de R$ 9 milhões aplicados (30k × 12 ÷ 0.04)</p>
          <p>Se gasta R$ 10 mil/mês: precisa de R$ 3 milhões</p>

          <h2>Tempo para Aposentar</h2>
          <p>Poupando 50% do ganho: ~17 anos</p>
          <p>Poupando 60% do ganho: ~12 anos</p>

          <h2>Estratégias Legais</h2>
          <ul>
            <li>Maxim ize renda (negocie, faça PJ, invista)</li>
            <li>Reduza gastos (não significa sofrimento)</li>
            <li>Invista em Tesouro Direto, LCI, LCA (rendimento previsível)</li>
            <li>Contribua para previdência complementar (deduz IRPF + poupança)</li>
          </ul>

          <h2>Cuidado: IRRF na Aposentadoria</h2>
          <p>Ganhos com investimentos pagam IRPF. Planeje isso na sua projeção.</p>
        </Prose>
        <RelatedCalculators />
      </article>
    </PageShell>
  );
}
