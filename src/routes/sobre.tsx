import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, BookOpen, CircleSlash, Eye, Gift, Megaphone, ShieldCheck } from "lucide-react";
import { PageShell, PageHeader } from "@/components/layout/PageShell";
import { absoluteUrl } from "@/lib/site";

const promises = [
  {
    icon: Gift,
    title: "Gratuito e sem cadastro",
    description: "Todas as calculadoras são abertas, sem login e sem coleta de dados pessoais.",
  },
  {
    icon: Eye,
    title: "Sempre uma estimativa",
    description: "Tratamos cada resultado como ponto de partida — nunca como verdade absoluta.",
  },
  {
    icon: BookOpen,
    title: "Metodologia aberta",
    description: "Explicamos as fórmulas e premissas por trás de cada número.",
  },
  {
    icon: ShieldCheck,
    title: "Linguagem direta",
    description: "Conteúdo em português do Brasil, sem jargão financeiro desnecessário.",
  },
];

const notDoing = [
  "Não vendemos produtos financeiros nem indicamos investimentos.",
  "Não prometemos economia garantida.",
  "Não substituímos consulta a contador, advogado, médico ou veterinário.",
];

export const Route = createFileRoute("/sobre")({
  head: () => ({
    meta: [
      { title: "Sobre | Calcule Brasil" },
      {
        name: "description",
        content:
          "Conheça o Calcule Brasil: um hub independente de calculadoras para decisões cotidianas de orçamento no Brasil.",
      },
      { property: "og:title", content: "Sobre | Calcule Brasil" },
      {
        property: "og:description",
        content: "Hub independente de calculadoras para o dia a dia brasileiro.",
      },
      { property: "og:url", content: absoluteUrl("/sobre") },
    ],
    links: [{ rel: "canonical", href: absoluteUrl("/sobre") }],
  }),
  component: SobrePage,
});

function SobrePage() {
  return (
    <PageShell>
      <PageHeader
        eyebrow="Sobre"
        title="Quem somos"
        description="Um projeto independente focado em ajudar brasileiros a tomar decisões financeiras do dia a dia com mais clareza."
      />

      <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 sm:py-16">
        {/* História */}
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-2xl border border-border bg-surface p-7 shadow-[var(--shadow-card)] sm:p-8">
            <h2 className="font-display text-xl text-foreground">Por que existimos</h2>
            <p className="mt-3 text-pretty leading-relaxed text-foreground/85">
              O <strong>Calcule Brasil</strong> nasceu da percepção de que muita gente toma decisões
              importantes — trocar de carro, sair da casa dos pais, adotar um pet, contratar mais um
              streaming — sem fazer a conta completa. O resultado costuma ser o mesmo: o orçamento
              aperta no terceiro mês.
            </p>
          </div>
          <div className="rounded-2xl border border-border bg-surface p-7 shadow-[var(--shadow-card)] sm:p-8">
            <h2 className="font-display text-xl text-foreground">Nossa proposta</h2>
            <p className="mt-3 text-pretty leading-relaxed text-foreground/85">
              Oferecer calculadoras enxutas, em português do Brasil, que considerem os custos reais
              do contexto brasileiro — IPVA, tarifas de concessionária, hábitos alimentares, preços
              de mercado e por aí vai.
            </p>
          </div>
        </div>

        {/* Promessas */}
        <section className="mt-12">
          <h2 className="font-display text-2xl text-foreground">O que prometemos</h2>
          <ul className="mt-6 grid gap-4 sm:grid-cols-2">
            {promises.map((item) => {
              const Icon = item.icon;
              return (
                <li
                  key={item.title}
                  className="flex items-start gap-3 rounded-2xl border border-border bg-surface p-5 shadow-[var(--shadow-card)]"
                >
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary-soft text-primary">
                    <Icon className="h-5 w-5" aria-hidden />
                  </span>
                  <span>
                    <span className="block font-display text-base text-foreground">
                      {item.title}
                    </span>
                    <span className="mt-1 block text-sm leading-relaxed text-muted-foreground">
                      {item.description}
                    </span>
                  </span>
                </li>
              );
            })}
          </ul>
        </section>

        {/* O que não fazemos */}
        <section className="mt-12 rounded-2xl border border-border bg-muted/40 p-7 sm:p-8">
          <h2 className="font-display text-xl text-foreground">O que não fazemos</h2>
          <ul className="mt-4 space-y-3">
            {notDoing.map((text) => (
              <li key={text} className="flex items-start gap-3 text-foreground/85">
                <CircleSlash className="mt-0.5 h-5 w-5 shrink-0 text-primary" aria-hidden />
                <span className="leading-relaxed">{text}</span>
              </li>
            ))}
          </ul>
        </section>

        {/* Criador */}
        <section className="mt-12 flex items-start gap-4 rounded-2xl border border-border bg-surface p-7 shadow-[var(--shadow-card)] sm:p-8">
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-primary-soft text-primary">
            <BookOpen className="h-5 w-5" aria-hidden />
          </span>
          <div>
            <h2 className="font-display text-xl text-foreground">Quem criou isso</h2>
            <p className="mt-2 text-pretty leading-relaxed text-foreground/85">
              <strong>Lucas Henrique Diniz Ostroski</strong> — desenvolvedor full-stack com
              interesse em finanças pessoais e educação financeira. Criou o Calcule Brasil para
              ajudar brasileiros a tomar decisões informadas sobre custos do dia a dia.
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              <a
                href="https://www.linkedin.com/in/lucas-diniz-ostroski/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-lg border border-border bg-surface px-4 py-2 text-sm font-medium text-foreground transition hover:border-primary/30 hover:bg-primary-soft"
              >
                LinkedIn
              </a>
              <a
                href="https://github.com/LucasHenriqueDiniz/calculadoras-brasil"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-lg border border-border bg-surface px-4 py-2 text-sm font-medium text-foreground transition hover:border-primary/30 hover:bg-primary-soft"
              >
                GitHub
              </a>
            </div>
          </div>
        </section>

        {/* Sustentação */}
        <section className="mt-12 flex items-start gap-4 rounded-2xl border border-border bg-surface p-7 shadow-[var(--shadow-card)] sm:p-8">
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-primary-soft text-primary">
            <Megaphone className="h-5 w-5" aria-hidden />
          </span>
          <div>
            <h2 className="font-display text-xl text-foreground">Como nos sustentamos</h2>
            <p className="mt-2 text-pretty leading-relaxed text-foreground/85">
              O projeto pretende ser sustentado por publicidade discreta, sem comprometer a leitura
              nem o uso das calculadoras. Enquanto isso, é mantido de forma independente.
            </p>
          </div>
        </section>

        {/* CTA */}
        <div className="mt-10 flex flex-col items-start gap-4 rounded-2xl border border-border bg-surface p-6 shadow-[var(--shadow-card)] sm:flex-row sm:items-center sm:justify-between sm:p-8">
          <div>
            <h2 className="font-display text-lg text-foreground">Quer entender as contas?</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Veja exatamente como cada estimativa é calculada.
            </p>
          </div>
          <Link
            to="/metodologia"
            className="inline-flex shrink-0 items-center gap-2 rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition hover:opacity-90"
          >
            Ver metodologia <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
        </div>
      </div>
    </PageShell>
  );
}
