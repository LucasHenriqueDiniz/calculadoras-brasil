import { createFileRoute } from "@tanstack/react-router";
import { PageShell, PageHeader, Prose } from "@/components/layout/PageShell";
import { FAQSection } from "@/components/calculator/FAQSection";
import { RelatedCalculators } from "@/components/calculator/RelatedCalculators";
import { Button } from "@/components/ui/button";
import { absoluteUrl } from "@/lib/site";
import { getBlogPost } from "@/lib/blog";

const post = getBlogPost("recibo-rpa-autonomo")!;

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

export const Route = createFileRoute("/blog/recibo-rpa-autonomo")({
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
            O Recibo de Pagamento a Autônomo (RPA) é o documento que formaliza que você prestou um
            serviço e recebeu como autônomo. Sem ele, não existe comprovação de renda perante o INSS
            e a Receita Federal — e isso traz problemas na hora de comprovar renda ou se aposentar.
          </p>

          <h2>O que é o RPA</h2>
          <p>
            É um recibo formal, com valor bruto, descontos e descrição do serviço prestado. Serve
            tanto para o autônomo comprovar renda quanto para o contratante deduzir a despesa e
            recolher corretamente INSS e IRPF retidos na fonte.
          </p>

          <h2>É obrigatório emitir?</h2>
          <p>
            Sim. Autônomos que prestam serviço remunerado devem emitir RPA. Sem ele, não há registro
            formal de renda, o que gera risco de autuação e impede a contagem de tempo de
            contribuição para aposentadoria.
          </p>

          <h2>Como emitir</h2>
          <ul>
            <li>Manualmente (papel + caneta) — simples, mas pouco prático hoje em dia</li>
            <li>Por aplicativo — várias prefeituras oferecem apps oficiais de emissão</li>
            <li>
              Plataformas online — como Nota Fiscal Paulista ou e-Recibo, conforme o município
            </li>
            <li>Com apoio de contador — mais caro, mas garante que tudo fique regularizado</li>
          </ul>

          <h2>Informações que não podem faltar</h2>
          <ul>
            <li>Nome e CPF de quem presta o serviço</li>
            <li>Nome e CNPJ (ou CPF) de quem contratou e pagou</li>
            <li>Valor bruto e descontos de INSS e IRPF, quando aplicável</li>
            <li>Descrição clara do serviço prestado</li>
            <li>Data de emissão</li>
          </ul>

          <h2>Prazos e erros comuns</h2>
          <p>
            O recibo deve ser emitido no momento do pagamento, e os recolhimentos retidos seguem os
            prazos mensais da Receita Federal (geralmente até o dia 20 do mês seguinte). Os erros
            mais comuns são não emitir o recibo, alterar valores depois de emitido e registrar
            valores inconsistentes com o que foi de fato recebido.
          </p>

          <Button asChild className="my-6" size="lg">
            <a href="/calculadora-inss-autonomo">Simular INSS e IRPF do autônomo</a>
          </Button>
        </Prose>

        <FAQSection items={post.faqs} />
        <RelatedCalculators excludeSlug="inss-autonomo" />
      </article>
    </PageShell>
  );
}
