import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, ShieldCheck, Sparkles, Wallet } from "lucide-react";
import { PageShell } from "@/components/layout/PageShell";
import { calculators } from "@/data/calculators";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Calculadoras Brasil — Decisões do dia a dia" },
      {
        name: "description",
        content:
          "Calculadoras simples e gratuitas para estimar custos do dia a dia no Brasil: carro, morar sozinho, conta de luz, assinaturas, mudança e pet.",
      },
      { property: "og:title", content: "Calculadoras Brasil — Decisões do dia a dia" },
      {
        property: "og:description",
        content:
          "Estime quanto custa ter carro, morar sozinho, sua conta de luz, assinaturas, mudança e pet.",
      },
      { property: "og:url", content: "/" },
    ],
    links: [{ rel: "canonical", href: "/" }],
  }),
  component: Home,
});

function Home() {
  return (
    <PageShell>
      <section className="relative overflow-hidden border-b border-border bg-surface">
        <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
          <div className="max-w-2xl">
            <p className="mb-3 inline-flex items-center gap-2 rounded-full bg-primary-soft px-3 py-1 text-xs font-semibold text-primary">
              <Sparkles className="h-3.5 w-3.5" aria-hidden /> Gratuito • Sem cadastro
            </p>
            <h1 className="font-display text-4xl text-foreground sm:text-5xl">
              Calculadoras simples para decisões do dia a dia
            </h1>
            <p className="mt-5 text-lg text-muted-foreground">
              Estime custos reais antes de decidir: trocar de carro, morar sozinho, ligar o
              ar-condicionado, assinar mais um streaming, mudar de bairro ou adotar um pet.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <a
                href="#calculadoras"
                className="inline-flex items-center gap-2 rounded-md bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition hover:opacity-90"
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
          </div>

          <ul className="mt-12 grid gap-4 sm:grid-cols-3">
            <li className="rounded-lg border border-border bg-background/60 p-4">
              <Wallet className="h-5 w-5 text-primary" aria-hidden />
              <p className="mt-3 text-sm font-semibold text-foreground">Estimativas honestas</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Mostramos o custo total, não só a parcela.
              </p>
            </li>
            <li className="rounded-lg border border-border bg-background/60 p-4">
              <ShieldCheck className="h-5 w-5 text-primary" aria-hidden />
              <p className="mt-3 text-sm font-semibold text-foreground">Sem cadastro</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Os valores dos cálculos ficam no navegador; consultas públicas opcionais enviam
                apenas os filtros necessários.
              </p>
            </li>
            <li className="rounded-lg border border-border bg-background/60 p-4">
              <Sparkles className="h-5 w-5 text-primary" aria-hidden />
              <p className="mt-3 text-sm font-semibold text-foreground">Pensado para o Brasil</p>
              <p className="mt-1 text-sm text-muted-foreground">
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
                  className="group flex h-full flex-col rounded-xl border border-border bg-surface p-5 shadow-[var(--shadow-card)] transition hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-[var(--shadow-card-hover)]"
                >
                  <span className="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-primary-soft text-primary">
                    <Icon className="h-5 w-5" aria-hidden />
                  </span>
                  <h3 className="font-display text-lg text-foreground">{c.shortTitle}</h3>
                  <p className="mt-1 text-sm text-muted-foreground">{c.tagline}</p>
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
    </PageShell>
  );
}
