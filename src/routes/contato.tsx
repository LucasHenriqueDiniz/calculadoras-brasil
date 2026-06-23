import { createFileRoute } from "@tanstack/react-router";
import { Mail, MessageSquare } from "lucide-react";
import { PageShell, PageHeader, Prose } from "@/components/layout/PageShell";

export const Route = createFileRoute("/contato")({
  head: () => ({
    meta: [
      { title: "Contato — Calculadoras Brasil" },
      {
        name: "description",
        content:
          "Sugestões, correções, parcerias e questões legais sobre o Calculadoras Brasil — fale com a gente por e-mail.",
      },
      { property: "og:title", content: "Contato — Calculadoras Brasil" },
      { property: "og:url", content: "/contato" },
    ],
    links: [{ rel: "canonical", href: "/contato" }],
  }),
  component: ContatoPage,
});

function ContatoPage() {
  return (
    <PageShell>
      <PageHeader
        eyebrow="Contato"
        title="Fale com a gente"
        description="Sugestões de novas calculadoras, correções, parcerias ou questões legais — todas as mensagens são lidas."
      />
      <Prose>
        <div className="grid gap-4 sm:grid-cols-2">
          <a
            href="mailto:contato@calculadorasbrasil.com.br"
            className="flex items-start gap-3 rounded-xl border border-border bg-surface p-5 transition hover:border-primary/30"
          >
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-primary-soft text-primary">
              <Mail className="h-5 w-5" aria-hidden />
            </span>
            <span>
              <span className="block font-display text-base text-foreground">E-mail geral</span>
              <span className="mt-1 block text-sm text-muted-foreground">
                contato@calculadorasbrasil.com.br
              </span>
            </span>
          </a>
          <a
            href="mailto:correcoes@calculadorasbrasil.com.br"
            className="flex items-start gap-3 rounded-xl border border-border bg-surface p-5 transition hover:border-primary/30"
          >
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-primary-soft text-primary">
              <MessageSquare className="h-5 w-5" aria-hidden />
            </span>
            <span>
              <span className="block font-display text-base text-foreground">
                Sugestões e correções
              </span>
              <span className="mt-1 block text-sm text-muted-foreground">
                correcoes@calculadorasbrasil.com.br
              </span>
            </span>
          </a>
        </div>

        <h2>O que escrever</h2>
        <ul>
          <li>Calculadoras que você gostaria de ver no site.</li>
          <li>Erros de cálculo, valores defasados ou textos confusos.</li>
          <li>Propostas de parceria de conteúdo ou divulgação.</li>
          <li>Pedidos relacionados a LGPD (acesso, correção, exclusão de dados).</li>
        </ul>

        <p>
          Tentamos responder em até 5 dias úteis. Mensagens sobre privacidade têm prioridade
          conforme prazos legais.
        </p>
      </Prose>
    </PageShell>
  );
}
