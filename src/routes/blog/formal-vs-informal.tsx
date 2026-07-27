import { createFileRoute } from "@tanstack/react-router";
import { PageShell, PageHeader, Prose } from "@/components/layout/PageShell";
import { FAQSection } from "@/components/calculator/FAQSection";
import { RelatedCalculators } from "@/components/calculator/RelatedCalculators";
import { Button } from "@/components/ui/button";
import { absoluteUrl } from "@/lib/site";
import { getBlogPost } from "@/lib/blog";

const post = getBlogPost("formal-vs-informal")!;

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

export const Route = createFileRoute("/blog/formal-vs-informal")({
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
            Trabalhar sem registro parece mais barato no curto prazo, mas costuma sair caro no longo
            prazo. Veja as diferenças reais entre continuar informal, se registrar como autônomo ou
            abrir MEI.
          </p>

          <h2>Autônomo informal</h2>
          <p>
            <strong>Custo mensal:</strong> R$ 0
          </p>
          <p>
            <strong>Imposto:</strong> pode não recolher nada, mas fica exposto a autuação por
            sonegação se a Receita cruzar dados bancários
          </p>
          <p>
            <strong>Problema:</strong> sem contribuição ao INSS, você não tem direito a
            aposentadoria, auxílio-doença ou salário-maternidade, e não consegue comprovar renda
            para financiamentos.
          </p>

          <h2>Autônomo formal (contribuinte individual)</h2>
          <p>
            <strong>Custo mensal:</strong> R$ 65 a R$ 75 (guia de recolhimento do INSS)
          </p>
          <p>
            <strong>Benefício:</strong> conta tempo de contribuição para aposentadoria, dá direito a
            auxílio-doença e salário-maternidade
          </p>
          <p>
            <strong>Vantagem extra:</strong> comprovação de renda para banco e crédito imobiliário
          </p>

          <h2>MEI</h2>
          <p>
            <strong>Custo mensal:</strong> R$ 65 a R$ 75 (DAS, já incluindo INSS)
          </p>
          <p>
            <strong>Faturamento até:</strong> R$ 81.000/ano
          </p>
          <p>
            <strong>Imposto:</strong> isento de IR dentro do teto, com emissão de nota fiscal
          </p>

          <h2>Comparação prática</h2>
          <p>
            Ganhando até R$ 40 mil/ano, a informalidade pode parecer vantajosa no bolso imediato,
            mas o trabalhador perde todos os direitos previdenciários. Ganhando acima disso, formal
            (autônomo ou MEI) praticamente sempre vale a pena pelo custo baixo frente ao benefício.
          </p>

          <Button asChild className="my-6" size="lg">
            <a href="/calculadora-inss-autonomo">Simular contribuição de autônomo</a>
          </Button>
        </Prose>

        <FAQSection items={post.faqs} />
        <RelatedCalculators excludeSlug="inss-autonomo" />
      </article>
    </PageShell>
  );
}
