import { createFileRoute } from "@tanstack/react-router";
import { PageShell, PageHeader, Prose } from "@/components/layout/PageShell";
import { RelatedCalculators } from "@/components/calculator/RelatedCalculators";
import { absoluteUrl } from "@/lib/site";

export const Route = createFileRoute("/blog/mei-vs-pj-custo")({
  head: () => ({
    meta: [
      { title: "MEI vs PJ: Qual é Mais Barato? | Calcule Brasil" },
      { name: "description", content: "Compare custos e impostos: MEI vs PJ. Descubra qual regime é melhor para seu ganho." },
    ],
    links: [{ rel: "canonical", href: absoluteUrl("/blog/mei-vs-pj-custo") }],
  }),
  component: BlogPost,
});

function BlogPost() {
  return (
    <PageShell>
      <article>
        <PageHeader eyebrow="guia • 7 min" title="MEI vs PJ: Qual é Mais Barato?" description="Análise de custos e impostos entre MEI e PJ para autônomos e prestadores." />
        <Prose>
          <h2>MEI (Microempreendedor Individual)</h2>
          <p><strong>Custo mensal:</strong> R$ 65-70 (DAS - INSS + imposto)</p>
          <p><strong>Imposto de Renda:</strong> Isento até R$ 81.000/ano</p>
          <p><strong>Melhor para:</strong> Ganhos até R$ 81.000/ano</p>

          <h2>PJ (Pessoa Jurídica)</h2>
          <p><strong>Custo mensal:</strong> R$ 400-600 (contador, contabilidade)</p>
          <p><strong>Imposto de Renda:</strong> Simples Nacional (~15-16%) ou Lucro Real</p>
          <p><strong>Melhor para:</strong> Ganhos acima de R$ 120.000/ano</p>

          <h2>Comparação</h2>
          <p><strong>Ganhando R$ 60.000/ano:</strong> MEI é 70% mais barato</p>
          <p><strong>Ganhando R$ 150.000/ano:</strong> PJ é melhor (simples nacional reduz imposto)</p>

          <h2>Diferenças Além do Custo</h2>
          <ul>
            <li>MEI: Simples, menos burocracia, sem nota fiscal obrigatória</li>
            <li>PJ: Mais profissional, permite contratações, emite nota fiscal</li>
          </ul>
        </Prose>
        <RelatedCalculators />
      </article>
    </PageShell>
  );
}
