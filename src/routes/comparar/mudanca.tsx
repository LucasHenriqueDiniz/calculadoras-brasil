import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { PageShell, PageHeader, Prose } from "@/components/layout/PageShell";
import { ComparisonChart } from "@/components/ComparisonChart";
import { absoluteUrl } from "@/lib/site";

const comparisonData = {
  title: "Mudança: Profissional vs DIY",
  columns: ["Mudançadora", "Caminhão Alugado", "Amigos + Caminhão"],
  rows: [
    { feature: "Custo", items: ["R$ 2.000-5.000", "R$ 1.500-2.500", "R$ 500-1.500"] },
    { feature: "Trabalho", items: ["Zero (para você)", "Carregar", "Carregar"] },
    { feature: "Seguro", items: ["Incluído", "Opcional", "Não"] },
    { feature: "Danos/Riscos", items: ["Mínimo", "Médio", "Alto"] },
    { feature: "Tempo", items: ["Rápido (profissional)", "Lento", "Muito lento"] },
    { feature: "Stress", items: ["Nenhum", "Alto", "Alto"] },
  ],
};

export const Route = createFileRoute("/comparar/mudanca")({
  head: () => ({
    meta: [
      { title: "Mudança Profissional vs DIY: Vale a pena? — Calcule Brasil" },
      { name: "description", content: "Compare custo e trabalho: mudançadora profissional vs DIY com amigos." },
      { property: "og:title", content: "Vale a pena contratar mudançadora profissional?" },
      { property: "og:url", content: absoluteUrl("/comparar/mudanca") },
    ],
    links: [{ rel: "canonical", href: absoluteUrl("/comparar/mudanca") }],
  }),
  component: MudancaComparison,
});

function MudancaComparison() {
  return (
    <PageShell>
      <article>
        <PageHeader
          eyebrow="Análise de Custo"
          title="Mudança Profissional vs DIY"
          description="Vale a pena contratar mudançadora ou chamar amigos?"
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

          <h2>Mudançadora Profissional (R$ 2.000-5.000)</h2>
          <ul>
            <li>✅ Você não carrega nada</li>
            <li>✅ Rápido (profissional)</li>
            <li>✅ Seguro incluído</li>
            <li>✅ Zero stress</li>
            <li>❌ Mais caro</li>
          </ul>

          <h2>Caminhão Alugado (R$ 1.500-2.500)</h2>
          <ul>
            <li>✅ Mais barato</li>
            <li>✅ Flexível</li>
            <li>❌ Você carrega tudo</li>
            <li>❌ Demora mais</li>
            <li>❌ Risco de danos</li>
          </ul>

          <h2>Amigos + Caminhão (R$ 500-1.500)</h2>
          <ul>
            <li>✅ Muito barato</li>
            <li>❌ Máximo trabalho</li>
            <li>❌ Máximo risco</li>
            <li>❌ Você deve pizza/bebida</li>
            <li>❌ Demora demais</li>
          </ul>

          <h2>Vale a Pena?</h2>
          <p>
            <strong>Mudança de estúdio/1 quarto:</strong> Caminhão alugado é mais sensato (R$
            1.500-2.000).
          </p>
          <p>
            <strong>Mudança de 2-3 quartos:</strong> Mudançadora (o risco de dano compensa).
          </p>
          <p>
            <strong>Se muito apertado no orçamento:</strong> Caminhão + amigos, mas prepare-se para
            trabalho pesado.
          </p>

          <a
            href="/calculadora-custo-mudanca"
            className="mt-6 inline-block rounded-md bg-primary px-5 py-2 font-semibold text-primary-foreground hover:opacity-90"
          >
            Calcular custo da sua mudança
          </a>
        </Prose>
      </article>
    </PageShell>
  );
}
