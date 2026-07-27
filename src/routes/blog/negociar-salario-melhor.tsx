import { createFileRoute } from "@tanstack/react-router";
import { PageShell, PageHeader, Prose } from "@/components/layout/PageShell";
import { FAQSection } from "@/components/calculator/FAQSection";
import { RelatedCalculators } from "@/components/calculator/RelatedCalculators";
import { Button } from "@/components/ui/button";
import { absoluteUrl } from "@/lib/site";
import { getBlogPost } from "@/lib/blog";

const post = getBlogPost("negociar-salario-melhor")!;

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

export const Route = createFileRoute("/blog/negociar-salario-melhor")({
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
            Muita gente perde dinheiro na negociação de salário por um motivo simples: confunde o
            valor que quer receber em mão com o valor bruto a pedir. Veja como negociar com base em
            dados e evitar essa armadilha.
          </p>

          <h2>O erro clássico</h2>
          <p>
            Você quer ganhar R$ 4.000/mês em mão, mas pede R$ 4.000 de salário bruto na proposta.
            Resultado: depois dos descontos de INSS e IRPF, recebe apenas cerca de R$ 3.200.
            Frustração total no primeiro contracheque.
          </p>

          <h2>A estratégia correta</h2>
          <ol>
            <li>Defina exatamente quanto precisa receber líquido (em mão) por mês.</li>
            <li>Calcule o valor bruto equivalente usando nossa calculadora de salário líquido.</li>
            <li>Peça esse valor bruto durante a negociação, não o líquido desejado.</li>
            <li>Inclua benefícios (vale refeição, vale transporte, plano de saúde) na proposta.</li>
          </ol>

          <h2>Exemplo prático</h2>
          <p>
            Você precisa de R$ 4.000 em mão e sua alíquota efetiva de IRPF estimada é 15%. A
            calculadora mostra que é preciso pedir cerca de R$ 4.900 de bruto para chegar nesse
            líquido. Você negocia R$ 4.900 + vale refeição + vale transporte.
          </p>

          <h2>Argumentos que fortalecem sua posição</h2>
          <ul>
            <li>
              Pesquise o valor de mercado do seu cargo na sua cidade (Glassdoor, LinkedIn, Catho)
            </li>
            <li>Demonstre experiência, resultados e impacto entregue</li>
            <li>Compare propostas concorrentes, se houver, de forma profissional</li>
          </ul>

          <h2>Benefícios também valem na mesa de negociação</h2>
          <p>
            Vale refeição e vale transporte são relativamente baratos para a empresa oferecer, mas
            não são tributados como salário — ou seja, aumentam sua renda disponível sem subir seu
            IRPF. Peça esses benefícios quando não houver espaço para elevar o salário bruto.
          </p>

          <Button asChild className="my-6" size="lg">
            <a href="/calculadora-salario-liquido">Calcular o bruto que preciso pedir</a>
          </Button>
        </Prose>

        <FAQSection items={post.faqs} />
        <RelatedCalculators excludeSlug="salario-liquido" />
      </article>
    </PageShell>
  );
}
