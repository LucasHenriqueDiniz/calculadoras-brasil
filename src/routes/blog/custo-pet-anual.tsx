import { createFileRoute } from "@tanstack/react-router";
import { PageShell, PageHeader, Prose } from "@/components/layout/PageShell";
import { absoluteUrl } from "@/lib/site";
import { getBlogPost } from "@/lib/blog";

const post = getBlogPost("custo-pet-anual")!;

const articleSchema = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: post.title,
  description: post.description,
  datePublished: post.publishedAt,
  dateModified: post.updatedAt,
  author: { "@type": "Organization", name: post.author },
};

export const Route = createFileRoute("/blog/custo-pet-anual")({
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
        <PageHeader eyebrow="Guia SEO" title={post.title} description={post.description} />

        <Prose>
          <p>
            Ter um pet é amor, mas também é dinheiro. Ração, veterinário, vacinas, banho... O custo
            pode surpreender.
          </p>

          <h2>Custo anual médio de um pet</h2>
          <table>
            <thead>
              <tr>
                <th>Tipo</th>
                <th>Ração</th>
                <th>Veterinário</th>
                <th>Outros</th>
                <th>Total/ano</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Cachorro pequeno</td>
                <td>R$ 1.200</td>
                <td>R$ 600</td>
                <td>R$ 400</td>
                <td>R$ 2.200</td>
              </tr>
              <tr>
                <td>Cachorro médio</td>
                <td>R$ 1.800</td>
                <td>R$ 700</td>
                <td>R$ 600</td>
                <td>R$ 3.100</td>
              </tr>
              <tr>
                <td>Cachorro grande</td>
                <td>R$ 3.000</td>
                <td>R$ 800</td>
                <td>R$ 800</td>
                <td>R$ 4.600</td>
              </tr>
              <tr>
                <td>Gato</td>
                <td>R$ 600</td>
                <td>R$ 500</td>
                <td>R$ 300</td>
                <td>R$ 1.400</td>
              </tr>
            </tbody>
          </table>

          <h2>Breakdown dos custos</h2>

          <h3>Ração</h3>
          <p>Maior custo contínuo. Varia bastante conforme marca (premium vs populares) e porte.</p>

          <h3>Veterinário</h3>
          <ul>
            <li>Consulta: R$ 100-200</li>
            <li>Vacina anual: R$ 150-300</li>
            <li>Vermífugo/antipulgas: R$ 100-200</li>
            <li>Emergência: muito variável, R$ 500-3.000</li>
          </ul>

          <h3>Banho e tosa</h3>
          <p>R$ 50-150 por sessão, 1-2x ao mês = R$ 600-3.600/ano.</p>

          <h3>Brinquedos, cama, coleira</h3>
          <p>R$ 300-600/ano</p>

          <h2>Dicas de economia</h2>
          <ul>
            <li>Compare rações (mesmo nutriente, preço diferente)</li>
            <li>Vacine no prazo (evita doenças caras)</li>
            <li>Mantenha peso ideal (reduz problemas veterinários)</li>
            <li>Seguro pet pode ser bom investimento</li>
          </ul>

          <a
            href="/calculadora-custo-pet"
            className="mt-6 inline-block rounded-md bg-primary px-5 py-3 font-semibold text-primary-foreground hover:opacity-90"
          >
            Calcular custo do seu pet
          </a>
        </Prose>
      </article>
    </PageShell>
  );
}
