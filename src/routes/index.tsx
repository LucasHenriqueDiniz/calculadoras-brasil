import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Car, Lock, ScrollText, Sparkles, Wallet } from "lucide-react";
import { PageShell } from "@/components/layout/PageShell";
import { calculators } from "@/data/calculators";
import { absoluteUrl } from "@/lib/site";

const stats = [
  { value: "6", label: "calculadoras" },
  { value: "ANP · ANEEL", label: "fontes públicas" },
  { value: "100%", label: "no navegador" },
];

const heroExample = [
  { label: "Combustível", value: "R$ 720", pct: 100 },
  { label: "IPVA + seguro", value: "R$ 540", pct: 75 },
  { label: "Manutenção", value: "R$ 320", pct: 44 },
  { label: "Depreciação", value: "R$ 280", pct: 39 },
];

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Calcule Brasil — Decisões do dia a dia" },
      {
        name: "description",
        content:
          "Calculadoras simples para custos do dia a dia no Brasil: carro, morar sozinho, conta de luz, assinaturas, mudança e pet.",
      },
      { property: "og:title", content: "Calcule Brasil — Decisões do dia a dia" },
      {
        property: "og:description",
        content:
          "Estime quanto custa ter carro, morar sozinho, sua conta de luz, assinaturas, mudança e pet.",
      },
      { property: "og:url", content: absoluteUrl("/") },
    ],
    links: [{ rel: "canonical", href: absoluteUrl("/") }],
  }),
  component: Home,
});

