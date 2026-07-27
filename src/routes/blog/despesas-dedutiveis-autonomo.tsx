import { createFileRoute } from "@tanstack/react-router";
import { PageShell, PageHeader, Prose } from "@/components/layout/PageShell";
import { FAQSection } from "@/components/calculator/FAQSection";
import { RelatedCalculators } from "@/components/calculator/RelatedCalculators";
import { Button } from "@/components/ui/button";
import { absoluteUrl } from "@/lib/site";
import { getBlogPost } from "@/lib/blog";

const post = getBlogPost("despesas-dedutiveis-autonomo")!;

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

export const Route = createFileRoute("/blog/despesas-dedutiveis-autonomo")({
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
            Muitos autônomos pagam mais IRPF do que deveriam porque não descontam despesas que a lei
            permite abater. Conhecer essas categorias e guardar os comprovantes certos reduz
            legalmente sua base de cálculo.
          </p>

          <h2>Equipamentos e ferramentas de trabalho</h2>
          <p>
            Notebook, câmera, microfone e ferramentas específicas da sua atividade são dedutíveis.
            Guarde sempre a nota fiscal — sem ela, a Receita pode negar a dedução em uma eventual
            auditoria.
          </p>

          <h2>Combustível e transporte</h2>
          <p>
            Se usa o carro para trabalhar, é possível descontar combustível, seguro, manutenção e
            IPVA de forma proporcional ao uso profissional do veículo (não o uso pessoal).
          </p>

          <h2>Aluguel do espaço de trabalho</h2>
          <p>
            Trabalhando em casa, você pode deduzir o percentual do aluguel proporcional ao espaço
            usado exclusivamente para o trabalho. Exemplo: se o escritório ocupa 1/4 do imóvel, dá
            para descontar 25% do valor do aluguel.
          </p>

          <h2>Internet e telefone</h2>
          <p>
            Parcialmente dedutíveis, proporcional ao uso profissional. Guarde as faturas mensais
            como comprovante.
          </p>

          <h2>Material de consumo</h2>
          <p>
            Papel, tinta, suprimentos e materiais usados diretamente na atividade, sempre com
            comprovante.
          </p>

          <h2>Cursos e educação profissional</h2>
          <p>
            Treinamentos e cursos relacionados à sua área de atuação são dedutíveis, respeitando o
            limite anual de dedução com educação.
          </p>

          <h2>Cuidado: comprovação é obrigatória</h2>
          <p>
            A Receita Federal pode auditar suas deduções a qualquer momento. Organize recibos, notas
            fiscais e comprovantes por categoria — sem comprovante, não há dedução válida, e o
            imposto pode ser cobrado retroativamente com multa e juros.
          </p>

          <Button asChild className="my-6" size="lg">
            <a href="/calculadora-inss-autonomo">Simular meu imposto como autônomo</a>
          </Button>
        </Prose>

        <FAQSection items={post.faqs} />
        <RelatedCalculators excludeSlug="inss-autonomo" />
      </article>
    </PageShell>
  );
}
