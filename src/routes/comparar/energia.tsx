import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { PageShell, PageHeader, Prose } from "@/components/layout/PageShell";
import { ComparisonChart } from "@/components/ComparisonChart";
import { absoluteUrl } from "@/lib/site";

const comparisonData = {
  title: "Energia: Tradicional vs Solar",
  columns: ["Energia Tradicional", "Energia Solar"],
  rows: [
    { feature: "Investimento inicial", items: ["R$ 0", "R$ 15.000-30.000"] },
    { feature: "Conta mensal (casa média)", items: ["R$ 150-300", "R$ 20-50"] },
    { feature: "Conta anual", items: ["R$ 1.800-3.600", "R$ 240-600"] },
    { feature: "Economia em 10 anos", items: ["—", "R$ 20.000-35.000"] },
    { feature: "Payback (retorno)", items: ["—", "5-7 anos"] },
    { feature: "Manutenção", items: ["Nenhuma", "Mínima (limpeza)"] },
    { feature: "Dependência da concessionária", items: ["Total", "Mínima/nenhuma"] },
  ],
};

export const Route = createFileRoute("/comparar/energia")({
  head: () => ({
    meta: [
      { title: "Energia Solar vs Tradicional: Vale a pena? — Calcule Brasil" },
      {
        name: "description",
        content:
          "Compare energia solar x energia da rede: investimento, payback, economia mensal. Vale a pena instalar painéis?",
      },
      { property: "og:title", content: "Energia Solar vs Tradicional: Vale a pena?" },
      { property: "og:url", content: absoluteUrl("/comparar/energia") },
    ],
    links: [{ rel: "canonical", href: absoluteUrl("/comparar/energia") }],
  }),
  component: EnergiaComparison,
});

function EnergiaComparison() {
  return (
    <PageShell>
      <article>
        <PageHeader
          eyebrow="Análise de Investimento"
          title="Energia Solar vs Tradicional"
          description="Vale a pena investir em painel solar?"
        />

        <div className="mx-auto max-w-3xl px-4 pt-6 sm:px-6">
          <Link
            to="/comparar"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden />
            Voltar para comparações
          </Link>
        </div>

        <Prose>
          <h2>Tabela de Comparação</h2>
          <ComparisonChart {...comparisonData} />

          <h2>Energia Tradicional (Rede)</h2>
          <ul>
            <li>✅ Zero investimento inicial</li>
            <li>✅ Sem preocupação com manutenção</li>
            <li>✅ Sempre disponível (mesmo em nuvem)</li>
            <li>❌ Conta sobe 5-10% ao ano</li>
            <li>❌ Dependente de concessionária</li>
          </ul>

          <h2>Energia Solar</h2>
          <ul>
            <li>✅ Economia enorme (70-90%)</li>
            <li>✅ Investimento retorna em 5-7 anos</li>
            <li>✅ Após payback: "grátis" por 25+ anos</li>
            <li>✅ Valoriza o imóvel</li>
            <li>❌ Investimento inicial alto (R$ 15-30k)</li>
            <li>❌ Requer telhado adequado</li>
          </ul>

          <h2>Cenários de Payback</h2>
          <h3>Casa com conta de R$ 200/mês</h3>
          <ul>
            <li>Gasto anual: R$ 2.400</li>
            <li>Gasto em 5 anos: R$ 12.000</li>
            <li>Gasto em 10 anos: R$ 24.000</li>
            <li>Solar (R$ 20.000): payback em 8-10 anos</li>
            <li>
              <strong>Economia em 10 anos: R$ 4.000 (com solar)</strong>
            </li>
          </ul>

          <h3>Apartamento com conta de R$ 150/mês</h3>
          <ul>
            <li>Solar pode não compensar (falta espaço no telhado)</li>
            <li>Melhor economizar com LED + hábitos</li>
          </ul>

          <h2>Vale a Pena?</h2>
          <p>
            <strong>Se tem casa própria + conta acima de R$ 200/mês:</strong> Sim, especialmente se
            pretende ficar 10+ anos.
          </p>
          <p>
            <strong>Se aluga ou conta abaixo de R$ 150:</strong> Não compensa ainda.
          </p>
          <p>
            <strong>Se quer economia rápida:</strong> Comece com LED + isolamento. Solar é longo
            prazo.
          </p>

          <h2>Incentivos</h2>
          <ul>
            <li>Alguns estados: ICMS reduzido para solar</li>
            <li>Financiamento: algumas empresas oferecem parcelado</li>
            <li>Valorização imóvel: +5-10% com solar instalado</li>
          </ul>

          <a
            href="/calculadora-conta-de-luz"
            className="mt-6 inline-block rounded-md bg-primary px-5 py-2 font-semibold text-primary-foreground hover:opacity-90"
          >
            Calcular sua conta de luz atual
          </a>
        </Prose>
      </article>
    </PageShell>
  );
}
