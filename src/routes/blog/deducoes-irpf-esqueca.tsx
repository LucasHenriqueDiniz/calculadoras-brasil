import { createFileRoute } from "@tanstack/react-router";
import { PageShell, PageHeader, Prose } from "@/components/layout/PageShell";
import { FAQSection } from "@/components/calculator/FAQSection";
import { RelatedCalculators } from "@/components/calculator/RelatedCalculators";
import { absoluteUrl } from "@/lib/site";

export const Route = createFileRoute("/blog/deducoes-irpf-esqueca")({
  head: () => ({
    meta: [
      { title: "Deduções IRPF que Você Esquece de Descontar | Calcule Brasil" },
      {
        name: "description",
        content:
          "Descubra deduções IRPF que muitos brasileiros esquecem: educação, saúde, previdência, dependentes. Reduza seu imposto legalmente.",
      },
    ],
    links: [{ rel: "canonical", href: absoluteUrl("/blog/deducoes-irpf-esqueca") }],
  }),
  component: BlogPost,
});

function BlogPost() {
  return (
    <PageShell>
      <article>
        <PageHeader
          eyebrow="guia • 8 min"
          title="Deduções IRPF que Você Esquece de Descontar"
          description="Muitos brasileiros pagam IRPF desnecessariamente porque desconhecem deduções permitidas. Descubra as 5 principais."
        />

        <Prose>
          <p>
            Quando você declara IRPF, pode abater diversos gastos. Mas muita gente não sabe ou
            esquece. Resultado: paga mais imposto do que deveria.
          </p>

          <h2>As 5 Deduções Mais Ignoradas</h2>

          <h3>1. Educação Continuada (Cursos, Idiomas, Pós-Graduação)</h3>
          <p>
            Limite: R$ 3.561,50/ano. Inclui universidade, cursos online, idiomas, workshops. Muitos
            acham que só faculdade conta, mas qualquer educação válida é dedutível.
          </p>

          <h3>2. Dentista e Oftalmologista</h3>
          <p>
            Sem limite. Óculos, lentes de contato, aparelhos, implantes dentários. Sem limite
            máximo.
          </p>

          <h3>3. Medicamentos com Receita</h3>
          <p>
            Sem limite. Guardar nota fiscal do medicamento é essencial. A Receita pode pedir
            comprovante.
          </p>

          <h3>4. Psicólogo e Psiquiatra</h3>
          <p>
            Sem limite. Suas sessões são despesa médica dedutível. Recibo do profissional vale como
            comprovante.
          </p>

          <h3>5. Previdência Complementar Não Usada</h3>
          <p>
            Até R$ 63.454/ano (13% da renda bruta). PGBL e VGBL são dedutiveis e ainda reduzem seu
            imposto AGORA enquanto acumula para aposentadoria.
          </p>

          <h2>Dica Importante: Guarde Comprovantes</h2>
          <p>
            Receita Federal pode auditar. Se não tiver nota fiscal ou recibo, a dedução pode ser
            negada. Organize seus comprovantes por categoria.
          </p>

          <h2>Use a Calculadora IRPF</h2>
          <p>
            Simule qual é o impacto dessas deduções no seu IRPF. Cada R$ 1.000 em deduções pode
            economizar R$ 150-270 em impostos.
          </p>
        </Prose>

        <FAQSection items={[]} />
        <RelatedCalculators />
      </article>
    </PageShell>
  );
}
