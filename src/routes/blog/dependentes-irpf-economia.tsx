import { createFileRoute } from "@tanstack/react-router";
import { PageShell, PageHeader, Prose } from "@/components/layout/PageShell";
import { FAQSection } from "@/components/calculator/FAQSection";
import { RelatedCalculators } from "@/components/calculator/RelatedCalculators";
import { Button } from "@/components/ui/button";
import { absoluteUrl } from "@/lib/site";
import { getBlogPost } from "@/lib/blog";

const post = getBlogPost("dependentes-irpf-economia")!;

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

export const Route = createFileRoute("/blog/dependentes-irpf-economia")({
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
            Ter dependentes reduz seu IRPF de forma direta e automática, mas muita gente não sabe
            exatamente quem pode ser incluído nem quanto isso representa em economia real de
            imposto. Este guia mostra os números e as regras de 2026.
          </p>

          <h2>Quanto economiza ter dependentes?</h2>
          <p>
            Em 2026, cada dependente reduz sua base de cálculo do IRPF em R$ 2.275,08. Se você está
            na alíquota de 22,5%, a economia é de aproximadamente R$ 512/ano por dependente. Com
            dois filhos, já são R$ 1.024/ano a menos de imposto.
          </p>

          <h2>Quem conta como dependente?</h2>
          <ul>
            <li>
              <strong>Filhos até 21 anos</strong> (ou até 24 anos se estiverem cursando ensino
              superior ou técnico)
            </li>
            <li>
              <strong>Cônjuge</strong>, mesmo em regime de comunhão de bens
            </li>
            <li>
              <strong>Pais e avós</strong> que estejam sob seu sustento financeiro
            </li>
            <li>
              <strong>Irmãos, netos ou bisnetos menores</strong> sob sua guarda judicial
            </li>
            <li>
              <strong>Enteados</strong>, nas mesmas condições aplicadas aos filhos
            </li>
          </ul>

          <h2>Como declarar um dependente</h2>
          <p>
            No programa da Receita Federal, acesse a ficha "Dependentes" e informe nome completo,
            CPF (obrigatório a partir de 8 anos) e grau de parentesco. Simples, mas o CPF correto é
            essencial para evitar inconsistências.
          </p>

          <h2>Cuidado com a dupla declaração</h2>
          <p>
            É possível declarar filho de ex-companheiro se ele mora com você e depende
            financeiramente do seu sustento. Mas apenas um responsável pode incluir a mesma pessoa
            como dependente no mesmo ano — declarar em duplicidade cai direto na malha fina.
          </p>

          <h2>Vale a pena incluir ou declarar separado?</h2>
          <p>
            Depende da renda de cada dependente. Para quem tem renda baixa ou nula, incluir como
            dependente quase sempre compensa, pois a dedução supera o imposto que essa pessoa
            pagaria declarando sozinha.
          </p>

          <Button asChild className="my-6" size="lg">
            <a href="/calculadora-irpf-2026">Simular economia com dependentes</a>
          </Button>
        </Prose>

        <FAQSection items={post.faqs} />
        <RelatedCalculators excludeSlug="irpf-2026" />
      </article>
    </PageShell>
  );
}
