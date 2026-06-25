import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Cookie,
  Database,
  Megaphone,
  RefreshCw,
  ShieldCheck,
  UserCheck,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { PageShell, PageHeader } from "@/components/layout/PageShell";
import { absoluteUrl } from "@/lib/site";

interface Section {
  id: string;
  label: string;
  title: string;
  icon: LucideIcon;
}

const sections: Section[] = [
  { id: "dados", label: "Dados das calculadoras", title: "Dados que você informa", icon: Database },
  { id: "cookies", label: "Cookies", title: "Cookies e medição de audiência", icon: Cookie },
  { id: "publicidade", label: "Publicidade", title: "Publicidade", icon: Megaphone },
  { id: "direitos", label: "Direitos (LGPD)", title: "Direitos do titular (LGPD)", icon: UserCheck },
  { id: "alteracoes", label: "Alterações", title: "Alterações nesta política", icon: RefreshCw },
];

export const Route = createFileRoute("/privacidade")({
  head: () => ({
    meta: [
      { title: "Política de Privacidade — Calcule Brasil" },
      {
        name: "description",
        content:
          "Como o Calcule Brasil trata seus dados: nada de cadastro, cálculos no seu navegador e uso responsável de cookies.",
      },
      { property: "og:title", content: "Política de Privacidade — Calcule Brasil" },
      { property: "og:url", content: absoluteUrl("/privacidade") },
    ],
    links: [{ rel: "canonical", href: absoluteUrl("/privacidade") }],
  }),
  component: PrivacidadePage,
});

function SectionCard({ section, children }: { section: Section; children: React.ReactNode }) {
  const Icon = section.icon;
  return (
    <section
      id={section.id}
      className="scroll-mt-24 rounded-2xl border border-border bg-surface p-6 shadow-[var(--shadow-card)] sm:p-8"
    >
      <div className="flex items-center gap-3">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary-soft text-primary">
          <Icon className="h-5 w-5" aria-hidden />
        </span>
        <h2 className="font-display text-xl text-foreground sm:text-2xl">{section.title}</h2>
      </div>
      <div className="mt-4 space-y-4 text-pretty leading-relaxed text-foreground/85">
        {children}
      </div>
    </section>
  );
}

function PrivacidadePage() {
  return (
    <PageShell>
      <PageHeader
        eyebrow="Privacidade"
        title="Política de Privacidade"
        description="Resumo direto de como tratamos dados e cookies neste site."
      />

      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
        <div className="lg:grid lg:grid-cols-[16rem_1fr] lg:gap-12">
          <nav aria-label="Índice da política" className="mb-10 lg:mb-0">
            <div className="lg:sticky lg:top-24">
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                Nesta página
              </p>
              <ul className="flex flex-wrap gap-2 lg:flex-col lg:gap-1">
                {sections.map((section) => (
                  <li key={section.id}>
                    <a
                      href={`#${section.id}`}
                      className="inline-flex items-center gap-2 rounded-md border border-border bg-surface px-3 py-1.5 text-sm text-foreground/80 transition hover:border-primary/30 hover:text-primary lg:w-full lg:border-transparent lg:bg-transparent lg:px-2"
                    >
                      <section.icon className="h-4 w-4 text-primary" aria-hidden />
                      {section.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </nav>

          <div className="space-y-6">
            <SectionCard section={sections[0]}>
              <p>
                Os valores que você digita nas calculadoras (quilometragem, salário, lista de
                assinaturas, etc.) são processados no <strong>seu próprio navegador</strong>. Não
                enviamos esses dados aos nossos servidores e não armazenamos eles em banco de dados.
              </p>
            </SectionCard>

            <SectionCard section={sections[1]}>
              <p>
                Podemos utilizar cookies próprios e de terceiros (como provedores de analytics e
                publicidade) para entender o uso do site de forma agregada, sem identificar você
                pessoalmente. Você pode bloquear cookies nas configurações do seu navegador.
              </p>
            </SectionCard>

            <SectionCard section={sections[2]}>
              <p>
                Quando exibirmos anúncios, eles poderão ser fornecidos por redes parceiras como o
                Google AdSense, que utilizam cookies para apresentar publicidade relevante. Não
                compartilhamos dados pessoais identificáveis com anunciantes.
              </p>
            </SectionCard>

            <SectionCard section={sections[3]}>
              <p>
                Você pode solicitar informações sobre o tratamento de dados pelo nosso site
                escrevendo para o canal indicado na{" "}
                <Link to="/contato" className="text-primary underline underline-offset-2">
                  página de contato
                </Link>
                . Como não criamos cadastros, normalmente não há dados pessoais armazenados sobre
                você.
              </p>
            </SectionCard>

            <SectionCard section={sections[4]}>
              <p>
                Esta política pode ser atualizada para refletir mudanças nas ferramentas que usamos.
                Recomendamos revisá-la periodicamente.
              </p>
            </SectionCard>

            <p className="flex items-center gap-2 px-1 text-sm text-muted-foreground">
              <ShieldCheck className="h-4 w-4 text-primary" aria-hidden />
              Sem cadastro, sem venda de dados. Privacidade é o padrão, não a exceção.
            </p>
          </div>
        </div>
      </div>
    </PageShell>
  );
}
