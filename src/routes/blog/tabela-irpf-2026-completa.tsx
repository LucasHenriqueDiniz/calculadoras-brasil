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
            Esta é a referência rápida com os valores oficiais do IRPF 2026: alíquotas por faixa de
            renda, valores de dedução por dependente e categoria, o limite de isenção e a redução da
            Lei 15.270/2025, que abate o imposto depois da tabela. Use como consulta rápida antes de
            simular seu imposto na calculadora.
          </p>

          <h2>Alíquotas IRPF 2026</h2>
          <table>
            <tbody>
              <tr>
                <th>Base de cálculo anual</th>
                <th>Alíquota</th>
                <th>Parcela a deduzir</th>
              </tr>
              <tr>
                <td>Até R$ 29.145,60</td>
                <td>Isento</td>
                <td>—</td>
              </tr>
              <tr>
                <td>R$ 29.145,61 a R$ 33.919,80</td>
                <td>7,5%</td>
                <td>R$ 2.185,92</td>
              </tr>
              <tr>
                <td>R$ 33.919,81 a R$ 45.012,60</td>
                <td>15%</td>
                <td>R$ 4.729,91</td>
              </tr>
              <tr>
                <td>R$ 45.012,61 a R$ 55.976,16</td>
                <td>22,5%</td>
                <td>R$ 8.105,85</td>
              </tr>
              <tr>
                <td>Acima de R$ 55.976,16</td>
                <td>27,5%</td>
                <td>R$ 10.904,66</td>
              </tr>
            </tbody>
          </table>
          <p>
            A tabela é progressiva: cada faixa de renda paga apenas a alíquota correspondente a essa
            faixa, não a alíquota máxima sobre o total. Por isso a alíquota efetiva é sempre menor
            que a alíquota marginal. A parcela a deduzir é o atalho que a Receita usa para chegar ao
            mesmo resultado numa conta só: aplique a alíquota da sua faixa sobre a base de cálculo e
            subtraia a parcela da linha.
          </p>

          <h2>A redução da Lei 15.270/2025</h2>
          <p>
            A tabela acima não conta a história toda, e essa é a mudança de 2026 que mais pesa no
            bolso. A Lei 15.270/2025 não mexeu nas faixas: ela abate um valor do imposto que a
            tabela já calculou.
          </p>
          <ul>
            <li>
              <strong>Renda tributável anual até R$ 60.000:</strong> a redução chega a R$ 2.694,15 e
              zera o imposto devido.
            </li>
            <li>
              <strong>De R$ 60.000,01 a R$ 88.200:</strong> a redução é R$ 8.429,73 menos 0,095575 ×
              os rendimentos tributáveis, diminuindo aos poucos até chegar a zero.
            </li>
            <li>
              <strong>Acima de R$ 88.200:</strong> não há redução.
            </li>
          </ul>
          <p>
            A redução nunca passa do imposto devido: ela pode zerar o que você paga, mas não gera
            restituição por si só. É daí que vem a isenção para quem recebe até cerca de R$ 5.000
            por mês — e não de uma faixa de isenção maior na tabela.
          </p>
          <p>
            <strong>Exemplo:</strong> com R$ 60.000 de rendimentos tributáveis no ano e o desconto
            simplificado de 20% (R$ 12.000), a base cai para R$ 48.000 e a tabela cobra R$ 2.694,15.
            A redução abate exatamente esse valor, e o imposto devido fica em zero.
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
            <li>
              <strong>Desconto simplificado:</strong> 20% dos rendimentos tributáveis, até R$
              17.640,00/ano — e no lugar de todas as deduções acima, dependentes inclusive
            </li>
          </ul>

          <h2>Limite de isenção e obrigatoriedade</h2>
          <p>
            Pela tabela, rendimentos tributáveis até R$ 29.145,60 no ano ficam isentos de IRPF — e a
            redução da Lei 15.270/2025 estende a isenção efetiva até R$ 60.000 de renda tributável
            anual. Já a obrigatoriedade de declarar é definida por outro limite, geralmente em torno
            de R$ 33.888 em rendimentos tributáveis — sempre confirme o valor vigente no site da
            Receita Federal antes de declarar. Ficar isento de imposto não significa ficar
            dispensado de declarar.
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
