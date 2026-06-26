import { createFileRoute } from "@tanstack/react-router";
import { PageShell, PageHeader, Prose } from "@/components/layout/PageShell";
import { RelatedCalculators } from "@/components/calculator/RelatedCalculators";
import { absoluteUrl } from "@/lib/site";

export const Route = createFileRoute("/blog/simplificado-vs-completo")({
  head: () => ({
    meta: [
      { title: "IRPF Simplificado vs Completo: Qual Escolher? | Calcule Brasil" },
      {
        name: "description",
        content:
          "Comparação: regime simplificado (20,5% dedução fixa) vs completo (deduções reais). Qual é melhor para você?",
      },
    ],
    links: [{ rel: "canonical", href: absoluteUrl("/blog/simplificado-vs-completo") }],
  }),
  component: BlogPost,
});

function BlogPost() {
  return (
    <PageShell>
      <article>
        <PageHeader
          eyebrow="guia • 6 min"
          title="IRPF Simplificado vs Completo"
          description="Qual regime de tributação é melhor para você: simplificado ou completo?"
        />
        <Prose>
          <h2>Regime Simplificado</h2>
          <p>
            <strong>Dedução fixa:</strong> 20,5% da renda bruta
          </p>
          <p>
            <strong>Melhor se:</strong> Tem poucos gastos dedutíveis ou não quer organizar
            comprovantes
          </p>
          <p>
            <strong>Vantagem:</strong> Simples, sem burocracia
          </p>

          <h2>Regime Completo</h2>
          <p>
            <strong>Deduções:</strong> Educação (até R$ 3.561,50), Saúde (sem limite), Previdência
            (até 13%)
          </p>
          <p>
            <strong>Melhor se:</strong> Tem muitos gastos dedutíveis ou família grande
          </p>
          <p>
            <strong>Vantagem:</strong> Pode economizar muito mais
          </p>

          <h2>Exemplo Comparativo</h2>
          <p>Renda: R$ 60.000/ano</p>
          <p>
            <strong>Simplificado:</strong> Dedução de R$ 12.300 (20,5%)
          </p>
          <p>
            <strong>Completo com dependentes:</strong> R$ 2.275 × 2 filhos + R$ 3.500 educação + R$
            5.000 saúde = R$ 13.050
          </p>
          <p>
            <strong>Resultado:</strong> Completo economiza R$ 750 a mais
          </p>

          <h2>Como Decidir</h2>
          <p>
            Faça as contas dos dois regimes na declaração do ano anterior. Compare qual resulta em
            menor imposto.
          </p>

          <h2>Dica Final</h2>
          <p>
            Você pode optar por um regime ou outro durante a declaração. Escolha na hora que tiver
            dados. Nosso IRPF simulador já compara os dois.
          </p>
        </Prose>
        <RelatedCalculators />
      </article>
    </PageShell>
  );
}
