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
            <strong>Dedução fixa:</strong> 20% da renda bruta tributável, limitada a R$ 17.640,00
            por ano em 2026. Esse desconto entra no lugar de todas as outras deduções — educação,
            saúde, previdência e dependentes.
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
            <strong>Simplificado:</strong> dedução de R$ 12.000 (20% de R$ 60.000, abaixo do teto de
            R$ 17.640,00)
          </p>
          <p>
            <strong>Completo com dependentes:</strong> R$ 2.275,08 × 2 filhos + R$ 3.500 de educação
            + R$ 5.000 de saúde = R$ 13.050,16 em deduções
          </p>
          <p>
            <strong>Resultado:</strong> o completo deduz R$ 1.050,16 a mais, o que dá cerca de R$
            236 a menos de imposto pela tabela. Só que, nessa faixa de renda, a redução da Lei
            15.270/2025 zera o imposto nos dois regimes — a escolha só começa a pesar no bolso em
            rendas mais altas, quando a redução já acabou.
          </p>

          <h2>Como decidir</h2>
          <p>
            Some suas despesas dedutíveis reais do ano (educação + saúde + previdência +
            dependentes) e compare com o desconto simplificado: 20% da sua renda bruta tributável,
            até o teto de R$ 17.640,00. Se a soma real for maior, o completo compensa. Acima de R$
            88.200 de rendimentos o desconto simplificado trava no teto, e é aí que o completo
            costuma ganhar terreno.
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
