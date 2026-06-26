import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { PageShell, PageHeader, Prose } from "@/components/layout/PageShell";
import { ComparisonChart } from "@/components/ComparisonChart";
import { absoluteUrl } from "@/lib/site";

const comparisonData = {
  title: "Academia: Preço e Resultados",
  columns: ["Academia", "Treino em Casa", "Online"],
  rows: [
    { feature: "Custo mensal", items: ["R$ 80-200", "R$ 0-100", "R$ 50-100"] },
    { feature: "Equipamento", items: ["Completo", "Mínimo ou nenhum", "Online"] },
    {
      feature: "Variedade de exercícios",
      items: ["Máxima", "Limitada", "Média"],
    },
    {
      feature: "Motivação/Comunidade",
      items: ["Alta (ambiente)", "Baixa (sozinho)", "Média (virtual)"],
    },
    { feature: "Flexibilidade de horário", items: ["Fixa", "Total", "Total"] },
    { feature: "Privacidade", items: ["Baixa", "Alta", "Alta"] },
    {
      feature: "Acompanhamento personal",
      items: ["Extra R$ 50-100/aula", "Caro", "R$ 50-150/mês"],
    },
  ],
};

export const Route = createFileRoute("/comparar/academia")({
  head: () => ({
    meta: [
      { title: "Academia vs Treino em Casa vs Online | Calcule Brasil" },
      {
        name: "description",
        content:
          "Compare: academia x treino em casa x aulas online. Preço, resultados, motivação. Qual compensa mais?",
      },
      { property: "og:title", content: "Academia vs Treino em Casa: Qual vale mais?" },
      { property: "og:url", content: absoluteUrl("/comparar/academia") },
    ],
    links: [{ rel: "canonical", href: absoluteUrl("/comparar/academia") }],
  }),
  component: AcademyComparison,
});

function AcademyComparison() {
  return (
    <PageShell>
      <article>
        <PageHeader
          eyebrow="Comparação de Resultados"
          title="Academia vs Treino em Casa vs Online"
          description="Qual modalidade compensa mais financeiramente?"
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
          <p>A decisão não é só preço, mas preço + resultados + consistência.</p>

          <h2>Tabela de Comparação</h2>
          <ComparisonChart {...comparisonData} />

          <h2>Academia (R$ 80-200/mês)</h2>
          <ul>
            <li>✅ Ambiente motiva</li>
            <li>✅ Equipamento completo</li>
            <li>✅ Comunidade forte</li>
            <li>❌ Horário fixo</li>
            <li>❌ Gasto com estacionamento/transporte</li>
            <li>❌ Menos privacidade</li>
          </ul>

          <h2>Treino em Casa (R$ 0-100/mês)</h2>
          <ul>
            <li>✅ Gratuito ou barato</li>
            <li>✅ Flexível 24/7</li>
            <li>✅ Privado</li>
            <li>❌ Difícil manter consistência</li>
            <li>❌ Precisa montar equipamento</li>
            <li>❌ Sem motivação externa</li>
          </ul>

          <h2>Aulas Online (R$ 50-150/mês)</h2>
          <ul>
            <li>✅ Preço intermediário</li>
            <li>✅ Flexível + Comunidade</li>
            <li>✅ Sem custo de deslocamento</li>
            <li>❌ Precisa equipamento mínimo</li>
            <li>❌ Menos personalizado</li>
          </ul>

          <h2>Qual Vale Mais?</h2>
          <p>
            <strong>Se está começando:</strong> Academia. A comunidade ajuda a manter consistência
            (65% desistem em casa sozinhos).
          </p>
          <p>
            <strong>Se já treina há 1+ ano:</strong> Treino em casa é mais barato (economiza R$
            800-2.400/ano).
          </p>
          <p>
            <strong>Se precisa flexibilidade:</strong> Aulas online. Melhor custo-benefício.
          </p>

          <h2>Custo anual</h2>
          <ul>
            <li>Academia: R$ 960-2.400/ano</li>
            <li>Treino em Casa: R$ 0-1.200/ano (se comprar equipamento)</li>
            <li>Online: R$ 600-1.800/ano</li>
          </ul>

          <p>
            Em 5 anos: Academia = R$ 5.000-12.000. Treino em casa = R$ 2.000-4.000 (se consistente).
          </p>
        </Prose>
      </article>
    </PageShell>
  );
}
