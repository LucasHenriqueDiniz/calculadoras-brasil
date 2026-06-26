import { createFileRoute } from "@tanstack/react-router";
import { PageShell, PageHeader, Prose } from "@/components/layout/PageShell";
import { RelatedCalculators } from "@/components/calculator/RelatedCalculators";
import { absoluteUrl } from "@/lib/site";

export const Route = createFileRoute("/blog/negociar-salario-melhor")({
  head: () => ({
    meta: [
      { title: "Como Negociar Salário Melhor: Estratégia Baseada em Dados | Calcule Brasil" },
      {
        name: "description",
        content:
          "Negocie salário com inteligência. Saiba a diferença bruto/líquido e peça o valor correto.",
      },
    ],
    links: [{ rel: "canonical", href: absoluteUrl("/blog/negociar-salario-melhor") }],
  }),
  component: BlogPost,
});

function BlogPost() {
  return (
    <PageShell>
      <article>
        <PageHeader
          eyebrow="guia • 7 min"
          title="Como Negociar Salário Melhor"
          description="Aprenda a negociar sabendo a diferença entre bruto e líquido. Estratégia prática."
        />
        <Prose>
          <h2>O Erro Clássico</h2>
          <p>
            Você quer ganhar R$ 4.000/mês em mão. Mas pede R$ 4.000 de salário bruto. Resultado:
            recebe apenas R$ 3.200 depois dos descontos. Frustração total.
          </p>

          <h2>A Estratégia Correta</h2>
          <p>1. Defina quanto precisa receber em líquido (em mão).</p>
          <p>2. Calcule o bruto equivalente usando nossa calculadora.</p>
          <p>3. Peça esse valor bruto na negociação.</p>
          <p>4. Inclua benefícios (vale refeição, transporte) na proposta.</p>

          <h2>Exemplo Prático</h2>
          <p>
            Preciso de R$ 4.000 em mão. Meu IRPF estimado é 15%. Calculadora mostra que preciso
            pedir R$ 4.900 de bruto. Peço R$ 4.900 + vale refeição + transporte.
          </p>

          <h2>Argumentos em Sua Defesa</h2>
          <ul>
            <li>Você conhece o valor de mercado para seu cargo em sua cidade</li>
            <li>Demonstre experiência e resultados</li>
            <li>Compare com pesquisas salariais (sites como Glassdoor, LinkedIn)</li>
          </ul>

          <h2>Benefícios Valem Na Negociação</h2>
          <p>
            Vale refeição e transporte são baratos para empresa mas reduzem seu IRPF. Peça esses
            benefícios se não conseguir mais salário bruto.
          </p>
        </Prose>
        <RelatedCalculators />
      </article>
    </PageShell>
  );
}
