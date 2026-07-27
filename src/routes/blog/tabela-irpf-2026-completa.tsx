import { createFileRoute } from "@tanstack/react-router";
import { PageShell, PageHeader, Prose } from "@/components/layout/PageShell";
import { FAQSection } from "@/components/calculator/FAQSection";
import { RelatedCalculators } from "@/components/calculator/RelatedCalculators";
import { Button } from "@/components/ui/button";
import { absoluteUrl } from "@/lib/site";
import { getBlogPost } from "@/lib/blog";

const post = getBlogPost("tabela-irpf-2026-completa")!;

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

export const Route = createFileRoute("/blog/tabela-irpf-2026-completa")({
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
            Esta é a referência rápida com todos os valores oficiais do IRPF 2026: alíquotas por
            faixa de renda, valores de dedução por dependente e categoria, e o limite de isenção.
            Use como consulta rápida antes de simular seu imposto na calculadora.
          </p>

          <h2>Alíquotas IRPF 2026</h2>
          <table>
            <tbody>
              <tr>
                <th>Faixa</th>
                <th>Alíquota</th>
              </tr>
              <tr>
                <td>Até R$ 21.503,34</td>
                <td>Isento</td>
              </tr>
              <tr>
                <td>R$ 21.503,35 a R$ 33.503,34</td>
                <td>7,5%</td>
              </tr>
              <tr>
                <td>R$ 33.503,35 a R$ 44.693,59</td>
                <td>15%</td>
              </tr>
              <tr>
                <td>R$ 44.693,60 a R$ 55.471,74</td>
                <td>22,5%</td>
              </tr>
              <tr>
                <td>Acima de R$ 55.471,75</td>
                <td>27,5%</td>
              </tr>
            </tbody>
          </table>
          <p>
            A tabela é progressiva: cada faixa de renda paga apenas a alíquota correspondente a essa
            faixa, não a alíquota máxima sobre o total. Por isso a alíquota efetiva é sempre menor
            que a alíquota marginal.
          </p>

          <h2>Valores de dedução em 2026</h2>
          <ul>
            <li>
              <strong>Por dependente:</strong> R$ 2.275,08/ano
            </li>
            <li>
              <strong>Educação:</strong> até R$ 3.561,50/ano por pessoa
            </li>
            <li>
              <strong>Saúde:</strong> sem limite máximo
            </li>
            <li>
              <strong>Previdência complementar (PGBL):</strong> até 12% da renda bruta anual
            </li>
          </ul>

          <h2>Limite de isenção e obrigatoriedade</h2>
          <p>
            Rendimentos tributáveis até R$ 21.503,34 no ano ficam isentos de IRPF. Já a
            obrigatoriedade de declarar é definida por outro limite, geralmente em torno de R$
            33.888 em rendimentos tributáveis — sempre confirme o valor vigente no site da Receita
            Federal antes de declarar.
          </p>

          <Button asChild className="my-6" size="lg">
            <a href="/calculadora-irpf-2026">Simular meu IRPF 2026</a>
          </Button>
        </Prose>

        <FAQSection items={post.faqs} />
        <RelatedCalculators excludeSlug="irpf-2026" />
      </article>
    </PageShell>
  );
}
