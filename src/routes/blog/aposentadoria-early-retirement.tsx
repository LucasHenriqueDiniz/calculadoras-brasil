import { createFileRoute } from "@tanstack/react-router";
import { PageShell, PageHeader, Prose } from "@/components/layout/PageShell";
import { FAQSection } from "@/components/calculator/FAQSection";
import { RelatedCalculators } from "@/components/calculator/RelatedCalculators";
import { Button } from "@/components/ui/button";
import { absoluteUrl } from "@/lib/site";
import { getBlogPost } from "@/lib/blog";

const post = getBlogPost("aposentadoria-early-retirement")!;

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: post.faqs.map((faq) => ({
    "@type": "Question",
    name: faq.question,
    acceptedAnswer: { "@type": "Answer", text: faq.answer },
  })),
};

const articleSchema = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: post.title,
  description: post.description,
  datePublished: post.publishedAt,
  dateModified: post.updatedAt,
  author: { "@type": "Organization", name: post.author },
};

export const Route = createFileRoute("/blog/aposentadoria-early-retirement")({
  head: () => ({
    meta: [
      { title: `${post.title} | Calcule Brasil` },
      { name: "description", content: post.description },
      { name: "keywords", content: post.keywords.join(", ") },
      { property: "og:title", content: post.title },
      { property: "og:description", content: post.description },
      { property: "og:type", content: "article" },
    ],
    links: [{ rel: "canonical", href: absoluteUrl(`/blog/${post.slug}`) }],
    scripts: [
      { type: "application/ld+json", children: JSON.stringify(articleSchema) },
      { type: "application/ld+json", children: JSON.stringify(faqSchema) },
    ],
  }),
  component: BlogPost,
});

function BlogPost() {
  return (
    <PageShell>
      <article>
        <PageHeader
          eyebrow={`${post.category} • ${post.readingTime} min`}
          title={post.title}
          description={post.description}
        />

        <Prose>
          <p>
            A estratégia FIRE (Financial Independence, Retire Early) ganhou popularidade no mundo
            todo e tem versões adaptadas ao Brasil. A ideia central é simples: acumular patrimônio
            suficiente para viver de renda passiva antes da idade tradicional de aposentadoria.
          </p>

          <h2>A regra dos 4%</h2>
          <p>
            É a estimativa mais usada no planejamento de aposentadoria antecipada: você pode sacar
            4% do seu patrimônio investido por ano, de forma sustentável, sem esgotar o capital ao
            longo de décadas. Com R$ 1 milhão investido, seria possível gastar cerca de R$ 40 mil
            por ano.
          </p>

          <h2>Quanto poupar para viver de renda</h2>
          <p>Multiplique seus gastos anuais desejados por 25 (o inverso de 4%):</p>
          <ul>
            <li>
              Gasto de R$ 10 mil/mês (R$ 120 mil/ano): precisa de aproximadamente R$ 3 milhões
            </li>
            <li>
              Gasto de R$ 30 mil/mês (R$ 360 mil/ano): precisa de aproximadamente R$ 9 milhões
            </li>
          </ul>

          <h2>Tempo estimado até a aposentadoria</h2>
          <p>
            O prazo depende principalmente da taxa de poupança sobre a renda, não só do quanto você
            ganha:
          </p>
          <ul>
            <li>Poupando 50% da renda: independência financeira em cerca de 17 anos</li>
            <li>Poupando 60% da renda: cerca de 12 anos</li>
          </ul>

          <h2>Estratégias legais para acelerar o processo</h2>
          <ul>
            <li>Maximize a renda (negociação salarial, PJ, investimento em qualificação)</li>
            <li>Reduza gastos sem comprometer qualidade de vida</li>
            <li>
              Invista em Tesouro Direto, LCI e LCA — rendimento mais previsível e, no caso de
              LCI/LCA, isento de IRPF
            </li>
            <li>
              Contribua para previdência complementar (PGBL), que deduz o IRPF hoje e forma poupança
              para o futuro
            </li>
          </ul>

          <h2>Cuidado com o IRPF na fase de renda passiva</h2>
          <p>
            Rendimentos de investimentos tributados (como Tesouro Direto e fundos) pagam IRPF
            conforme a tabela regressiva. Planeje esse desconto na sua projeção de renda mensal para
            não superestimar quanto vai realmente sobrar.
          </p>

          <Button asChild className="my-6" size="lg">
            <a href="/calculadora-previdencia-complementar">
              Simular minha previdência complementar
            </a>
          </Button>
        </Prose>

        <FAQSection items={post.faqs} />
        <RelatedCalculators excludeSlug="previdencia-complementar" />
      </article>
    </PageShell>
  );
}
