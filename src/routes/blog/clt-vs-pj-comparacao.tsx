import { createFileRoute } from "@tanstack/react-router";
import { PageShell, PageHeader, Prose } from "@/components/layout/PageShell";
import { FAQSection } from "@/components/calculator/FAQSection";
import { RelatedCalculators } from "@/components/calculator/RelatedCalculators";
import { Button } from "@/components/ui/button";
import { absoluteUrl } from "@/lib/site";
import { getBlogPost } from "@/lib/blog";

const post = getBlogPost("clt-vs-pj-comparacao")!;

const articleSchema = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: post.title,
  description: post.description,
  datePublished: post.publishedAt,
  dateModified: post.updatedAt,
  author: { "@type": "Organization", name: post.author },
};

export const Route = createFileRoute("/blog/clt-vs-pj-comparacao")({
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
            Muitas pessoas têm oportunidade de sair de CLT e virar PJ. Mas qual é realmente mais
            vantajoso? A resposta depende de vários fatores: salário bruto, quanto você gasta em
            impostos, benefícios que perde.
          </p>

          <h2>CLT: Segurança com Benefícios</h2>
          <p>
            <strong>Vantagens:</strong>
          </p>
          <ul>
            <li>Benefícios: FGTS, 13º, férias, vale refeição, vale transporte</li>
            <li>Segurança: contrato por lei CLT</li>
            <li>Proteção: regras de rescisão, aviso prévio</li>
            <li>Impostos: retenção automática na folha</li>
          </ul>
          <p>
            <strong>Desvantagens:</strong>
          </p>
          <ul>
            <li>Menos flexibilidade</li>
            <li>Salário limitado às faixas da empresa</li>
          </ul>

          <h2>PJ: Liberdade com Responsabilidade</h2>
          <p>
            <strong>Vantagens:</strong>
          </p>
          <ul>
            <li>Salário pode ser maior (sem limites)</li>
            <li>Deduções fiscais (equipamentos, combustível, aluguel)</li>
            <li>Flexibilidade de horários e local</li>
            <li>Pode pegar múltiplos clientes</li>
          </ul>
          <p>
            <strong>Desvantagens:</strong>
          </p>
          <ul>
            <li>Sem FGTS, 13º, férias remuneradas</li>
            <li>Sem seguro desemprego</li>
            <li>Impostos maiores: INSS 20%, IRPF progressivo</li>
            <li>Sem benefícios (vale refeição, transporte)</li>
            <li>Responsabilidade por retenções e declarações</li>
          </ul>

          <h2>Comparativo Financeiro</h2>
          <p>
            Salário CLT bruto: R$ 5.000
          </p>
          <ul>
            <li>Benefícios (vale + 13º diluído): ~R$ 800/mês</li>
            <li>INSS (11%) + IRPF (~8%): -R$ 950</li>
            <li>Líquido + benefícios: R$ 4.850</li>
          </ul>
          <p>
            PJ equivalente: R$ 6.500 (para igualar 13º e benefícios)
          </p>
          <ul>
            <li>INSS (20%) + IRPF (~15%) + contador: -R$ 2.600</li>
            <li>Líquido: R$ 3.900</li>
          </ul>
          <p>
            <strong>Conclusão:</strong> para CLT ser substituído por PJ, o salário proposto precisa
            ser ~30% maior.
          </p>

          <h2>Use a Calculadora CLT vs PJ</h2>
          <p>
            Simule seu caso específico. Qual salário em PJ iguala seu ganho em CLT?
          </p>

          <Button asChild className="my-6" size="lg">
            <a href="/calculadora-clt-vs-pj">Simular CLT vs PJ</a>
          </Button>

          <h2>Conclusão</h2>
          <p>
            Não é só contas. Considere segurança, benefícios, flexibilidade e sua situação pessoal.
            Para alguns, PJ é libertador. Para outros, CLT é mais seguro. Saiba fazer as contas e
            tomar a melhor decisão.
          </p>
        </Prose>

        <FAQSection items={post.faqs} />
        <RelatedCalculators />
      </article>
    </PageShell>
  );
}
