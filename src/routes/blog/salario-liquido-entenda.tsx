import { createFileRoute } from "@tanstack/react-router";
import { PageShell, PageHeader, Prose } from "@/components/layout/PageShell";
import { FAQSection } from "@/components/calculator/FAQSection";
import { RelatedCalculators } from "@/components/calculator/RelatedCalculators";
import { Button } from "@/components/ui/button";
import { absoluteUrl } from "@/lib/site";
import { getBlogPost } from "@/lib/blog";

const post = getBlogPost("salario-liquido-entenda")!;

const articleSchema = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: post.title,
  description: post.description,
  datePublished: post.publishedAt,
  dateModified: post.updatedAt,
  author: { "@type": "Organization", name: post.author },
};

export const Route = createFileRoute("/blog/salario-liquido-entenda")({
  head: () => ({
    meta: [
      { title: `${post.title} | Calcule Brasil` },
      { name: "description", content: post.description },
      { property: "og:title", content: post.title },
      { property: "og:description", content: post.description },
      { property: "og:type", content: "article" },
    ],
    links: [{ rel: "canonical", href: absoluteUrl(`/blog/${post.slug}`) }],
    scripts: [{ type: "application/ld+json", children: JSON.stringify(articleSchema) }],
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
            Seu salário bruto chegou na folha de pagamento, mas o que você realmente recebe é bem
            menor. Desaparecem IRPF, INSS, sindicato e outras deduções. Entender de onde saem
            esses descontos ajuda você a planejar melhor suas finanças e negociar com mais
            informação.
          </p>

          <h2>De onde saem os descontos?</h2>
          <p>
            Quando seu empregador calcula o salário, ele aplica descontos obrigatórios e opcionais:
          </p>

          <h3>INSS (Obrigatório)</h3>
          <p>
            Contribuição para seguridade social. Alíquota de 8% a 14% conforme sua faixa salarial.
            Garante benefícios como auxílio-doença, maternidade e aposentadoria.
          </p>

          <h3>IRPF (Retenção na Fonte)</h3>
          <p>
            Imposto de Renda retido mensalmente como antecipação. A alíquota varia conforme sua
            renda anual. No final do ano, você declara e acerta: recebe restituição ou paga
            diferença.
          </p>

          <h3>Sindicato (Opcional)</h3>
          <p>
            Mensalidade sindical, geralmente 1 hora/mês de trabalho. Opcional, mas muitos
            convenios coletivos definem automaticamente.
          </p>

          <h3>Vale Refeição/Transporte (Não é tributável)</h3>
          <p>
            Benefício fornecido pelo empregador, não reduz salário bruto. Usa créditos pré-pagos
            em cartão.
          </p>

          <h2>Exemplopratico: do bruto ao líquido</h2>
          <p>
            Vamos simular um salário de R$ 5.000 brutos:
          </p>
          <ul>
            <li>Salário bruto: R$ 5.000</li>
            <li>Desconto INSS (11%): -R$ 550</li>
            <li>Base após INSS: R$ 4.450</li>
            <li>Desconto IRPF (7,5% na retenção): -R$ 334</li>
            <li>Desconto sindicato (1 hora): -R$ 20</li>
            <li>Salário líquido aproximado: R$ 4.096</li>
          </ul>
          <p>
            Você recebe ~18% menos que o bruto. No final do ano, ajusta o IRPF na declaração.
          </p>

          <h2>Como calcular seu salário líquido</h2>
          <p>
            Use nossa calculadora de salário líquido. Informe seu bruto, dependentes e ela calcula
            automaticamente quanto você realmente recebe.
          </p>

          <Button asChild className="my-6" size="lg">
            <a href="/calculadora-salario-liquido">Calcular meu salário líquido</a>
          </Button>

          <h2>Conclusão</h2>
          <p>
            O salário bruto e o líquido são bem diferentes. Conhecer essa diferença ajuda você a
            fazer orçamentos realistas e entender de onde desaparece seu dinheiro.
          </p>
        </Prose>

        <FAQSection items={post.faqs} />

        <RelatedCalculators excludeSlug="salario-liquido" />
      </article>
    </PageShell>
  );
}
