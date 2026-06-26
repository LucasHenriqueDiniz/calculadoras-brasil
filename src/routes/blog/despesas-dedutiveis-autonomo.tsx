import { createFileRoute } from "@tanstack/react-router";
import { PageShell, PageHeader, Prose } from "@/components/layout/PageShell";
import { RelatedCalculators } from "@/components/calculator/RelatedCalculators";
import { absoluteUrl } from "@/lib/site";

export const Route = createFileRoute("/blog/despesas-dedutiveis-autonomo")({
  head: () => ({
    meta: [
      { title: "Despesas Dedutíveis para Autônomo | Calcule Brasil" },
      { name: "description", content: "Quais gastos um autônomo pode descontar do IRPF: equipamentos, combustível, aluguel, internet." },
    ],
    links: [{ rel: "canonical", href: absoluteUrl("/blog/despesas-dedutiveis-autonomo") }],
  }),
  component: BlogPost,
});

function BlogPost() {
  return (
    <PageShell>
      <article>
        <PageHeader eyebrow="guia • 7 min" title="Despesas Dedutíveis para Autônomo" description="O que um autônomo pode descontar do IRPF." />
        <Prose>
          <h2>Equipamentos e Ferramentas</h2>
          <p>Laptop, câmera, microfone, ferramentas de trabalho. Guardar nota fiscal é essencial.</p>

          <h2>Combustível e Transporte</h2>
          <p>Se usa carro para trabalhar, pode descontar combustível, seguro, manutenção e IPVA (proporcional ao uso profissional).</p>

          <h2>Aluguel do Espaço de Trabalho</h2>
          <p>Se trabalha em casa: pode descontar % do aluguel proporcional ao espaço usado (ex: 1/4 da casa = 25% do aluguel).</p>

          <h2>Internet e Telefone</h2>
          <p>Parcialmente dedutível. Guardar recibos de fatura.</p>

          <h2>Material de Consumo</h2>
          <p>Papel, tinta, suprimentos. Tudo com comprovante.</p>

          <h2>Cursos e Educação Profissional</h2>
          <p>Treinamentos da sua área são dedutíveis (com limite).</p>

          <h2>Cuidado: Comprovação</h2>
          <p>A Receita pode auditar. Organize tudo: recibos, notas, comprovantes. Sem comprovante, sem dedução.</p>
        </Prose>
        <RelatedCalculators />
      </article>
    </PageShell>
  );
}
