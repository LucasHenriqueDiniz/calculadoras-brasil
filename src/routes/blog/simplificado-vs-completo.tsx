import { createFileRoute } from "@tanstack/react-router";
import { PageShell, PageHeader, Prose } from "@/components/layout/PageShell";
import { FAQSection } from "@/components/calculator/FAQSection";
import { RelatedCalculators } from "@/components/calculator/RelatedCalculators";
import { Button } from "@/components/ui/button";
import { absoluteUrl } from "@/lib/site";
import { getBlogPost } from "@/lib/blog";

const post = getBlogPost("simplificado-vs-completo")!;

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

export const Route = createFileRoute("/blog/simplificado-vs-completo")({
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
            Na hora de declarar o IRPF, você escolhe entre dois modelos de tributação: o
            simplificado, com dedução fixa, ou o completo, com deduções reais. Escolher o modelo
            errado pode significar pagar mais imposto do que o necessário.
          </p>

          <h2>Regime simplificado</h2>
          <p>
            <strong>Dedução fixa:</strong> 20,5% da renda bruta tributável, dentro de um teto anual
            reajustado pela Receita Federal.
          </p>
          <p>
            <strong>Melhor se:</strong> você tem poucos gastos dedutíveis ou não quer guardar
            comprovantes o ano inteiro.
          </p>
          <p>
            <strong>Vantagem:</strong> simples, rápido e sem risco de glosa por falta de recibo.
          </p>

          <h2>Regime completo</h2>
          <p>
            <strong>Deduções permitidas:</strong> educação (até R$ 3.561,50 por pessoa), saúde (sem
            limite), previdência complementar (até 12% da renda bruta) e dependentes (R$ 2.275,08
            cada).
          </p>
          <p>
            <strong>Melhor se:</strong> você tem gastos altos com saúde/educação ou família grande
            com vários dependentes.
          </p>
          <p>
            <strong>Vantagem:</strong> pode economizar significativamente mais que o desconto fixo.
          </p>

          <h2>Exemplo comparativo</h2>
          <p>Renda anual: R$ 60.000</p>
          <p>
            <strong>Simplificado:</strong> dedução de R$ 12.300 (20,5%)
          </p>
          <p>
            <strong>Completo com dependentes:</strong> R$ 2.275,08 × 2 filhos + R$ 3.500 de educação
            + R$ 5.000 de saúde = R$ 13.050,16 em deduções
          </p>
          <p>
            <strong>Resultado:</strong> nesse cenário, o completo economiza cerca de R$ 750 a mais
            em imposto.
          </p>

          <h2>Como decidir</h2>
          <p>
            Some suas despesas dedutíveis reais do ano (educação + saúde + previdência +
            dependentes) e compare com 20,5% da sua renda bruta. Se a soma real for maior, o
            completo compensa.
          </p>

          <h2>Dica final</h2>
          <p>
            O próprio programa da Receita Federal calcula automaticamente os dois cenários durante o
            preenchimento e indica qual resulta em menos imposto a pagar ou maior restituição.
          </p>

          <Button asChild className="my-6" size="lg">
            <a href="/calculadora-irpf-2026">Comparar os dois regimes</a>
          </Button>
        </Prose>

        <FAQSection items={post.faqs} />
        <RelatedCalculators excludeSlug="irpf-2026" />
      </article>
    </PageShell>
  );
}
