import { createFileRoute } from "@tanstack/react-router";
import { PageShell, PageHeader, Prose } from "@/components/layout/PageShell";
import { absoluteUrl } from "@/lib/site";

export const Route = createFileRoute("/sobre")({
  head: () => ({
    meta: [
      { title: "Sobre — Calculadoras Brasil" },
      {
        name: "description",
        content:
          "Conheça o Calculadoras Brasil: um hub independente de calculadoras para decisões cotidianas de orçamento no Brasil.",
      },
      { property: "og:title", content: "Sobre — Calculadoras Brasil" },
      {
        property: "og:description",
        content: "Hub independente de calculadoras para o dia a dia brasileiro.",
      },
      { property: "og:url", content: absoluteUrl("/sobre") },
    ],
    links: [{ rel: "canonical", href: absoluteUrl("/sobre") }],
  }),
  component: SobrePage,
});

function SobrePage() {
  return (
    <PageShell>
      <PageHeader
        eyebrow="Sobre"
        title="Quem somos"
        description="Um projeto independente focado em ajudar brasileiros a tomar decisões financeiras do dia a dia com mais clareza."
      />
      <Prose>
        <p>
          O <strong>Calculadoras Brasil</strong> nasceu da percepção de que muita gente toma
          decisões importantes — trocar de carro, sair da casa dos pais, adotar um pet, contratar
          mais um streaming — sem fazer a conta completa. O resultado costuma ser o mesmo: o
          orçamento aperta no terceiro mês.
        </p>
        <p>
          Nossa proposta é simples: oferecer calculadoras enxutas, em português do Brasil, que
          considerem os custos reais do contexto brasileiro — IPVA, tarifas de concessionária,
          hábitos alimentares, preços de mercado e por aí vai.
        </p>

        <h2>O que prometemos</h2>
        <ul>
          <li>Calculadoras gratuitas e sem necessidade de cadastro.</li>
          <li>Tratamento claro de cada resultado como estimativa, nunca como verdade absoluta.</li>
          <li>Metodologia aberta: explicamos as fórmulas e premissas usadas.</li>
          <li>Conteúdo em linguagem direta, sem jargão financeiro desnecessário.</li>
        </ul>

        <h2>O que não fazemos</h2>
        <ul>
          <li>Não vendemos produtos financeiros nem indicamos investimentos.</li>
          <li>Não prometemos economia garantida.</li>
          <li>Não substituímos consulta a contador, advogado, médico ou veterinário.</li>
        </ul>

        <h2>Como nos sustentamos</h2>
        <p>
          O projeto pretende ser sustentado por publicidade discreta, sem comprometer a leitura nem
          o uso das calculadoras. Enquanto isso, é mantido de forma independente.
        </p>
      </Prose>
    </PageShell>
  );
}
