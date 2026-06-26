import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Lightbulb, Mail, Handshake, ShieldCheck, Clock } from "lucide-react";
import { PageShell, PageHeader } from "@/components/layout/PageShell";
import { absoluteUrl } from "@/lib/site";

const EMAIL = "lucas.hdo@hotmail.com";

const topics = [
  {
    icon: Lightbulb,
    title: "Sugestões de calculadoras",
    description: "Conte qual ferramenta faria diferença no seu orçamento.",
    subject: "Sugestão de calculadora",
  },
  {
    icon: ShieldCheck,
    title: "Correções e dados defasados",
    description: "Achou um erro de cálculo ou um valor desatualizado? Avise.",
    subject: "Correção no site",
  },
  {
    icon: Handshake,
    title: "Parcerias e divulgação",
    description: "Propostas de parceria de conteúdo ou divulgação.",
    subject: "Parceria",
  },
  {
    icon: ShieldCheck,
    title: "Privacidade (LGPD)",
    description: "Pedidos de acesso, correção ou exclusão de dados.",
    subject: "LGPD",
  },
];

export const Route = createFileRoute("/contato")({
  head: () => ({
    meta: [
      { title: "Contato | Calcule Brasil" },
      {
        name: "description",
        content:
          "Sugestões, correções, parcerias e questões legais sobre o Calcule Brasil — fale com a gente por e-mail.",
      },
      { property: "og:title", content: "Contato | Calcule Brasil" },
      { property: "og:url", content: absoluteUrl("/contato") },
    ],
    links: [{ rel: "canonical", href: absoluteUrl("/contato") }],
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

      <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 sm:py-16">
        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-start">
          {/* Cartão principal de e-mail */}
          <div className="flex flex-col rounded-2xl border border-border bg-surface p-7 shadow-[var(--shadow-card)] sm:p-8">
            <span className="grid h-12 w-12 place-items-center rounded-xl bg-primary-soft text-primary">
              <Mail className="h-6 w-6" aria-hidden />
            </span>
            <h2 className="mt-5 font-display text-xl text-foreground">E-mail de contato</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              É o canal oficial para qualquer assunto. Escreva quando quiser — respondemos por ordem
              de chegada.
            </p>
            <a
              href={`mailto:${EMAIL}`}
              className="mt-5 inline-flex items-center gap-2 self-start rounded-lg bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition hover:opacity-90"
            >
              <Mail className="h-4 w-4" aria-hidden />
              {EMAIL}
            </a>
            <p className="mt-4 inline-flex items-center gap-2 text-xs text-muted-foreground">
              <Clock className="h-4 w-4" aria-hidden />
              Resposta em até 5 dias úteis · LGPD tem prioridade conforme prazos legais.
            </p>
          </div>

          {/* Tópicos */}
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-1">
            {topics.map((topic) => {
              const Icon = topic.icon;
              return (
                <a
                  key={topic.title}
                  href={`mailto:${EMAIL}?subject=${encodeURIComponent(topic.subject)}`}
                  className="group flex items-start gap-3 rounded-xl border border-border bg-surface p-4 transition hover:border-primary/30"
                >
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-primary-soft text-primary">
                    <Icon className="h-4 w-4" aria-hidden />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-sm font-semibold text-foreground">
                      {topic.title}
                    </span>
                    <span className="mt-0.5 block text-sm text-muted-foreground">
                      {topic.description}
                    </span>
                  </span>
                  <ArrowRight
                    className="ml-auto h-4 w-4 shrink-0 self-center text-muted-foreground transition group-hover:translate-x-0.5 group-hover:text-primary"
                    aria-hidden
                  />
                </a>
              );
            })}
          </div>
        </div>

        {/* Aviso final */}
        <div className="mt-8 rounded-2xl border border-border bg-muted/40 p-6 text-sm leading-relaxed text-muted-foreground">
          O Calcule Brasil é um projeto independente e informativo. Não prestamos aconselhamento
          financeiro, jurídico ou veterinário individual. Para entender como tratamos seus dados,
          leia a{" "}
          <Link to="/privacidade" className="font-medium text-primary underline underline-offset-2">
            política de privacidade
          </Link>
          .
        </div>
      </div>
    </PageShell>
  );
}
