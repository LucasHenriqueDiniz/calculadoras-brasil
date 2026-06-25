import { createFileRoute } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { PageShell, PageHeader, Prose } from "@/components/layout/PageShell";
import { absoluteUrl } from "@/lib/site";
import { getBlogPost } from "@/lib/blog";

const POST_SLUG = "quanto-custa-morar-sozinho";
const post = getBlogPost(POST_SLUG)!;

const articleSchema = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: post.title,
  description: post.description,
  datePublished: post.publishedAt,
  dateModified: post.updatedAt,
  author: { "@type": "Organization", name: post.author },
};

export const Route = createFileRoute("/blog/quanto-custa-morar-sozinho")({
  head: () => ({
    meta: [
      { title: `${post.title} | Calcule Brasil` },
      { name: "description", content: post.description },
      { property: "og:title", content: post.title },
      { property: "og:description", content: post.description },
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
          eyebrow={`${post.category} • ${post.readingTime} min de leitura`}
          title={post.title}
          description={post.description}
        />

        <Prose>
          <p>
            Morar sozinho é um grande passo. Mas quanto custa realmente? Entre aluguel, condomínio,
            contas, mercado e imprevistos, o valor pode surpreender.
          </p>

          <h2>Resumo rápido: Quanto custa morar sozinho?</h2>
          <ul>
            <li>
              <strong>Custo mensal médio:</strong> R$ 1.500 a R$ 3.000 (São Paulo/Rio)
            </li>
            <li>
              <strong>Custos iniciais:</strong> R$ 5.000 a R$ 10.000 (caução, móveis, etc)
            </li>
            <li>
              <strong>Maior despesa:</strong> Aluguel (40-50% do orçamento)
            </li>
          </ul>

          <h2>Custos mensais fixos</h2>

          <h3>Aluguel</h3>
          <p>A maior parcela do seu orçamento. Varia muito por cidade:</p>
          <ul>
            <li>Estúdio em SP: R$ 800-1.500</li>
            <li>1 quarto em SP: R$ 1.200-2.000</li>
            <li>Cidades do interior: R$ 500-1.000</li>
          </ul>

          <h3>Condomínio + IPTU</h3>
          <p>Não esqueça desses custos:</p>
          <ul>
            <li>Condomínio: R$ 200-500</li>
            <li>IPTU: R$ 50-200</li>
          </ul>

          <h3>Contas básicas</h3>
          <ul>
            <li>Luz: R$ 100-200</li>
            <li>Água: R$ 40-80</li>
            <li>Gás: R$ 50-100</li>
            <li>Internet: R$ 80-150</li>
          </ul>

          <h2>Custos variáveis</h2>

          <h3>Alimentação</h3>
          <p>
            Varia conforme hábito. Se cozinhar em casa: R$ 400-600. Se comer fora: R$ 800-1.200+.
          </p>

          <h3>Transporte</h3>
          <ul>
            <li>Passagem mensal: R$ 120-200 (metrô/ônibus)</li>
            <li>Ou gasolina/uber: R$ 300-500</li>
          </ul>

          <h3>Higiene e limpeza</h3>
          <p>R$ 100-150 por mês em produtos básicos.</p>

          <h2>Custos iniciais (primeira vez)</h2>
          <ul>
            <li>Caução: 1-3 meses de aluguel</li>
            <li>Taxa de imobiliária: 1 mês de aluguel</li>
            <li>Móveis básicos: R$ 2.000-5.000</li>
            <li>Eletrodomésticos: R$ 1.000-2.000</li>
            <li>Utensílios: R$ 500-1.000</li>
          </ul>

          {/* CTA */}
          <div className="my-8 rounded-lg border border-border bg-surface p-6">
            <h3 className="mb-3">Use nossa calculadora</h3>
            <p className="mb-4 text-muted-foreground">
              Coloque seus valores de aluguel, contas e hábitos para ver o custo real.
            </p>
            <a
              href="/calculadora-morar-sozinho"
              className="inline-flex items-center gap-2 rounded-md bg-primary px-5 py-3 font-semibold text-primary-foreground hover:opacity-90"
            >
              Calcular <ArrowRight className="h-4 w-4" />
            </a>
          </div>

          <h2>Dicas de economia</h2>
          <ol>
            <li>
              <strong>Compartilhe um imóvel.</strong> Dividir aluguel + contas reduz custos em
              40%.
            </li>
            <li>
              <strong>Cozinhe em casa.</strong> Comida caseira é 60% mais barata que comer fora.
            </li>
            <li>
              <strong>Use transporte público.</strong> Mais barato que carro/uber.
            </li>
            <li>
              <strong>Peça desconto no aluguel.</strong> Se pagar à vista, muitos proprietários
              descontam 5-10%.
            </li>
          </ol>
        </Prose>
      </article>
    </PageShell>
  );
}
