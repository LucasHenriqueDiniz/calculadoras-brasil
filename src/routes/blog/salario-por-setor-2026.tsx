import { createFileRoute } from "@tanstack/react-router";
import { PageShell, PageHeader, Prose } from "@/components/layout/PageShell";
import { RelatedCalculators } from "@/components/calculator/RelatedCalculators";
import { absoluteUrl } from "@/lib/site";

export const Route = createFileRoute("/blog/salario-por-setor-2026")({
  head: () => ({
    meta: [
      { title: "Salário Líquido por Setor em 2026 | Calcule Brasil" },
      {
        name: "description",
        content:
          "Veja quanto fica de salário líquido em diferentes setores: tecnologia, saúde, educação, serviços.",
      },
    ],
    links: [{ rel: "canonical", href: absoluteUrl("/blog/salario-por-setor-2026") }],
  }),
  component: BlogPost,
});

function BlogPost() {
  return (
    <PageShell>
      <article>
        <PageHeader
          eyebrow="guia • 7 min"
          title="Salário Líquido por Setor em 2026"
          description="Descubra quanto fica de salário líquido em diferentes profissões e setores."
        />
        <Prose>
          <h2>Tecnologia</h2>
          <p>
            <strong>Bruto:</strong> R$ 8.000 | <strong>Líquido:</strong> ~R$ 6.200 (22% desconto)
          </p>
          <p>
            Maior IRPF (alíquota 22,5%) mas melhor beneficiário potencial (home office, auxílios).
          </p>

          <h2>Saúde</h2>
          <p>
            <strong>Bruto:</strong> R$ 5.000 | <strong>Líquido:</strong> ~R$ 4.150 (17% desconto)
          </p>
          <p>
            Profissionais: médicos, enfermeiros, dentistas têm IRPF progressivo mas deduções altas
            (educação).
          </p>

          <h2>Educação</h2>
          <p>
            <strong>Bruto:</strong> R$ 4.000 | <strong>Líquido:</strong> ~R$ 3.350 (16% desconto)
          </p>
          <p>
            Servidores públicos têm desconto menor de IRPF, mas professores particulares pagam mais.
          </p>

          <h2>Comércio/Varejo</h2>
          <p>
            <strong>Bruto:</strong> R$ 2.500 | <strong>Líquido:</strong> ~R$ 2.300 (8% desconto)
          </p>
          <p>Salários mais baixos têm IRPF mínimo ou nulo (muitos isentos até R$ 21.503/ano).</p>

          <h2>Como Melhorar Seu Líquido</h2>
          <ul>
            <li>Negocie vale refeição e transporte (não tributáveis)</li>
            <li>Contribua para previdência complementar (deduz IRPF)</li>
            <li>Maxime deduções (educação, saúde)</li>
          </ul>
        </Prose>
        <RelatedCalculators />
      </article>
    </PageShell>
  );
}
