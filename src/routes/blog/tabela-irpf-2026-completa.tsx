import { createFileRoute } from "@tanstack/react-router";
import { PageShell, PageHeader, Prose } from "@/components/layout/PageShell";
import { RelatedCalculators } from "@/components/calculator/RelatedCalculators";
import { absoluteUrl } from "@/lib/site";

export const Route = createFileRoute("/blog/tabela-irpf-2026-completa")({
  head: () => ({
    meta: [
      { title: "Tabela IRPF 2026 Completa | Calcule Brasil" },
      { name: "description", content: "Tabela de alíquotas IRPF 2026, deduções dependentes, limites de isenção." },
    ],
    links: [{ rel: "canonical", href: absoluteUrl("/blog/tabela-irpf-2026-completa") }],
  }),
  component: BlogPost,
});

function BlogPost() {
  return (
    <PageShell>
      <article>
        <PageHeader eyebrow="referência • 5 min" title="Tabela IRPF 2026 Completa" description="Todos os valores, alíquotas e limites do IRPF 2026." />
        <Prose>
          <h2>Alíquotas IRPF 2026</h2>
          <table>
            <tr>
              <th>Faixa</th>
              <th>Alíquota</th>
            </tr>
            <tr>
              <td>Até R$ 21.503,34</td>
              <td>Isento</td>
            </tr>
            <tr>
              <td>R$ 21.503,35 a R$ 33.503,34</td>
              <td>7,5%</td>
            </tr>
            <tr>
              <td>R$ 33.503,35 a R$ 44.693,59</td>
              <td>15%</td>
            </tr>
            <tr>
              <td>R$ 44.693,60 a R$ 55.471,74</td>
              <td>22,5%</td>
            </tr>
            <tr>
              <td>Acima de R$ 55.471,75</td>
              <td>27,5%</td>
            </tr>
          </table>

          <h2>Valores Deduções 2026</h2>
          <ul>
            <li><strong>Por dependente:</strong> R$ 2.275</li>
            <li><strong>Educação:</strong> Até R$ 3.561,50</li>
            <li><strong>Saúde:</strong> Sem limite</li>
            <li><strong>Previdência complementar:</strong> Até 13% da renda bruta</li>
          </ul>

          <h2>Limite de Isenção</h2>
          <p>Quem recebeu até R$ 28.559,70 em 2026 pode estar isento (depende de outras rendas).</p>
        </Prose>
        <RelatedCalculators />
      </article>
    </PageShell>
  );
}
