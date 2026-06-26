import { createFileRoute } from "@tanstack/react-router";
import { PageShell, PageHeader, Prose } from "@/components/layout/PageShell";
import { RelatedCalculators } from "@/components/calculator/RelatedCalculators";
import { absoluteUrl } from "@/lib/site";

export const Route = createFileRoute("/blog/contador-necessario-pj")({
  head: () => ({
    meta: [
      { title: "Contador é Necessário para PJ? | Calcule Brasil" },
      {
        name: "description",
        content: "Quando contratar contador como PJ, custo, e como economizar.",
      },
    ],
    links: [{ rel: "canonical", href: absoluteUrl("/blog/contador-necessario-pj") }],
  }),
  component: BlogPost,
});

function BlogPost() {
  return (
    <PageShell>
      <article>
        <PageHeader
          eyebrow="guia • 6 min"
          title="Contador é Necessário para PJ?"
          description="Análise: quando contratar contador e quanto custa."
        />
        <Prose>
          <h2>Quando é Obrigatório</h2>
          <ul>
            <li>
              <strong>Simples Nacional:</strong> Altamente recomendado
            </li>
            <li>
              <strong>Lucro Real:</strong> Obrigatório por lei
            </li>
            <li>
              <strong>Ganho acima de R$ 78 mil/ano:</strong> Praticamente obrigatório
            </li>
          </ul>

          <h2>Custo Típico</h2>
          <ul>
            <li>
              <strong>Simples Nacional:</strong> R$ 300-500/mês
            </li>
            <li>
              <strong>Lucro Real:</strong> R$ 600-1.500/mês
            </li>
          </ul>

          <h2>O Que Contador Faz</h2>
          <ul>
            <li>Apura e paga impostos (DAS, IRPJ, contribuição social)</li>
            <li>Prepara declaração anual</li>
            <li>Organiza documentação</li>
            <li>Orienta sobre deduções permitidas</li>
          </ul>

          <h2>Pode Não Contratar Se...</h2>
          <p>
            Ganho menor que R$ 50 mil/ano, opera em MEI ou simples bem estruturado, e tem tempo para
            aprender.
          </p>

          <h2>Vale a Pena?</h2>
          <p>
            Um bom contador economiza mais em impostos do que cobra. Entreviste alguns antes de
            contratar.
          </p>
        </Prose>
        <RelatedCalculators />
      </article>
    </PageShell>
  );
}
