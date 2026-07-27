import { createFileRoute } from "@tanstack/react-router";
import { PageShell, PageHeader, Prose } from "@/components/layout/PageShell";
import { FAQSection } from "@/components/calculator/FAQSection";
import { RelatedCalculators } from "@/components/calculator/RelatedCalculators";
import { Button } from "@/components/ui/button";
import { absoluteUrl } from "@/lib/site";
import { getBlogPost } from "@/lib/blog";

const post = getBlogPost("como-calcular-salario-pj")!;

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

export const Route = createFileRoute("/blog/como-calcular-salario-pj")({
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
            Receber uma proposta de trabalho como PJ costuma vir acompanhada de uma dúvida simples,
            mas cara: quanto desse valor bruto realmente vai sobrar no fim do mês? Ao contrário do
            CLT, no PJ não existe retenção automática na folha — você (ou seu contador) é quem apura
            e recolhe os impostos. Veja o passo a passo completo.
          </p>

          <h2>Passo 1: Defina o valor bruto</h2>
          <p>
            É o valor que o cliente paga ou que você cobra pela nota fiscal mensal. Exemplo usado
            neste guia: <strong>R$ 10.000/mês</strong>.
          </p>

          <h2>Passo 2: Desconte o INSS</h2>
          <p>
            Como contribuinte individual, você pode recolher 20% sobre o salário de contribuição ou
            optar pelo plano simplificado de 11% (sem contar tempo para aposentadoria por tempo de
            contribuição). Considerando 20%: R$ 10.000 × 20% = <strong>R$ 2.000</strong>.
          </p>

          <h2>Passo 3: Desconte o contador</h2>
          <p>
            Um contador para PJ pequeno custa em média 5% do faturamento ou um valor fixo mensal: R$
            10.000 × 5% = <strong>R$ 500</strong>.
          </p>

          <h2>Passo 4: Calcule o imposto sobre o restante</h2>
          <p>
            Base restante: R$ 10.000 − R$ 2.000 − R$ 500 = R$ 7.500. Dependendo do regime tributário
            (Simples Nacional ou IRPF sobre pró-labore/lucro), a alíquota efetiva costuma ficar
            entre 15% e 22%: aproximadamente <strong>R$ 1.125 a R$ 1.650</strong>.
          </p>

          <h2>Passo 5: Some tudo e chegue ao líquido</h2>
          <p>
            R$ 10.000 − R$ 2.000 − R$ 500 − R$ 1.125 = <strong>R$ 6.375 líquido</strong>, ou
            aproximadamente 64% do valor bruto proposto.
          </p>

          <h2>Regra rápida para decorar</h2>
          <p>
            Na maioria dos casos, o PJ fica com 55% a 70% do valor bruto em líquido — o restante vai
            para INSS, impostos e contador. Quanto maior o faturamento e melhor organizado o regime
            tributário, mais perto de 70% você chega.
          </p>

          <h2>Use a calculadora para o seu caso</h2>
          <p>
            Cada situação muda conforme regime tributário, dependentes e deduções. Simule o valor
            exato na calculadora CLT vs PJ e compare com uma proposta CLT equivalente.
          </p>

          <Button asChild className="my-6" size="lg">
            <a href="/calculadora-clt-vs-pj">Calcular meu salário PJ</a>
          </Button>

          <h2>Conclusão</h2>
          <p>
            Calcular o salário PJ líquido evita surpresas na hora de negociar propostas. Sempre peça
            um valor bruto que compense o INSS mais alto, o custo do contador e a ausência de
            benefícios como FGTS e 13º.
          </p>
        </Prose>

        <FAQSection items={post.faqs} />
        <RelatedCalculators excludeSlug="clt-vs-pj" />
      </article>
    </PageShell>
  );
}
