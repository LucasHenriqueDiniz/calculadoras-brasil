import { createFileRoute } from "@tanstack/react-router";
import { PageShell, PageHeader, Prose } from "@/components/layout/PageShell";
import { RelatedCalculators } from "@/components/calculator/RelatedCalculators";
import { absoluteUrl } from "@/lib/site";

export const Route = createFileRoute("/blog/formal-vs-informal")({
  head: () => ({
    meta: [
      { title: "Autônomo Formal vs Informal | Calcule Brasil" },
      { name: "description", content: "Diferenças e custos: ser autônomo registrado vs informal." },
    ],
    links: [{ rel: "canonical", href: absoluteUrl("/blog/formal-vs-informal") }],
  }),
  component: BlogPost,
});

function BlogPost() {
  return (
    <PageShell>
      <article>
        <PageHeader eyebrow="guia • 6 min" title="Autônomo Formal vs Informal" description="Quando vale a pena se registrar como autônomo." />
        <Prose>
          <h2>Informal</h2>
          <p><strong>Custo:</strong> R$ 0/mês</p>
          <p><strong>Imposto:</strong> Pode não pagar nada</p>
          <p><strong>Problema:</strong> Sem direitos trabalhistas, sem comprovação de renda, sem aposentadoria</p>

          <h2>Formal (Autônomo Registrado)</h2>
          <p><strong>Custo:</strong> R$ 65-70/mês (DAS)</p>
          <p><strong>Benefício:</strong> INSS, aposentadoria, auxílio-doença, maternidade</p>
          <p><strong>Vantagem:</strong> Comprovação de renda para banco, crédito imobiliário</p>

          <h2>MEI</h2>
          <p><strong>Custo:</strong> R$ 65-70/mês</p>
          <p><strong>Faturamento até:</strong> R$ 81.000/ano</p>
          <p><strong>Imposto:</strong> Isento (até limite)</p>

          <h2>Comparação</h2>
          <p>Se ganha até R$ 40 mil/ano: informal pode parecer vantajoso, mas perde direitos.</p>
          <p>Se ganha acima disso: formal (autônomo ou MEI) vale a pena pelo INSS e comprovação.</p>
        </Prose>
        <RelatedCalculators />
      </article>
    </PageShell>
  );
}
