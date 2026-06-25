import { createFileRoute } from "@tanstack/react-router";
import { PageShell, PageHeader, Prose } from "@/components/layout/PageShell";
import { absoluteUrl } from "@/lib/site";
import { getBlogPost } from "@/lib/blog";

const post = getBlogPost("como-economizar-conta-de-luz")!;

const articleSchema = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: post.title,
  description: post.description,
  datePublished: post.publishedAt,
  dateModified: post.updatedAt,
  author: { "@type": "Organization", name: post.author },
};

export const Route = createFileRoute("/blog/como-economizar-conta-de-luz")({
  head: () => ({
    meta: [
      { title: `${post.title} | Calcule Brasil` },
      { name: "description", content: post.description },
      { property: "og:title", content: post.title },
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
          eyebrow="Dica SEO"
          title={post.title}
          description={post.description}
        />

        <Prose>
          <p>
            A conta de luz chega e assusta. Mas muitos dos custos são evitáveis. Aqui estão 10
            dicas práticas para reduzir sua fatura.
          </p>

          <h2>Os aparelhos que mais consomem</h2>
          <table>
            <thead>
              <tr>
                <th>Aparelho</th>
                <th>Potência (W)</th>
                <th>Consumo mensal (8h/dia)</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Ar-condicionado</td>
                <td>3.000W</td>
                <td>720 kWh</td>
              </tr>
              <tr>
                <td>Chuveiro elétrico</td>
                <td>5.500W</td>
                <td>220 kWh</td>
              </tr>
              <tr>
                <td>Refrigerador</td>
                <td>500W</td>
                <td>360 kWh</td>
              </tr>
              <tr>
                <td>Máquina de lavar</td>
                <td>2.000W</td>
                <td>240 kWh</td>
              </tr>
              <tr>
                <td>Chuveiro morno (40°C)</td>
                <td>3.000W</td>
                <td>180 kWh</td>
              </tr>
            </tbody>
          </table>

          <h2>10 dicas de economia</h2>

          <h3>1. Reduzir tempo de banho</h3>
          <p>Cada 5 minutos menos = economia de R$ 10-15/mês com chuveiro elétrico.</p>

          <h3>2. Usar ar-condicionado com moderação</h3>
          <p>
            Ar ligado 24h custa ~R$ 600/mês. Ligar apenas à noite reduz em 70%.
          </p>

          <h3>3. Desligar aparelhos da tomada</h3>
          <p>
            Carregadores, TVs em standby, videogames: consomem ~5% da sua conta sem fazer nada.
          </p>

          <h3>4. Usar lâmpadas LED</h3>
          <p>Consome 80% menos que incandescente. Economia em 6 meses.</p>

          <h3>5. Geladeira: temperatura correta</h3>
          <p>
            Muito fria (2°C) consome 40% mais. Ideal: 4-5°C. Também mantenha limpa (gelo reduz
            eficiência).
          </p>

          <h3>6. Lavar roupa com água fria</h3>
          <p>
            Máquina com água quente custa 3x mais. 80% da energia é para aquecimento.
          </p>

          <h3>7. Usar forno/fogão ao máximo</h3>
          <p>
            Quando liga forno, aproveite para cozinhar vários pratos. Evita ligar múltiplas vezes.
          </p>

          <h3>8. Abrir geladeira com moderação</h3>
          <p>
            Cada abertura faz o compressor trabalhar extra. Organize para abrir menos vezes.
          </p>

          <h3>9. Manutenção do ar-condicionado</h3>
          <p>
            Filtro sujo aumenta consumo em 20%. Limpe mensalmente.
          </p>

          <h3>10. Usar medidor/calculadora</h3>
          <p>
            Saiba quanto cada aparelho consome.{" "}
            <a href="/calculadora-conta-de-luz">Use nossa calculadora</a> para ver o impacto exato.
          </p>

          <h2>Economia esperada</h2>
          <p>
            Com essas dicas, redução de 20-40% na conta é realista. Se você paga R$ 300/mês,
            economiza R$ 60-120. Em 1 ano: R$ 720-1.440.
          </p>
        </Prose>
      </article>
    </PageShell>
  );
}
