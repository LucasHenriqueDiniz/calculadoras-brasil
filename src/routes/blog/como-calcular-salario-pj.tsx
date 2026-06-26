import { createFileRoute } from "@tanstack/react-router";
import { PageShell, PageHeader, Prose } from "@/components/layout/PageShell";
import { RelatedCalculators } from "@/components/calculator/RelatedCalculators";
import { absoluteUrl } from "@/lib/site";

export const Route = createFileRoute("/blog/como-calcular-salario-pj")({
  head: () => ({
    meta: [
      { title: "Como Calcular Salário PJ | Calcule Brasil" },
      {
        name: "description",
        content: "Passo a passo: calcule seu salário PJ descontando INSS, IRPF, contador.",
      },
    ],
    links: [{ rel: "canonical", href: absoluteUrl("/blog/como-calcular-salario-pj") }],
  }),
  component: BlogPost,
});

function BlogPost() {
  return (
    <PageShell>
      <article>
        <PageHeader
          eyebrow="guia • 7 min"
          title="Como Calcular Salário PJ"
          description="Fórmula completa para calcular ganho líquido como PJ."
        />
        <Prose>
          <h2>Passo 1: Valor Bruto Proposto</h2>
          <p>Valor que cliente oferece ou você quer cobrar: R$ 10.000/mês</p>

          <h2>Passo 2: Desconto INSS (20%)</h2>
          <p>R$ 10.000 × 0.20 = R$ 2.000 INSS</p>

          <h2>Passo 3: Desconto Contador (5%)</h2>
          <p>R$ 10.000 × 0.05 = R$ 500 contador</p>

          <h2>Passo 4: Desconto IRPF Estimado</h2>
          <p>Base para IRPF: R$ 10.000 - R$ 2.000 - R$ 500 = R$ 7.500</p>
          <p>Alíquota progressiva (~15-22%): ~R$ 1.125</p>

          <h2>Passo 5: Ganho Líquido</h2>
          <p>
            R$ 10.000 - R$ 2.000 - R$ 500 - R$ 1.125 = <strong>R$ 6.375 líquido</strong>
          </p>

          <h2>Regra Rápida</h2>
          <p>PJ recebe ~60-65% do valor bruto em líquido (restante vai para impostos).</p>

          <h2>Use a Calculadora</h2>
          <p>
            Simule sua situação específica na calculadora CLT vs PJ. Varia conforme dependentes e
            deduções.
          </p>
        </Prose>
        <RelatedCalculators />
      </article>
    </PageShell>
  );
}
