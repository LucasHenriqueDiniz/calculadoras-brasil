import { createFileRoute } from "@tanstack/react-router";
import { PageShell, PageHeader, Prose } from "@/components/layout/PageShell";
import { RelatedCalculators } from "@/components/calculator/RelatedCalculators";
import { absoluteUrl } from "@/lib/site";

export const Route = createFileRoute("/blog/investimentos-isentos-irpf")({
  head: () => ({
    meta: [
      { title: "Investimentos Isentos de IRPF em 2026 | Calcule Brasil" },
      {
        name: "description",
        content:
          "Descubra investimentos que NÃO pagam imposto de renda: poupança, LCI, LCA, debêntures, Tesouro Direto.",
      },
    ],
    links: [{ rel: "canonical", href: absoluteUrl("/blog/investimentos-isentos-irpf") }],
  }),
  component: BlogPost,
});

function BlogPost() {
  return (
    <PageShell>
      <article>
        <PageHeader
          eyebrow="guia • 8 min"
          title="Investimentos Isentos de IRPF em 2026"
          description="Estratégias legais para investir sem pagar imposto de renda."
        />
        <Prose>
          <h2>Poupança Tradicional</h2>
          <p>
            <strong>Limite:</strong> R$ 500/mês
          </p>
          <p>
            <strong>Rendimento:</strong> 70% da taxa Selic (~0.36% a.m.)
          </p>
          <p>
            <strong>Vantagem:</strong> Totalmente isenta, fácil
          </p>

          <h2>LCI - Letra de Crédito Imobiliário</h2>
          <p>
            <strong>Rendimento:</strong> 90-95% da taxa DI
          </p>
          <p>
            <strong>Risco:</strong> Baixo (garantido por imóvel)
          </p>
          <p>
            <strong>Isenta de IRPF:</strong> Sim
          </p>

          <h2>LCA - Letra de Crédito Agropecuário</h2>
          <p>
            <strong>Rendimento:</strong> 90-95% da taxa DI
          </p>
          <p>
            <strong>Risco:</strong> Baixo (garantido por agropecuária)
          </p>
          <p>
            <strong>Isenta de IRPF:</strong> Sim
          </p>

          <h2>Debêntures Incentivadas</h2>
          <p>
            <strong>Rendimento:</strong> 100% da taxa DI ou maior
          </p>
          <p>
            <strong>Isenta de IRPF:</strong> Parcialmente (50-75%)
          </p>
          <p>
            <strong>Risco:</strong> Médio (empresa privada)
          </p>

          <h2>Tesouro Direto (Não Isento, Mas Otimizado)</h2>
          <p>
            <strong>IRPF:</strong> Regressivo (15% com 2 anos, 12,5% com 3 anos)
          </p>
          <p>
            <strong>Vantagem:</strong> Quanto mais tempo, menos imposto
          </p>
        </Prose>
        <RelatedCalculators />
      </article>
    </PageShell>
  );
}
