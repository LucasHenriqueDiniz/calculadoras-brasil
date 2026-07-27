import { createFileRoute } from "@tanstack/react-router";
import { PageShell, PageHeader, Prose } from "@/components/layout/PageShell";
import { FAQSection } from "@/components/calculator/FAQSection";
import { RelatedCalculators } from "@/components/calculator/RelatedCalculators";
import { Button } from "@/components/ui/button";
import { absoluteUrl } from "@/lib/site";
import { getBlogPost } from "@/lib/blog";

const post = getBlogPost("investimentos-isentos-irpf")!;

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

export const Route = createFileRoute("/blog/investimentos-isentos-irpf")({
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
            Nem todo investimento paga imposto de renda. Conhecer as opções isentas ajuda a aumentar
            o rendimento líquido da sua carteira sem assumir risco extra — e ainda ajuda no
            planejamento tributário pessoal.
          </p>

          <h2>Poupança tradicional</h2>
          <p>
            <strong>Rendimento:</strong> aproximadamente 70% da taxa Selic quando ela está acima de
            8,5% ao ano.
          </p>
          <p>
            <strong>Vantagem:</strong> totalmente isenta de IRPF e de fácil acesso, mas rende menos
            que a maioria das alternativas de renda fixa isenta.
          </p>

          <h2>LCI — Letra de Crédito Imobiliário</h2>
          <p>
            <strong>Rendimento:</strong> geralmente 90% a 95% da taxa DI.
          </p>
          <p>
            <strong>Risco:</strong> baixo, garantido por lastro imobiliário e coberto pelo FGC até o
            limite legal.
          </p>
          <p>
            <strong>Isenção de IRPF:</strong> total para pessoa física.
          </p>

          <h2>LCA — Letra de Crédito do Agronegócio</h2>
          <p>
            <strong>Rendimento:</strong> também entre 90% e 95% da taxa DI.
          </p>
          <p>
            <strong>Risco:</strong> baixo, lastreado em recebíveis do agronegócio.
          </p>
          <p>
            <strong>Isenção de IRPF:</strong> total para pessoa física.
          </p>

          <h2>Debêntures incentivadas</h2>
          <p>
            <strong>Rendimento:</strong> costuma superar 100% da taxa DI em emissões de empresas de
            infraestrutura.
          </p>
          <p>
            <strong>Isenção de IRPF:</strong> parcial, geralmente entre 50% e 75% conforme a
            estrutura da emissão.
          </p>
          <p>
            <strong>Risco:</strong> médio, pois depende da saúde financeira da empresa emissora.
          </p>

          <h2>Tesouro Direto: não isento, mas otimizável</h2>
          <p>
            O Tesouro Direto segue a tabela regressiva de IRPF: 22,5% para resgates em até 6 meses,
            caindo gradualmente até 15% acima de 2 anos. Quanto mais tempo você mantém o
            investimento, menor o imposto pago no resgate.
          </p>

          <Button asChild className="my-6" size="lg">
            <a href="/calculadora-irpf-2026">Simular impacto do IRPF nos meus investimentos</a>
          </Button>
        </Prose>

        <FAQSection items={post.faqs} />
        <RelatedCalculators excludeSlug="irpf-2026" />
      </article>
    </PageShell>
  );
}
