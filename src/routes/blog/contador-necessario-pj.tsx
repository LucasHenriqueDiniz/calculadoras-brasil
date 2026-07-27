import { createFileRoute } from "@tanstack/react-router";
import { PageShell, PageHeader, Prose } from "@/components/layout/PageShell";
import { FAQSection } from "@/components/calculator/FAQSection";
import { RelatedCalculators } from "@/components/calculator/RelatedCalculators";
import { Button } from "@/components/ui/button";
import { absoluteUrl } from "@/lib/site";
import { getBlogPost } from "@/lib/blog";

const post = getBlogPost("contador-necessario-pj")!;

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

export const Route = createFileRoute("/blog/contador-necessario-pj")({
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
            Ao virar PJ, uma das primeiras dúvidas é se realmente precisa contratar um contador ou
            se dá para tocar a contabilidade sozinho. A resposta depende do regime tributário e do
            faturamento, mas na maioria dos casos vale muito a pena.
          </p>

          <h2>Quando é praticamente obrigatório</h2>
          <ul>
            <li>
              <strong>Lucro Real:</strong> contabilidade completa é exigida por lei, com contador
              habilitado.
            </li>
            <li>
              <strong>Simples Nacional com faturamento crescente:</strong> altamente recomendado
              para não errar guias e prazos.
            </li>
            <li>
              <strong>Faturamento acima de R$ 78 mil/ano:</strong> a complexidade tributária já
              justifica o custo do serviço.
            </li>
          </ul>

          <h2>Quanto custa um contador</h2>
          <ul>
            <li>
              <strong>Simples Nacional:</strong> R$ 300 a R$ 500/mês para empresas pequenas.
            </li>
            <li>
              <strong>Lucro Real:</strong> R$ 600 a R$ 1.500/mês, conforme volume de notas e
              funcionários.
            </li>
          </ul>

          <h2>O que o contador realmente faz</h2>
          <ul>
            <li>Apura e recolhe impostos (DAS, IRPJ, CSLL, ISS/ICMS conforme atividade)</li>
            <li>Prepara a declaração anual (DEFIS ou ECF)</li>
            <li>Organiza a folha de pró-labore e eventuais funcionários</li>
            <li>Orienta sobre deduções e o regime tributário mais vantajoso</li>
          </ul>

          <h2>Quando talvez não precise contratar</h2>
          <p>
            Faturamento abaixo de R$ 50 mil/ano operando como MEI, rotina simples e disponibilidade
            para aprender a declaração anual sozinho são cenários em que muitos dispensam o contador
            — pelo menos no início.
          </p>

          <h2>Vale a pena o investimento?</h2>
          <p>
            Um bom contador costuma economizar mais em impostos e multas evitadas do que cobra em
            honorários. Compare pelo menos três orçamentos e pergunte exatamente o que está incluso
            antes de decidir.
          </p>

          <Button asChild className="my-6" size="lg">
            <a href="/calculadora-clt-vs-pj">Simular custo de virar PJ</a>
          </Button>
        </Prose>

        <FAQSection items={post.faqs} />
        <RelatedCalculators excludeSlug="clt-vs-pj" />
      </article>
    </PageShell>
  );
}
