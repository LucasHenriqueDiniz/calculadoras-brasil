import { createFileRoute } from "@tanstack/react-router";
import {
  Copyright,
  FileText,
  Gavel,
  RefreshCw,
  ShieldAlert,
  UserCog,
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
  { id: "natureza", label: "Natureza do serviço", title: "1. Natureza do serviço", icon: FileText },
  {
    id: "aconselhamento",
    label: "Sem aconselhamento",
    title: "2. Sem aconselhamento profissional",
    icon: ShieldAlert,
  },
  {
    id: "responsabilidade",
    label: "Responsabilidade",
    title: "3. Responsabilidade pelo uso",
    icon: UserCog,
  },
  {
    id: "propriedade",
    label: "Propriedade intelectual",
    title: "4. Propriedade intelectual",
    icon: Copyright,
  },
  { id: "mudancas", label: "Mudanças no serviço", title: "5. Mudanças no serviço", icon: RefreshCw },
  { id: "foro", label: "Foro", title: "6. Foro", icon: Gavel },
];

export const Route = createFileRoute("/termos")({
  head: () => ({
    meta: [
      { title: "Termos de Uso — Calcule Brasil" },
      {
        name: "description",
        content:
          "Termos de uso do Calcule Brasil: conteúdo informativo, sem aconselhamento profissional, sem garantia de resultados.",
      },
      { property: "og:title", content: "Termos de Uso — Calcule Brasil" },
      { property: "og:url", content: absoluteUrl("/termos") },
    ],
    links: [{ rel: "canonical", href: absoluteUrl("/termos") }],
  }),
  component: TermosPage,
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

function TermosPage() {
  return (
    <PageShell>
      <PageHeader
        eyebrow="Termos"
        title="Termos de Uso"
        description="Regras de uso e limites de responsabilidade do conteúdo deste site."
      />

      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
        <div className="lg:grid lg:grid-cols-[16rem_1fr] lg:gap-12">
          <nav aria-label="Índice dos termos" className="mb-10 lg:mb-0">
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
                O Calcule Brasil disponibiliza calculadoras e conteúdos educacionais para apoiar
                decisões pessoais sobre orçamento. As ferramentas são oferecidas &ldquo;como
                estão&rdquo;, sem garantia de exatidão para o seu caso específico.
              </p>
            </SectionCard>

            <SectionCard section={sections[1]}>
              <p>
                Nada neste site constitui aconselhamento financeiro, contábil, jurídico, médico ou
                veterinário. Para decisões com impacto relevante, consulte um profissional
                qualificado.
              </p>
            </SectionCard>

            <SectionCard section={sections[2]}>
              <p>
                Você é responsável pelas decisões tomadas a partir das estimativas geradas. Não nos
                responsabilizamos por prejuízos decorrentes do uso ou da impossibilidade de uso das
                calculadoras.
              </p>
            </SectionCard>

            <SectionCard section={sections[3]}>
              <p>
                Os textos, marcas e elementos visuais do site pertencem ao Calcule Brasil, salvo
                quando indicado. É permitido compartilhar links para as páginas. Reproduções
                integrais dependem de autorização.
              </p>
            </SectionCard>

            <SectionCard section={sections[4]}>
              <p>
                Podemos alterar, suspender ou descontinuar funcionalidades a qualquer momento, com
                ou sem aviso prévio.
              </p>
            </SectionCard>

            <SectionCard section={sections[5]}>
              <p>
                Eventuais litígios serão regidos pela legislação brasileira, no foro do domicílio do
                usuário consumidor.
              </p>
            </SectionCard>
          </div>
        </div>
      </div>
    </PageShell>
  );
}
