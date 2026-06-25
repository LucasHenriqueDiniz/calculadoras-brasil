import { createFileRoute } from "@tanstack/react-router";
import { PageShell, PageHeader, Prose } from "@/components/layout/PageShell";
import { ComparisonChart } from "@/components/ComparisonChart";
import { absoluteUrl } from "@/lib/site";

const comparisonData = {
  title: "Streaming: Preço e Catálogo",
  columns: ["Netflix", "Disney+", "Prime Video", "HBO Max"],
  rows: [
    {
      feature: "Preço mensal (básico)",
      items: ["R$ 55", "R$ 33", "R$ 15", "R$ 40"],
    },
    {
      feature: "Preço anual",
      items: ["R$ 660", "R$ 400", "R$ 180", "R$ 480"],
    },
    {
      feature: "Qualidade máxima",
      items: ["4K (R$ 165/mês)", "4K incluído", "4K incluído", "4K incluído"],
    },
    {
      feature: "Compartilhamento",
      items: ["1-4 perfis", "4 perfis", "1 conta", "2-4 perfis"],
    },
    {
      feature: "Filmes exclusivos",
      items: ["Muitos", "Poucos", "Alguns", "Vários"],
    },
    {
      feature: "Séries exclusivas",
      items: ["Muitas", "Muitas", "Algumas", "Muitas"],
    },
    {
      feature: "Documentários",
      items: ["Muitos", "Alguns", "Alguns", "Alguns"],
    },
    {
      feature: "Período grátis",
      items: ["Não", "7 dias", "30 dias", "Não"],
    },
  ],
};

export const Route = createFileRoute("/comparar/streaming")({
  head: () => ({
    meta: [
      { title: "Netflix vs Disney+ vs Prime: Qual vale mais? — Calcule Brasil" },
      {
        name: "description",
        content:
          "Compare Netflix, Disney+, Prime Video e HBO Max: preço, catálogo, qualidade e custo anual. Qual é a melhor para você?",
      },
      { property: "og:title", content: "Netflix vs Disney+: Qual vale mais a pena?" },
      { property: "og:url", content: absoluteUrl("/comparar/streaming") },
    ],
    links: [{ rel: "canonical", href: absoluteUrl("/comparar/streaming") }],
  }),
  component: StreamingComparison,
});

function StreamingComparison() {
  return (
    <PageShell>
      <article>
        <PageHeader
          eyebrow="Comparação de Preços"
          title="Netflix vs Disney+ vs Prime Video vs HBO Max"
          description="Qual streaming compensa mais? Compare preço, catálogo e qualidade."
        />

        <Prose>
          <p>
            Escolher entre streaming é uma questão de custo + qualidade + catálogo. Não é só preço
            — é para quanto valor você paga.
          </p>

          <h2>Tabela de Comparação</h2>
          <ComparisonChart {...comparisonData} />

          <h2>Netflix</h2>
          <p>
            <strong>Melhor para:</strong> quem quer catálogo diverso (filmes + séries).
          </p>
          <ul>
            <li>Catálogo: gigantesco, sempre atualizado</li>
            <li>Preço: R$ 55-165/mês conforme qualidade</li>
            <li>Compartilhamento: permite 1-4 perfis (depende do plano)</li>
            <li>Força: originals exclusivas de qualidade</li>
            <li>Fraqueza: sem período grátis</li>
          </ul>

          <h2>Disney+</h2>
          <p>
            <strong>Melhor para:</strong> famílias que gostam de Disney, Marvel, Star Wars.
          </p>
          <ul>
            <li>Catálogo: especializado em família (Disney, Marvel, Star Wars, Pixar)</li>
            <li>Preço: R$ 33/mês (mais barato)</li>
            <li>Compartilhamento: 4 perfis simultâneos</li>
            <li>Força: conteúdo exclusivo de qualidade</li>
            <li>Fraqueza: catálogo menor que Netflix</li>
          </ul>

          <h2>Prime Video</h2>
          <p>
            <strong>Melhor para:</strong> quem já tem Amazon Prime (frete grátis + Prime Video).
          </p>
          <ul>
            <li>Catálogo: médio, mas com séries boas</li>
            <li>Preço: R$ 15/mês (se tiver Prime anual)</li>
            <li>Valor: inclui frete grátis na Amazon</li>
            <li>Força: melhor custo se já usa Prime</li>
            <li>Fraqueza: catálogo menor que Netflix</li>
          </ul>

          <h2>HBO Max</h2>
          <p>
            <strong>Melhor para:</strong> fãs de seriados de drama de qualidade.
          </p>
          <ul>
            <li>Catálogo: forte em séries, fraco em filmes</li>
            <li>Preço: R$ 40-45/mês</li>
            <li>Força: séries dramáticas de ouro (Game of Thrones, Chernobyl, Succession)</li>
            <li>Fraqueza: catálogo menor</li>
          </ul>

          <h2>Qual Escolher?</h2>
          <p>
            <strong>Se quer tudo:</strong> Netflix (catálogo) + Disney+ (Marvel/família).
          </p>
          <p>
            <strong>Se quer economizar:</strong> Disney+ (R$ 33) + Prime Video (R$ 15) = R$ 48/mês
            (vs Netflix R$ 55).
          </p>
          <p>
            <strong>Se quer séries boas:</strong> HBO Max é especialista.
          </p>
          <p>
            <strong>Regra dos 70%:</strong> Se assiste menos de 70% do conteúdo disponível, não
            vale a pena. Cancele e volte quando tiver novo conteúdo.
          </p>

          <h2>Impacto no orçamento mensal</h2>
          <p>
            <strong>1 streaming:</strong> R$ 33-165/mês = R$ 400-2.000/ano
          </p>
          <p>
            <strong>2 streamings:</strong> R$ 88/mês (Disney + Netflix básico) = R$ 1.056/ano
          </p>
          <p>
            <strong>3+ streamings:</strong> R$ 200+/mês = R$ 2.400+/ano (repense!)
          </p>

          <div className="my-8 rounded-lg border border-border bg-surface p-6">
            <h3 className="mb-3 font-semibold">Use nossa calculadora de assinaturas</h3>
            <p className="text-sm text-muted-foreground">
              Liste todas suas assinaturas e veja o impacto real no seu orçamento mensal.
            </p>
            <a
              href="/calculadora-assinaturas"
              className="mt-4 inline-block rounded-md bg-primary px-5 py-2 font-semibold text-primary-foreground hover:opacity-90"
            >
              Calcular meu gasto
            </a>
          </div>
        </Prose>
      </article>
    </PageShell>
  );
}
