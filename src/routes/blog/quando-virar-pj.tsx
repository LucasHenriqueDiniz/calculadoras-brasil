import { createFileRoute } from "@tanstack/react-router";
import { PageShell, PageHeader, Prose } from "@/components/layout/PageShell";
import { FAQSection } from "@/components/calculator/FAQSection";
import { RelatedCalculators } from "@/components/calculator/RelatedCalculators";
import { Button } from "@/components/ui/button";
import { absoluteUrl } from "@/lib/site";
import { getBlogPost } from "@/lib/blog";

const post = getBlogPost("quando-virar-pj")!;

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

export const Route = createFileRoute("/blog/quando-virar-pj")({
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
            Receber uma proposta para virar PJ é comum em várias carreiras, mas nem sempre vale a
            pena. A decisão certa depende de renda, estabilidade de clientes e sua tolerância a
            risco — não apenas do valor bruto oferecido.
          </p>

          <h2>Quando PJ não vale a pena</h2>
          <ul>
            <li>Ganho bruto proposto menor que R$ 80.000/ano</li>
            <li>Apenas um cliente fixo, sem flexibilidade (risco de PJ mascarado)</li>
            <li>Você depende de benefícios como FGTS, 13º salário e férias remuneradas</li>
            <li>Sem reserva de emergência de 3 a 6 meses de despesas</li>
          </ul>

          <h2>Quando PJ pode valer a pena</h2>
          <ul>
            <li>Ganho bruto acima de R$ 120.000/ano</li>
            <li>Múltiplos clientes reais ou em potencial (consultoria, freelance)</li>
            <li>Não depende de estabilidade de emprego no curto prazo</li>
            <li>Já tem reserva financeira formada</li>
            <li>Valoriza flexibilidade de horários e local de trabalho</li>
          </ul>

          <h2>A regra dos 30%</h2>
          <p>
            Como referência prática, o PJ precisa ganhar cerca de 30% a mais em valor bruto que o
            CLT equivalente para chegar a um ganho líquido parecido, já que perde benefícios e paga
            mais INSS. Simule seu caso específico antes de aceitar a proposta.
          </p>

          <h2>Cuidado com o PJ mascarado</h2>
          <p>
            Se você trabalha para um único cliente, cumpre 40h semanais fixas e não tem liberdade
            real de horário, isso caracteriza vínculo empregatício disfarçado. A Justiça do Trabalho
            pode reconhecer o vínculo e a empresa pode ser cobrada retroativamente por verbas
            trabalhistas.
          </p>

          <h2>Como decidir com números</h2>
          <p>
            Simule o valor líquido que você teria em CLT (com benefícios) e compare com o ganho
            líquido estimado em PJ (descontando INSS, imposto e contador) para o mesmo valor bruto
            proposto.
          </p>

          <Button asChild className="my-6" size="lg">
            <a href="/calculadora-clt-vs-pj">Comparar CLT vs PJ</a>
          </Button>
        </Prose>

        <FAQSection items={post.faqs} />
        <RelatedCalculators excludeSlug="clt-vs-pj" />
      </article>
    </PageShell>
  );
}
