import { createFileRoute } from "@tanstack/react-router";
import { PageShell, PageHeader, Prose } from "@/components/layout/PageShell";
import { FAQSection } from "@/components/calculator/FAQSection";
import { RelatedCalculators } from "@/components/calculator/RelatedCalculators";
import { Button } from "@/components/ui/button";
import { absoluteUrl } from "@/lib/site";
import { getBlogPost } from "@/lib/blog";

const post = getBlogPost("salario-por-setor-2026")!;

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

export const Route = createFileRoute("/blog/salario-por-setor-2026")({
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
            O quanto sobra do salário bruto varia bastante conforme o setor, principalmente porque a
            faixa salarial média muda de profissão para profissão — e o IRPF é progressivo. Veja
            estimativas por setor e como melhorar o seu líquido, seja qual for sua área.
          </p>

          <h2>Tecnologia</h2>
          <p>
            <strong>Bruto:</strong> R$ 8.000 | <strong>Líquido estimado:</strong> ~R$ 6.200 (cerca
            de 22% de desconto)
          </p>
          <p>
            Faixa de IRPF mais alta (até 22,5%), mas costuma vir acompanhada de benefícios que
            compensam parte do desconto, como auxílio home office e planos de saúde robustos.
          </p>

          <h2>Saúde</h2>
          <p>
            <strong>Bruto:</strong> R$ 5.000 | <strong>Líquido estimado:</strong> ~R$ 4.150 (cerca
            de 17% de desconto)
          </p>
          <p>
            Médicos, enfermeiros e dentistas têm IRPF progressivo, mas costumam ter deduções altas
            com educação continuada e previdência complementar.
          </p>

          <h2>Educação</h2>
          <p>
            <strong>Bruto:</strong> R$ 4.000 | <strong>Líquido estimado:</strong> ~R$ 3.350 (cerca
            de 16% de desconto)
          </p>
          <p>
            Servidores públicos costumam ter desconto de IRPF proporcionalmente menor pela estrutura
            salarial, enquanto professores da rede privada têm carga tributária um pouco maior.
          </p>

          <h2>Comércio e varejo</h2>
          <p>
            <strong>Bruto:</strong> R$ 2.500 | <strong>Líquido estimado:</strong> ~R$ 2.300 (cerca
            de 8% de desconto)
          </p>
          <p>
            Salários mais próximos do piso regional costumam ter IRPF mínimo ou nulo, já que muitos
            ficam dentro ou perto da faixa de isenção (até R$ 21.503,34/ano).
          </p>

          <h2>Como melhorar seu salário líquido, independente do setor</h2>
          <ul>
            <li>Negocie vale refeição e vale transporte (não são tributados como salário)</li>
            <li>Contribua para previdência complementar, que reduz o IRPF devido</li>
            <li>Maximize deduções permitidas com educação e saúde na declaração anual</li>
          </ul>

          <Button asChild className="my-6" size="lg">
            <a href="/calculadora-salario-liquido">Calcular meu salário líquido</a>
          </Button>
        </Prose>

        <FAQSection items={post.faqs} />
        <RelatedCalculators excludeSlug="salario-liquido" />
      </article>
    </PageShell>
  );
}
