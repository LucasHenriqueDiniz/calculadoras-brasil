import { createFileRoute } from "@tanstack/react-router";
import { PageShell, PageHeader, Prose } from "@/components/layout/PageShell";
import { absoluteUrl } from "@/lib/site";
import { getBlogPost } from "@/lib/blog";

const post = getBlogPost("assinaturas-que-valem-a-pena")!;

const articleSchema = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: post.title,
  description: post.description,
  datePublished: post.publishedAt,
  dateModified: post.updatedAt,
  author: { "@type": "Organization", name: post.author },
};

export const Route = createFileRoute("/blog/assinaturas-que-valem-a-pena")({
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
          eyebrow="Análise SEO"
          title={post.title}
          description={post.description}
        />

        <Prose>
          <p>
            Netflix, Disney+, Spotify, Academia, Pacote de telefone... Você contrata uma coisa
            por mês e não percebe que tem 10+ assinaturas comendo seu salário.
          </p>

          <h2>Quanto você realmente gasta com assinaturas?</h2>
          <p>
            A média do brasileiro é R$ 500-1.000/mês em assinaturas. Para algumas pessoas, é
            mais. Vamos ver as mais comuns:
          </p>

          <table>
            <thead>
              <tr>
                <th>Assinatura</th>
                <th>Valor mensal</th>
                <th>Anual</th>
                <th>Recomendação</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Netflix</td>
                <td>R$ 55-165</td>
                <td>R$ 660-1.980</td>
                <td>✅ Se usar 3+ vezes/semana</td>
              </tr>
              <tr>
                <td>Disney+</td>
                <td>R$ 33-55</td>
                <td>R$ 400-660</td>
                <td>❌ Só vale para família grande</td>
              </tr>
              <tr>
                <td>Spotify</td>
                <td>R$ 19-17</td>
                <td>R$ 228-204</td>
                <td>✅ Vale a pena para audiófilo</td>
              </tr>
              <tr>
                <td>Academia</td>
                <td>R$ 80-200</td>
                <td>R$ 960-2.400</td>
                <td>❌ Se não frequenta</td>
              </tr>
              <tr>
                <td>Nuvem (OneDrive, iCloud)</td>
                <td>R$ 10-30</td>
                <td>R$ 120-360</td>
                <td>✅ Vale se usar regularmente</td>
              </tr>
              <tr>
                <td>Pacote de telefone</td>
                <td>R$ 100-150</td>
                <td>R$ 1.200-1.800</td>
                <td>⚠️ Depende do contrato</td>
              </tr>
            </tbody>
          </table>

          <h2>O custo escondido</h2>
          <p>
            Você assina por 2-3 meses e esquece. 12 meses depois, foram R$ 1.000 que você nem
            lembrava de gastar. Multiplique por todas as assinaturas...
          </p>

          <h2>Vale a pena? O teste dos 70%</h2>
          <p>
            Se você usa a assinatura em menos de 70% do tempo disponível, provavelmente não vale a
            pena.
          </p>
          <p>Exemplo:</p>
          <ul>
            <li>Netflix: 30 dias → 70% = 21 dias no mês. Se não usa 3x na semana, cancela.</li>
            <li>Academia: 30 dias → 70% = 21 dias. Se não vai 3x na semana, cancela.</li>
          </ul>

          <h2>Dicas de economia</h2>
          <ol>
            <li>
              <strong>Compartilhe.</strong> Netflix/Disney+ permitem compartilhamento. Divide os
              custos.
            </li>
            <li>
              <strong>Período de teste.</strong> Muitos serviços oferecem 1 mês grátis. Experimente
              antes de comprometer.
            </li>
            <li>
              <strong>Avalie anualmente.</strong> Cada 3-6 meses, revise quais você realmente
              usa.
            </li>
            <li>
              <strong>Cancele sem culpa.</strong> Você pode reativar depois. Não é final.
            </li>
            <li>
              <strong>Procure combos.</strong> Pacote telefone + TV + internet pode ser mais
              barato.
            </li>
          </ol>

          <h2>Impacto real</h2>
          <p>
            Cancelar 5 assinaturas desnecessárias = R$ 300-500/mês = R$ 3.600-6.000/ano. É um
            aumento de 10% no salário para muita gente.
          </p>

          <a
            href="/calculadora-assinaturas"
            className="mt-6 inline-block rounded-md bg-primary px-5 py-3 font-semibold text-primary-foreground hover:opacity-90"
          >
            Calcule o impacto das suas assinaturas
          </a>
        </Prose>
      </article>
    </PageShell>
  );
}
