import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, ShieldCheck, Sparkles, Wallet } from "lucide-react";
import { PageShell } from "@/components/layout/PageShell";
import { calculators } from "@/data/calculators";
import { absoluteUrl } from "@/lib/site";

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
      <section className="relative overflow-hidden border-b border-border bg-surface">
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-64 bg-primary-soft/40 [mask-image:radial-gradient(60%_100%_at_50%_0,black,transparent)]"
          aria-hidden
        />
        <div className="relative mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
          <div className="max-w-2xl">
            <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary-soft px-3 py-1 text-xs font-semibold text-primary">
              <Sparkles className="h-3.5 w-3.5" aria-hidden /> Gratuito • Sem cadastro
            </p>
            <h1 className="text-balance font-display text-4xl text-foreground sm:text-5xl">
              Calculadoras simples para decisões do dia a dia
            </h1>
            <p className="mt-5 text-pretty text-lg leading-relaxed text-muted-foreground">
              Estime custos reais antes de decidir: trocar de carro, morar sozinho, ligar o
              ar-condicionado, assinar mais um streaming, mudar de bairro ou adotar um pet.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <a
                href="#calculadoras"
                className="inline-flex items-center gap-2 rounded-md bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-[var(--shadow-panel)] transition hover:opacity-90"
              >
                Ver calculadoras <ArrowRight className="h-4 w-4" aria-hidden />
              </a>
              <Link
                to="/metodologia"
                className="inline-flex items-center gap-2 rounded-md border border-border bg-surface px-5 py-3 text-sm font-semibold text-foreground transition hover:bg-muted"
              >
                Como calculamos
              </Link>
            </div>
            <p className="mt-6 text-sm text-muted-foreground">
              6 calculadoras · Dados públicos da ANP e ANEEL · 100% no seu navegador
            </p>
          </div>

          <ul className="mt-12 grid gap-4 sm:grid-cols-3">
            <li className="rounded-2xl border border-border bg-background/70 p-5 shadow-[var(--shadow-card)]">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-primary-soft text-primary">
                <Wallet className="h-5 w-5" aria-hidden />
              </span>
              <p className="mt-4 text-sm font-semibold text-foreground">Estimativas honestas</p>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                Mostramos o custo total, não só a parcela.
              </p>
            </li>
            <li className="rounded-2xl border border-border bg-background/70 p-5 shadow-[var(--shadow-card)]">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-primary-soft text-primary">
                <ShieldCheck className="h-5 w-5" aria-hidden />
              </span>
              <p className="mt-4 text-sm font-semibold text-foreground">Sem cadastro</p>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                Os valores dos cálculos ficam no navegador; consultas públicas opcionais enviam
                apenas os filtros necessários.
              </p>
            </li>
            <li className="rounded-2xl border border-border bg-background/70 p-5 shadow-[var(--shadow-card)]">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-primary-soft text-primary">
                <Sparkles className="h-5 w-5" aria-hidden />
              </span>
              <p className="mt-4 text-sm font-semibold text-foreground">Pensado para o Brasil</p>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                Tarifas, impostos e hábitos do contexto brasileiro.
              </p>
            </li>
          </ul>
        </div>
      </section>

      <section id="calculadoras" className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
        <div className="mb-10 flex items-end justify-between gap-4">
          <div>
            <h2 className="font-display text-2xl text-foreground sm:text-3xl">
              Escolha uma calculadora
            </h2>
            <p className="mt-2 text-muted-foreground">
              Seis ferramentas para os gastos mais comuns no orçamento brasileiro.
            </p>
          </div>
        </div>

        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {calculators.map((c) => {
            const Icon = c.icon;
            return (
              <li key={c.slug}>
                <Link
                  to={c.path}
                  className="group flex h-full flex-col rounded-2xl border border-border bg-surface p-6 shadow-[var(--shadow-card)] transition hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-[var(--shadow-card-hover)]"
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

      <section className="border-t border-border bg-surface">
        <div className="mx-auto grid max-w-6xl gap-5 px-4 py-14 sm:px-6 lg:grid-cols-3">
          <div className="rounded-2xl border border-border bg-background/60 p-6 shadow-[var(--shadow-card)]">
            <h2 className="font-display text-xl text-foreground">Como as estimativas funcionam</h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              Cada ferramenta explicita fórmulas, premissas e limitações. Os resultados são
              educativos e devem ser ajustados com os valores reais do seu orçamento.
            </p>
            <Link
              to="/metodologia"
              className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
            >
              Consultar metodologia <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
          </div>
          <div className="rounded-2xl border border-border bg-background/60 p-6 shadow-[var(--shadow-card)]">
            <h2 className="font-display text-xl text-foreground">Fontes públicas verificáveis</h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              Quando disponível, usamos dados oficiais da ANP e da ANEEL apenas para sugerir valores
              iniciais. A fonte, o período e a atualização aparecem junto ao campo.
            </p>
            <Link
              to="/metodologia"
              hash="fontes"
              className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
            >
              Ver fontes e limitações <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
          </div>
          <div className="rounded-2xl border border-border bg-background/60 p-6 shadow-[var(--shadow-card)]">
            <h2 className="font-display text-xl text-foreground">Privacidade por padrão</h2>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              Os números digitados são processados no navegador. Consultas públicas enviam somente
              os filtros necessários, como UF e tipo de dado.
            </p>
            <Link
              to="/privacidade"
              className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
            >
              Ler política de privacidade <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
          </div>
        </div>
      </section>
    </PageShell>
  );
}
