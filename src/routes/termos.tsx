import { createFileRoute } from "@tanstack/react-router";
import { PageShell, PageHeader, Prose } from "@/components/layout/PageShell";

export const Route = createFileRoute("/termos")({
  head: () => ({
    meta: [
      { title: "Termos de Uso — Calculadoras Brasil" },
      {
        name: "description",
        content:
          "Termos de uso do Calculadoras Brasil: conteúdo informativo, sem aconselhamento profissional, sem garantia de resultados.",
      },
      { property: "og:title", content: "Termos de Uso — Calculadoras Brasil" },
      { property: "og:url", content: "/termos" },
    ],
    links: [{ rel: "canonical", href: "/termos" }],
  }),
  component: TermosPage,
});

function TermosPage() {
  return (
    <PageShell>
      <PageHeader
        eyebrow="Termos"
        title="Termos de Uso"
        description="Regras de uso e limites de responsabilidade do conteúdo deste site."
      />
      <Prose>
        <h2>1. Natureza do serviço</h2>
        <p>
          O Calculadoras Brasil disponibiliza calculadoras e conteúdos educacionais para apoiar
          decisões pessoais sobre orçamento. As ferramentas são oferecidas “como estão”, sem
          garantia de exatidão para o seu caso específico.
        </p>

        <h2>2. Sem aconselhamento profissional</h2>
        <p>
          Nada neste site constitui aconselhamento financeiro, contábil, jurídico, médico ou
          veterinário. Para decisões com impacto relevante, consulte um profissional qualificado.
        </p>

        <h2>3. Responsabilidade pelo uso</h2>
        <p>
          Você é responsável pelas decisões tomadas a partir das estimativas geradas. Não nos
          responsabilizamos por prejuízos decorrentes do uso ou da impossibilidade de uso das
          calculadoras.
        </p>

        <h2>4. Propriedade intelectual</h2>
        <p>
          Os textos, marcas e elementos visuais do site pertencem ao Calculadoras Brasil, salvo
          quando indicado. É permitido compartilhar links para as páginas. Reproduções integrais
          dependem de autorização.
        </p>

        <h2>5. Mudanças no serviço</h2>
        <p>
          Podemos alterar, suspender ou descontinuar funcionalidades a qualquer momento, com ou sem
          aviso prévio.
        </p>

        <h2>6. Foro</h2>
        <p>
          Eventuais litígios serão regidos pela legislação brasileira, no foro do domicílio do
          usuário consumidor.
        </p>
      </Prose>
    </PageShell>
  );
}
