import { createFileRoute } from "@tanstack/react-router";
import { PageShell, PageHeader, Prose } from "@/components/layout/PageShell";
import { FAQSection } from "@/components/calculator/FAQSection";
import { RelatedCalculators } from "@/components/calculator/RelatedCalculators";
import { RelatedPosts } from "@/components/calculator/RelatedPosts";
import { relatedPostsForPost } from "@/data/calculators";
import { absoluteUrl } from "@/lib/site";
import { getBlogPost } from "@/lib/blog";
import { lastmodFor } from "@/lib/seo-pages";

const post = getBlogPost("planejamento-tributario")!;

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
  dateModified: lastmodFor(`/blog/${post.slug}`),
  author: { "@type": "Organization", name: post.author },
};

export const Route = createFileRoute("/blog/planejamento-tributario")({
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
            Planejamento tributário não é evasão fiscal (ilegal), é otimização (legal). Existem
            estratégias que todo brasileiro pode usar para reduzir impostos de forma ética.
          </p>

          <h2>Previdência Complementar</h2>
          <p>
            Contribuindo até 12% do seu rendimento tributável em PGBL, você reduz seu IRPF hoje e
            constrói poupança para aposentadoria. Ganho duplo.
          </p>

          <h2>Regime Simplificado</h2>
          <p>
            Se tem poucos gastos dedutíveis, o regime simplificado (20% de dedução fixa, até R$
            17.640,00 por ano) pode ser melhor que o completo. Lembre que ele substitui todas as
            outras deduções, dependentes inclusive. Compare na calculadora IRPF.
          </p>

          <h2>Deduções com Educação</h2>
          <p>
            Gastos com educação (sua ou de dependentes) são dedutíveis até R$ 3.561,50/ano. Cursos
            profissionais, idiomas, e-learning contam.
          </p>

          <h2>Saúde Sem Limite</h2>
          <p>
            Despesas médicas e odontológicas são 100% dedutíveis sem limite máximo. Plano de saúde,
            óculos, aparelho auditivo, tudo entra.
          </p>

          <h2>Investimentos com Isenção</h2>
          <p>
            Poupança tradicional (até R$ 500 mensais) é isenta. Debêntures incentivadas têm isenção
            parcial. Aproveite essas brechas legais.
          </p>

          <h2>Conclusão</h2>
          <p>
            Planejamento tributário eficiente é conhecer e usar as brecha legais que a lei oferece.
            Consulte um contador para sua situação específica.
          </p>
        </Prose>

        <FAQSection items={post.faqs} />
        <div className="mx-auto max-w-3xl space-y-10 px-4 pb-14 sm:px-6">
          <RelatedCalculators />
          <RelatedPosts slugs={relatedPostsForPost("planejamento-tributario")} />
        </div>
      </article>
    </PageShell>
  );
}
