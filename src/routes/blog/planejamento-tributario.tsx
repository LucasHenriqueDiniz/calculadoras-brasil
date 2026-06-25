import { createFileRoute } from "@tanstack/react-router";
import { PageShell, PageHeader, Prose } from "@/components/layout/PageShell";
import { FAQSection } from "@/components/calculator/FAQSection";
import { RelatedCalculators } from "@/components/calculator/RelatedCalculators";
import { absoluteUrl } from "@/lib/site";
import { getBlogPost } from "@/lib/blog";

const post = getBlogPost("planejamento-tributario")!;

const articleSchema = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: post.title,
  description: post.description,
  datePublished: post.publishedAt,
  dateModified: post.updatedAt,
  author: { "@type": "Organization", name: post.author },
};

export const Route = createFileRoute("/blog/planejamento-tributario")({
  head: () => ({
    meta: [
      { title: `${post.title} | Calcule Brasil` },
      { name: "description", content: post.description },
    ],
    links: [{ rel: "canonical", href: absoluteUrl(`/blog/${post.slug}`) }],
    scripts: [{ type: "application/ld+json", children: JSON.stringify(articleSchema) }],
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
            Contribuindo até R$ 63.454/ano (13% da renda bruta) em PGBL ou VGBL, você reduz seu
            IRPF hoje e constrói poupança para aposentadoria. Ganho duplo.
          </p>

          <h2>Regime Simplificado</h2>
          <p>
            Se tem poucos gastos dedutíveis, o regime simplificado (20,5% dedução fixa) pode ser
            melhor que o completo. Compare na calculadora IRPF.
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
        <RelatedCalculators />
      </article>
    </PageShell>
  );
}
