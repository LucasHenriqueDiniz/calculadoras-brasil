import { createFileRoute } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";
import { PageShell, PageHeader, Prose } from "@/components/layout/PageShell";
import { absoluteUrl } from "@/lib/site";
import { getBlogPost } from "@/lib/blog";
import { Button } from "@/components/ui/button";

const POST_SLUG = "quanto-custa-ter-carro";
const post = getBlogPost(POST_SLUG)!;

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: post.faqs.map((faq) => ({
    "@type": "Question",
    name: faq.question,
    acceptedAnswer: {
      "@type": "Answer",
      text: faq.answer,
    },
  })),
};

const articleSchema = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: post.title,
  description: post.description,
  image: `${absoluteUrl(post.imageUrl)}`,
  datePublished: post.publishedAt,
  dateModified: post.updatedAt,
  author: {
    "@type": "Organization",
    name: post.author,
  },
  publisher: {
    "@type": "Organization",
    name: "Calcule Brasil",
    logo: {
      "@type": "ImageObject",
      url: `${absoluteUrl("/og-image.png")}`,
    },
  },
};

export const Route = createFileRoute("/blog/quanto-custa-ter-carro")({
  head: () => ({
    meta: [
      { title: `${post.title} | Calcule Brasil` },
      { name: "description", content: post.description },
      { name: "keywords", content: post.keywords.join(", ") },
      { property: "og:title", content: post.title },
      { property: "og:description", content: post.description },
      { property: "og:image", content: absoluteUrl(post.imageUrl) },
      { property: "og:type", content: "article" },
      { property: "og:url", content: absoluteUrl(`/blog/${post.slug}`) },
      { property: "article:published_time", content: post.publishedAt },
      { property: "article:modified_time", content: post.updatedAt },
      { property: "article:author", content: post.author },
    ],
    links: [
      { rel: "canonical", href: absoluteUrl(`/blog/${post.slug}`) },
    ],
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
          eyebrow={`${post.category.charAt(0).toUpperCase() + post.category.slice(1)} • ${post.readingTime} min de leitura`}
          title={post.title}
          description={post.description}
        />

        <Prose>
          {/* INTRODUÇÃO */}
          <p>
            Muitas pessoas focam apenas na parcela do financiamento e esquecem que ter um carro
            envolve bem mais: combustível, IPVA, seguro, manutenção preventiva, pneus, revisões
            e a depreciação natural do veículo.
          </p>

          <p>
            Este guia mostra quanto custa realmente ter um carro no Brasil. E sim, é mais do que
            você imagina.
          </p>

          {/* RESUMO EXECUTIVO */}
          <h2>Quanto custa ter um carro? (Resumo rápido)</h2>
          <ul>
            <li>
              <strong>Custo mensal médio:</strong> R$ 1.200 a R$ 2.500 (carro popular)
            </li>
            <li>
              <strong>Custo anual:</strong> R$ 14.400 a R$ 30.000
            </li>
            <li>
              <strong>Maior vilão:</strong> Depreciação (30-40% do custo total)
            </li>
            <li>
              <strong>Segundo maior:</strong> Combustível (25-35%)
            </li>
          </ul>

          <p>
            Mas isso varia bastante conforme o carro, a cidade, o uso e seus hábitos. Por isso
            temos a{" "}
            <a href="/calculadora-custo-carro">calculadora de custo de carro</a> — basta colocar
            seus números e vê o resultado personalizado.
          </p>

          {/* BREAKDOWN DOS CUSTOS */}
          <h2>Os 8 componentes do custo de um carro</h2>

          <h3>1. Combustível (25-35% do custo)</h3>
          <p>
            É o custo mais visível. Quem roda 800 km por mês e o carro faz 10 km/l vai gastar:
          </p>
          <ul>
            <li>800 km ÷ 10 km/l = 80 litros/mês</li>
            <li>80 litros × R$ 6,00 = R$ 480/mês (se gasolina)</li>
          </ul>
          <p>
            Mas varia por região (Amazonas é mais caro) e seu consumo (carros modernos fazem mais
            km/l).
          </p>

          <h3>2. IPVA (Imposto sobre Propriedade de Veículos)</h3>
          <p>Cobrado anualmente. Alíquota varia por estado (2-4%) e valor do carro:</p>
          <ul>
            <li>Carro de R$ 50.000 × 3% = R$ 1.500/ano = R$ 125/mês</li>
            <li>Carro de R$ 100.000 × 3% = R$ 3.000/ano = R$ 250/mês</li>
          </ul>
          <p>
            Dica: em alguns estados há desconto se você renovar licença antes do prazo. Verifique
            na sua região.
          </p>

          <h3>3. Licenciamento (LICV)</h3>
          <p>
            Cobrado anualmente, mas às vezes é bundle com IPVA. Custa entre R$ 150 e R$ 250 por
            ano (R$ 12-20/mês).
          </p>

          <h3>4. Seguro (8-15% do custo)</h3>
          <p>
            Só o DPVAT é obrigatório (R$ 150-200/ano). Mas seguro completo é recomendado:
          </p>
          <ul>
            <li>Carro popular: R$ 80-150/mês</li>
            <li>Carro intermediário: R$ 120-250/mês</li>
            <li>Carro premium: R$ 200-400/mês</li>
          </ul>
          <p>Varia conforme seu perfil, idade, cidade e histórico de sinistros.</p>

          <h3>5. Manutenção Preventiva (5-10% do custo)</h3>
          <p>Revisões, troca de óleo, filtros, velas:</p>
          <ul>
            <li>Carros novos (sob garantia): R$ 100-200/mês</li>
            <li>Carros com 5 anos: R$ 150-300/mês</li>
            <li>Carros com 10+ anos: R$ 300-500/mês</li>
          </ul>
          <p>Prevenir é mais barato que corrigir. Um motor danificado custa R$ 5.000-8.000.</p>

          <h3>6. Pneus e Estacionamento</h3>
          <p>
            Pneus duram ~3-4 anos (40.000-50.000 km). Um jogo custa R$ 400-1.200 dependendo da
            qualidade:
          </p>
          <ul>
            <li>R$ 800 ÷ 48 meses = R$ 16-17/mês</li>
          </ul>
          <p>
            Estacionamento em SP/RJ: R$ 50-300/mês dependendo da região. Em cidades menores,
            pode ser zero.
          </p>

          <h3>7. Multas e Infrações (Variável)</h3>
          <p>
            Não é gastar que você quer, mas acontece. Se receber 2-3 multas/ano (R$ 200-500
            cada), são ~R$ 40-125/mês.
          </p>

          <h3>8. Depreciação (30-40% do custo total!)</h3>
          <p>
            Aqui está o grande vilão invisível. Seu carro perde valor todo dia, mesmo parado na
            garagem:
          </p>
          <ul>
            <li>Um carro novo perde 15-20% no ano 1</li>
            <li>8-10% nos anos 2-5</li>
            <li>5-8% nos anos 5+</li>
          </ul>
          <p>
            Exemplo: Um carro de R$ 50.000 que depreciamos 8% ao ano custa R$ 4.000/ano = R$
            333/mês só em depreciação. E é o custo mais ignorado!
          </p>

          {/* COMPARAÇÃO POR TIPO DE CARRO */}
          <h2>Custo mensal por tipo de carro</h2>
          <table>
            <thead>
              <tr>
                <th>Tipo</th>
                <th>Exemplo</th>
                <th>Combustível</th>
                <th>IPVA/Seg</th>
                <th>Manutençao</th>
                <th>Deprec.</th>
                <th>Total/mês</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Popular</td>
                <td>Kwid, Mobi</td>
                <td>R$ 400</td>
                <td>R$ 200</td>
                <td>R$ 150</td>
                <td>R$ 200</td>
                <td>R$ 950</td>
              </tr>
              <tr>
                <td>Intermediário</td>
                <td>Onix, HB20</td>
                <td>R$ 500</td>
                <td>R$ 350</td>
                <td>R$ 250</td>
                <td>R$ 500</td>
                <td>R$ 1.600</td>
              </tr>
              <tr>
                <td>Premium</td>
                <td>Jetta, Civic</td>
                <td>R$ 700</td>
                <td>R$ 600</td>
                <td>R$ 400</td>
                <td>R$ 1.000</td>
                <td>R$ 2.700</td>
              </tr>
            </tbody>
          </table>

          {/* 5 DICAS DE ECONOMIA */}
          <h2>5 dicas para economizar no custo do carro</h2>

          <h3>1. Escolha bem na hora de comprar</h3>
          <p>
            Um carro confiável que não dá problemas reduz manutenção em 50%. Pesquise marcas
            confiáveis antes de comprar.
          </p>

          <h3>2. Mantenha pneus calibrados</h3>
          <p>
            Pneus com pressão incorreta aumentam consumo de combustível em 3-5%. Custa zero
            checar mensalmente.
          </p>

          <h3>3. Faça revisões preventivas no prazo</h3>
          <p>
            Uma troca de óleo custa R$ 200. Um motor danificado custa R$ 5.000. Dá para ver
            qual é mais caro.
          </p>

          <h3>4. Compare seguros anualmente</h3>
          <p>
            Seguro é competitivo. Trocar de seguradora a cada 12 meses pode economizar R$ 50-100
            por mês (R$ 600-1.200/ano).
          </p>

          <h3>5. Use a calculadora antes de comprar</h3>
          <p>
            Use nossa{" "}
            <a href="/calculadora-custo-carro">
              calculadora de custo de carro
            </a>{" "}
            para simular quanto cada modelo custa. Alguns carros parecem baratos na concessionária
            mas custam muito mais ao mês.
          </p>

          {/* CTA */}
          <div className="my-8 rounded-lg border border-border bg-surface p-6">
            <h3 className="mb-3">Quer saber o custo real do seu carro?</h3>
            <p className="mb-4 text-muted-foreground">
              Use nossa calculadora. É grátis, sem cadastro e personalizado para seu carro.
            </p>
            <a
              href="/calculadora-custo-carro"
              className="inline-flex items-center gap-2 rounded-md bg-primary px-5 py-3 font-semibold text-primary-foreground hover:opacity-90"
            >
              Abrir calculadora <ArrowRight className="h-4 w-4" />
            </a>
          </div>

          {/* FAQ */}
          <h2>Perguntas frequentes</h2>
          {post.faqs.map((faq, i) => (
            <div key={i} className="mb-6">
              <h3>{faq.question}</h3>
              <p>{faq.answer}</p>
            </div>
          ))}

          {/* CONCLUSÃO */}
          <h2>Conclusão</h2>
          <p>
            Ter um carro no Brasil custa entre R$ 1.200 e R$ 2.500 por mês (ou mais, dependendo
            do modelo). O segredo é planejar.
          </p>

          <p>
            Antes de comprar, use nossa calculadora para colocar seus números reais. E antes de
            tomar qualquer decisão, sempre considere todas as despesas — não só a parcela do
            financiamento.
          </p>

          <p>
            Se você já tem carro, revise os custos anualmente. Pequenas economias (seguro, pneus,
            manutenção) somam R$ 100-300/mês ao longo de um ano.
          </p>
        </Prose>

        {/* RELATED CONTENT */}
        <div className="mt-12 border-t border-border pt-8">
          <h3 className="mb-6 text-lg font-semibold">Conteúdo relacionado</h3>
          <ul className="grid gap-4 md:grid-cols-2">
            <li>
              <a
                href="/calculadora-custo-carro"
                className="block rounded-lg border border-border p-4 hover:border-primary hover:bg-surface"
              >
                <h4 className="font-semibold">Calculadora de custo de carro</h4>
                <p className="text-sm text-muted-foreground">
                  Simule o custo mensal do seu carro específico
                </p>
              </a>
            </li>
            <li>
              <a
                href="/blog/quanto-custa-morar-sozinho"
                className="block rounded-lg border border-border p-4 hover:border-primary hover:bg-surface"
              >
                <h4 className="font-semibold">Quanto custa morar sozinho</h4>
                <p className="text-sm text-muted-foreground">
                  Guia completo para sair de casa
                </p>
              </a>
            </li>
          </ul>
        </div>
      </article>
    </PageShell>
  );
}
