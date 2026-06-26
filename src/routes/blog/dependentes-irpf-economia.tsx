import { createFileRoute } from "@tanstack/react-router";
import { PageShell, PageHeader, Prose } from "@/components/layout/PageShell";
import { RelatedCalculators } from "@/components/calculator/RelatedCalculators";
import { absoluteUrl } from "@/lib/site";

export const Route = createFileRoute("/blog/dependentes-irpf-economia")({
  head: () => ({
    meta: [
      { title: "Dependentes IRPF: Como Reduzem Imposto | Calcule Brasil" },
      {
        name: "description",
        content:
          "Cada dependente reduz R$ 2.275/ano do IRPF. Saiba quem conta e como isso impacta seu imposto.",
      },
    ],
    links: [{ rel: "canonical", href: absoluteUrl("/blog/dependentes-irpf-economia") }],
  }),
  component: BlogPost,
});

function BlogPost() {
  return (
    <PageShell>
      <article>
        <PageHeader
          eyebrow="guia • 6 min"
          title="Dependentes IRPF: Como Reduzem Imposto"
          description="Cada dependente economiza cerca de R$ 340-610/ano em IRPF. Descubra quem conta e como declarar."
        />
        <Prose>
          <h2>Quanto economiza ter dependentes?</h2>
          <p>
            Em 2026, cada dependente reduz sua base de IRPF em R$ 2.275. Se você está na alíquota de
            22,5%, economiza R$ 512/ano por dependente.
          </p>

          <h2>Quem conta como dependente?</h2>
          <ul>
            <li>
              <strong>Filhos até 21 anos</strong> (ou 24 se estudante)
            </li>
            <li>
              <strong>Cônjuge</strong> (mesmo que casado por comunhão)
            </li>
            <li>
              <strong>Pais e avós a seu cargo</strong>
            </li>
            <li>
              <strong>Irmãos menores a seu cargo</strong>
            </li>
            <li>
              <strong>Enteados e equiparados</strong>
            </li>
          </ul>

          <h2>Como declarar?</h2>
          <p>
            No programa da Receita, na seção "Dependentes", adicione o nome, CPF e relação. Simples
            assim.
          </p>

          <h2>Pode declarar filhos de ex-companheiro?</h2>
          <p>
            Sim, se o filho mora com você e depende financeiramente. Mas cuidado com dupla
            declaração - só um responsável por filho.
          </p>
        </Prose>
        <RelatedCalculators />
      </article>
    </PageShell>
  );
}
