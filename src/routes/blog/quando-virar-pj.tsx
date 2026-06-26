import { createFileRoute } from "@tanstack/react-router";
import { PageShell, PageHeader, Prose } from "@/components/layout/PageShell";
import { RelatedCalculators } from "@/components/calculator/RelatedCalculators";
import { absoluteUrl } from "@/lib/site";

export const Route = createFileRoute("/blog/quando-virar-pj")({
  head: () => ({
    meta: [
      { title: "Quando Vale a Pena Virar PJ? | Calcule Brasil" },
      {
        name: "description",
        content: "Análise: em que momento é vantajoso sair de CLT e se tornar PJ.",
      },
    ],
    links: [{ rel: "canonical", href: absoluteUrl("/blog/quando-virar-pj") }],
  }),
  component: BlogPost,
});

function BlogPost() {
  return (
    <PageShell>
      <article>
        <PageHeader
          eyebrow="guia • 7 min"
          title="Quando Vale a Pena Virar PJ?"
          description="Critérios para decidir entre permanecer CLT ou virar PJ."
        />
        <Prose>
          <h2>Quando PJ Não Vale</h2>
          <ul>
            <li>Ganho bruto menor que R$ 80.000/ano</li>
            <li>Sem múltiplos clientes (é CLT mascarado)</li>
            <li>Precisa de benefícios (FGTS, 13º, férias)</li>
            <li>Sem reserva de emergência (3-6 meses de ganho)</li>
          </ul>

          <h2>Quando PJ Pode Valer</h2>
          <ul>
            <li>Ganho bruto acima de R$ 120.000/ano</li>
            <li>Múltiplos clientes (consultoria, freelance)</li>
            <li>Não precisa de estabilidade</li>
            <li>Tem reserva financeira</li>
            <li>Quer flexibilidade (horários, local)</li>
          </ul>

          <h2>A Regra dos 30%</h2>
          <p>
            PJ precisa ganhar ~30% a mais em bruto que CLT para ter o mesmo ganho líquido. Use nossa
            calculadora para validar.
          </p>

          <h2>Cuidados com PJ Mascarado</h2>
          <p>
            Se trabalha para 1 cliente, 40h/semana, sem flexibilidade de horário: é CLT disfarçado.
            Receita Federal pode reclassificar e cobrar retroativo.
          </p>
        </Prose>
        <RelatedCalculators />
      </article>
    </PageShell>
  );
}
