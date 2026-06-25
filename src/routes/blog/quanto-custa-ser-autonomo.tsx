import { createFileRoute } from "@tanstack/react-router";
import { PageShell, PageHeader, Prose } from "@/components/layout/PageShell";
import { FAQSection } from "@/components/calculator/FAQSection";
import { RelatedCalculators } from "@/components/calculator/RelatedCalculators";
import { Button } from "@/components/ui/button";
import { absoluteUrl } from "@/lib/site";
import { getBlogPost } from "@/lib/blog";

const post = getBlogPost("quanto-custa-ser-autonomo")!;

const articleSchema = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: post.title,
  description: post.description,
  datePublished: post.publishedAt,
  dateModified: post.updatedAt,
  author: { "@type": "Organization", name: post.author },
};

export const Route = createFileRoute("/blog/quanto-custa-ser-autonomo")({
  head: () => ({
    meta: [
      { title: `${post.title} | Calcule Brasil` },
      { name: "description", content: post.description },
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
            Ser autônomo traz liberdade, mas também traz responsabilidades financeiras que muitos
            não preveem. Além de ganhar sua renda, você paga INSS, IRPF e gerencia despesas. Este
            guia mostra quanto realmente custa ser autônomo no Brasil.
          </p>

          <h2>Quanto você precisa ganhar</h2>
          <p>
            Se você ganha R$ 5.000 como autônomo, não é R$ 5.000 que você fica. Precisa descontar:
          </p>

          <h3>INSS Autônomo</h3>
          <p>
            Contribuição de ~20% do ganho (ou pode escolher contribução simplificada de 11% da
            remuneração). É obrigatório para ter direito a benefícios.
          </p>

          <h3>IRPF</h3>
          <p>
            Se ganha acima de R$ 28.559,70/ano, paga IRPF normal com alíquotas progressivas. Sem
            retenção na fonte, você fica responsável por apurar e pagar.
          </p>

          <h3>Despesas Dedutiveis</h3>
          <p>
            Equipamentos, materiais, combustível, aluguel do espaço de trabalho — tudo que for
            necessário para sua atividade é dedutível do IRPF.
          </p>

          <h2>Exemplo prático</h2>
          <ul>
            <li>Ganho mensal: R$ 5.000</li>
            <li>Ganho anual: R$ 60.000</li>
            <li>INSS autônomo (20%): -R$ 12.000</li>
            <li>Ganho após INSS: R$ 48.000</li>
            <li>Deduções anuais: R$ 8.000</li>
            <li>Base para IRPF: R$ 40.000</li>
            <li>Estimado IRPF (15-22%): -R$ 6.000</li>
            <li>Ganho líquido anual: R$ 34.000 (57% do bruto)</li>
          </ul>

          <h2>Como planejar</h2>
          <p>
            Mantenha registro de ganhos e despesas. Separe 30-40% da renda para impostos. Considere
            contribuição para previdência complementar. Consulte um contador.
          </p>

          <Button asChild className="my-6" size="lg">
            <a href="/calculadora-inss-autonomo">Simular ganho líquido</a>
          </Button>

          <h2>Conclusão</h2>
          <p>
            Ser autônomo é viável, mas exige planejamento. Saiba quanto você realmente vai receber
            depois de impostos para não se surpreender.
          </p>
        </Prose>

        <FAQSection items={post.faqs} />
        <RelatedCalculators />
      </article>
    </PageShell>
  );
}