function Home() {
  return (
    <PageShell>
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border bg-surface">
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-primary-soft/40 [mask-image:radial-gradient(60%_100%_at_50%_0,black,transparent)]"
          aria-hidden
        />
        <div className="relative mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
          <div className="grid items-center gap-12 lg:grid-cols-[1.05fr_0.95fr]">
            {/* Texto */}
            <div>
              <p className="mb-5 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary-soft px-3 py-1 text-xs font-semibold text-primary">
                <Sparkles className="h-3.5 w-3.5" aria-hidden /> Gratuito • Sem cadastro
              </p>
              <h1 className="text-balance font-display text-4xl leading-[1.05] text-foreground sm:text-6xl">
                Quanto isso <span className="text-primary">realmente</span> custa por mês?
              </h1>
              <p className="mt-6 max-w-xl text-pretty text-lg leading-relaxed text-muted-foreground">
                Estime custos reais antes de decidir: trocar de carro, morar sozinho, ligar o
                ar-condicionado, assinar mais um streaming, mudar de bairro ou adotar um pet.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  to="/calculadoras"
                  className="inline-flex items-center gap-2 rounded-md bg-primary px-6 py-3 text-sm font-semibold text-primary-foreground shadow-[var(--shadow-panel)] transition hover:opacity-90"
                >
                  Ver calculadoras <ArrowRight className="h-4 w-4" aria-hidden />
                </Link>
                <Link
                  to="/metodologia"
                  className="inline-flex items-center gap-2 rounded-md border border-border bg-surface px-6 py-3 text-sm font-semibold text-foreground transition hover:bg-muted"
                >
                  Como calculamos
                </Link>
              </div>

              {/* Stats strip */}
              <dl className="mt-10 grid max-w-xl grid-cols-3 gap-px overflow-hidden rounded-2xl border border-border bg-border shadow-[var(--shadow-card)]">
                {stats.map((stat) => (
                  <div
                    key={stat.label}
                    className="flex flex-col items-center justify-center bg-surface px-3 py-5 text-center sm:px-6"
                  >
                    <dt className="sr-only">{stat.label}</dt>
                    <dd className="whitespace-nowrap font-display text-base font-semibold tracking-tight text-foreground sm:text-xl">
                      {stat.value}
                    </dd>
                    <p className="mt-1 text-xs text-muted-foreground sm:text-sm">{stat.label}</p>
                  </div>
                ))}
              </dl>
            </div>

            {/* Card de exemplo */}
            <div className="relative lg:pl-6">
              <div className="rounded-3xl border border-border bg-background/70 p-6 shadow-[var(--shadow-card-hover)] sm:p-7">
                <div className="flex items-center justify-between">
                  <p className="inline-flex items-center gap-2 text-sm font-semibold text-foreground">
                    <span className="grid h-9 w-9 place-items-center rounded-xl bg-primary-soft text-primary">
                      <Car className="h-5 w-5" aria-hidden />
                    </span>
                    Custo de carro
                  </p>
                  <span className="rounded-full bg-muted px-2.5 py-1 text-xs text-muted-foreground">
                    Exemplo
                  </span>
                </div>

                <dl className="mt-5 space-y-3">
                  {heroExample.map((row) => (
                    <div key={row.label}>
                      <div className="flex items-center justify-between text-sm">
                        <dt className="text-muted-foreground">{row.label}</dt>
                        <dd className="font-medium text-foreground">{row.value}</dd>
                      </div>
                      <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-muted">
                        <div
                          className="h-full rounded-full bg-primary/70"
                          style={{ width: `${row.pct}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </dl>

                <div className="mt-5 flex items-end justify-between border-t border-border pt-4">
                  <span className="text-sm text-muted-foreground">Total mensal estimado</span>
                  <span className="font-display text-2xl font-semibold text-foreground">
                    R$ 1.860
                  </span>
                </div>
                <p className="mt-3 text-xs text-muted-foreground">
                  Valores ilustrativos. Cada campo é ajustável com os seus números reais.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Calculadoras */}
      <section id="calculadoras" className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
        <div className="mb-10 max-w-2xl">
          <h2 className="font-display text-2xl text-foreground sm:text-3xl">
            Escolha uma calculadora
          </h2>
          <p className="mt-2 text-muted-foreground">
            Seis ferramentas para os gastos mais comuns no orçamento brasileiro.
          </p>
        </div>

        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {calculators.map((c) => {
            const Icon = c.icon;
            return (
              <li key={c.slug}>
                <Link
                  to={c.path}
                  className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-surface p-6 shadow-[var(--shadow-card)] transition hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-[var(--shadow-card-hover)]"
                >
                  <span className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary-soft text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                    <Icon className="h-6 w-6" aria-hidden />
                  </span>
                  <h3 className="font-display text-lg font-semibold text-foreground">
                    {c.shortTitle}
                  </h3>
                  <p className="mt-1 flex-1 text-sm leading-relaxed text-muted-foreground">
                    {c.tagline}
                  </p>
                  <p className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary">
                    Abrir calculadora
                    <ArrowRight
                      className="h-4 w-4 transition group-hover:translate-x-0.5"
                      aria-hidden
                    />
                  </p>
                </Link>
              </li>
            );
          })}
        </ul>
      </section>

      {/* Por que confiar */}
      <section className="border-t border-border bg-surface">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
          <div className="mb-10 max-w-2xl">
            <h2 className="font-display text-2xl text-foreground sm:text-3xl">
              Estimativas que você pode auditar
            </h2>
            <p className="mt-2 text-muted-foreground">
              Sem caixa-preta: cada número tem fórmula, fonte e premissa abertas.
            </p>
          </div>

          <ul className="grid gap-5 lg:grid-cols-3">
            <li className="rounded-2xl border border-border bg-background/60 p-6 shadow-[var(--shadow-card)]">
              <span className="grid h-11 w-11 place-items-center rounded-xl bg-primary-soft text-primary">
                <Wallet className="h-5 w-5" aria-hidden />
              </span>
              <h3 className="mt-4 font-display text-lg text-foreground">
                Como as estimativas funcionam
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                Cada ferramenta explicita fórmulas, premissas e limitações. Os resultados são
                educativos e devem ser ajustados com os valores reais do seu orçamento.
              </p>
              <Link
                to="/metodologia"
                className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
              >
                Consultar metodologia <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
            </li>
            <li className="rounded-2xl border border-border bg-background/60 p-6 shadow-[var(--shadow-card)]">
              <span className="grid h-11 w-11 place-items-center rounded-xl bg-primary-soft text-primary">
                <ScrollText className="h-5 w-5" aria-hidden />
              </span>
              <h3 className="mt-4 font-display text-lg text-foreground">
                Fontes públicas verificáveis
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                Quando disponível, usamos dados oficiais da ANP e da ANEEL apenas para sugerir
                valores iniciais. A fonte, o período e a atualização aparecem junto ao campo.
              </p>
              <Link
                to="/metodologia"
                hash="fontes"
                className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
              >
                Ver fontes e limitações <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
            </li>
            <li className="rounded-2xl border border-border bg-background/60 p-6 shadow-[var(--shadow-card)]">
              <span className="grid h-11 w-11 place-items-center rounded-xl bg-primary-soft text-primary">
                <Lock className="h-5 w-5" aria-hidden />
              </span>
              <h3 className="mt-4 font-display text-lg text-foreground">Privacidade por padrão</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                Os números digitados são processados no navegador. Consultas públicas enviam somente
                os filtros necessários, como UF e tipo de dado.
              </p>
              <Link
                to="/privacidade"
                className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
              >
                Ler política de privacidade <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
            </li>
          </ul>
        </div>
      </section>
    </PageShell>
  );
}
