import { createFileRoute } from "@tanstack/react-router";
import { PageShell, PageHeader, Prose } from "@/components/layout/PageShell";
import { FAQSection } from "@/components/calculator/FAQSection";
import { RelatedCalculators } from "@/components/calculator/RelatedCalculators";
import { Button } from "@/components/ui/button";
import { absoluteUrl } from "@/lib/site";
import { getBlogPost } from "@/lib/blog";

const post = getBlogPost("mei-vs-pj-custo")!;

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

export const Route = createFileRoute("/blog/mei-vs-pj-custo")({
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
            Autônomos e prestadores de serviço em crescimento costumam hesitar entre abrir MEI ou
            formalizar como PJ em outro regime. A resposta certa depende principalmente do
            faturamento anual e da necessidade de contratar funcionários.
          </p>

          <h2>MEI (Microempreendedor Individual)</h2>
          <p>
            <strong>Custo mensal:</strong> R$ 65 a R$ 70 (DAS, já incluindo INSS e ICMS/ISS conforme
            atividade)
          </p>
          <p>
            <strong>Imposto de Renda:</strong> isento dentro do limite de faturamento
          </p>
          <p>
            <strong>Melhor para:</strong> faturamento anual até R$ 81.000
          </p>

          <h2>PJ (Simples Nacional ou Lucro Presumido)</h2>
          <p>
            <strong>Custo mensal:</strong> R$ 400 a R$ 600 (contador e contabilidade regular)
          </p>
          <p>
            <strong>Imposto de Renda:</strong> Simples Nacional (alíquotas de 6% a 16,5% conforme
            anexo e faturamento) ou Lucro Presumido/Real
          </p>
          <p>
            <strong>Melhor para:</strong> faturamento anual acima de R$ 81.000, especialmente acima
            de R$ 120.000
          </p>

          <h2>Comparação direta</h2>
          <p>
            <strong>Ganhando R$ 60.000/ano:</strong> MEI é significativamente mais barato pelo custo
            fixo baixo do DAS.
          </p>
          <p>
            <strong>Ganhando R$ 150.000/ano:</strong> PJ no Simples Nacional tende a compensar mais,
            já que o MEI nem é mais permitido acima do teto de R$ 81.000.
          </p>

          <h2>Diferenças além do custo</h2>
          <ul>
            <li>
              <strong>MEI:</strong> mais simples, menos burocracia, mas com limite de faturamento e
              de contratação (até 1 funcionário)
            </li>
            <li>
              <strong>PJ:</strong> imagem mais profissional, permite contratar equipe, emite nota
              fiscal sem restrição de valor
            </li>
          </ul>

          <Button asChild className="my-6" size="lg">
            <a href="/calculadora-clt-vs-pj">Simular meu regime ideal</a>
          </Button>
        </Prose>

        <FAQSection items={post.faqs} />
        <RelatedCalculators excludeSlug="clt-vs-pj" />
      </article>
    </PageShell>
  );
}
