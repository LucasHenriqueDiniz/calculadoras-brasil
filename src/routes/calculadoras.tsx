import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Sun } from "lucide-react";
import { PageShell, PageHeader } from "@/components/layout/PageShell";
import { calculatorGuide } from "@/data/calculator-guide";
import { calculators, getCalculator } from "@/data/calculators";
import { absoluteUrl } from "@/lib/site";

const TITLE = "Qual calculadora usar em cada situação | Calcule Brasil";
const DESCRIPTION =
  "Saindo de casa, avaliando uma proposta de emprego, trabalhando por conta própria ou cortando gastos: por qual calculadora começar e o que cada uma responde.";

export const Route = createFileRoute("/calculadoras")({
  head: () => ({
    meta: [
      { title: TITLE },
      { name: "description", content: DESCRIPTION },
      { property: "og:title", content: TITLE },
      { property: "og:description", content: DESCRIPTION },
      { property: "og:url", content: absoluteUrl("/calculadoras") },
    ],
    links: [{ rel: "canonical", href: absoluteUrl("/calculadoras") }],
  }),
  component: CalculatorGuidePage,
});

function CalculatorGuidePage() {
  return (
    <PageShell>
      <PageHeader
        eyebrow="Calculadoras"
        title="Qual calculadora usar em cada situação"
        description={`As ${calculators.length} calculadoras do site, organizadas pela decisão que você está tomando, e não pelo assunto. Cada situação diz por onde começar e o que cada ferramenta responde.`}
      />

      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 sm:py-16">
        <nav aria-label="Situações" className="flex flex-wrap gap-2">
          {calculatorGuide.map((situation) => (
            <a
              key={situation.id}
              href={`#${situation.id}`}
              className="inline-flex items-center rounded-full border border-border bg-surface px-3 py-1.5 text-sm text-foreground/80 transition hover:border-primary/30 hover:text-primary"
            >
              {situation.title}
            </a>
          ))}
        </nav>

        <div className="mt-12 space-y-14">
          {calculatorGuide.map((situation) => (
            <section key={situation.id} id={situation.id} className="scroll-mt-24">
              <h2 className="font-display text-2xl text-foreground">{situation.title}</h2>
              <p className="mt-3 text-pretty leading-relaxed text-foreground/85">
                {situation.intro}
              </p>

              <ol className="mt-6 space-y-3">
                {situation.steps.map((step) => {
                  const calculator = getCalculator(step.calculator);
                  if (!calculator) return null;
                  const Icon = calculator.icon;
                  return (
                    <li key={step.calculator}>
                      <Link
                        to={calculator.path}
                        className="group flex items-start gap-4 rounded-2xl border border-border bg-surface p-5 shadow-[var(--shadow-card)] transition hover:border-primary/30 hover:shadow-[var(--shadow-card-hover)]"
                      >
                        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary-soft text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                          <Icon className="h-5 w-5" aria-hidden />
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block font-display text-base font-semibold text-foreground">
                            {calculator.shortTitle}
                          </span>
                          <span className="mt-1 block text-sm leading-relaxed text-muted-foreground">
                            {step.why}
                          </span>
                        </span>
                        <ArrowRight
                          className="mt-1 h-4 w-4 shrink-0 text-primary transition group-hover:translate-x-0.5"
                          aria-hidden
                        />
                      </Link>
                    </li>
                  );
                })}
              </ol>

              {situation.extra && (
                <Link
                  to={situation.extra.to}
                  className="group mt-3 flex items-start gap-4 rounded-2xl border border-dashed border-border p-5 transition hover:border-primary/30"
                >
                  <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-muted text-primary">
                    <Sun className="h-5 w-5" aria-hidden />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-display text-base font-semibold text-foreground">
                      {situation.extra.title}
                    </span>
                    <span className="mt-1 block text-sm leading-relaxed text-muted-foreground">
                      {situation.extra.why}
                    </span>
                  </span>
                  <ArrowRight
                    className="mt-1 h-4 w-4 shrink-0 text-primary transition group-hover:translate-x-0.5"
                    aria-hidden
                  />
                </Link>
              )}
            </section>
          ))}
        </div>

        <div className="mt-16 space-y-4 text-pretty leading-relaxed text-foreground/85">
          <h2 className="font-display text-2xl text-foreground">Antes de usar qualquer uma</h2>
          <p>
            Todas as calculadoras rodam no seu navegador, sem cadastro, e partem de valores de
            exemplo que você deve trocar pelos seus. Onde existe dado público, como preço de
            combustível da ANP ou tarifa de energia da ANEEL, ele aparece como sugestão inicial, com
            a fonte e a data ao lado do campo.
          </p>
          <p>
            Nas calculadoras de imposto e contribuição, as alíquotas, faixas e tetos usados estão
            explicados na página de cada uma. Nas de custo do dia a dia, as premissas de cada
            estimativa estão na{" "}
            <Link to="/metodologia" className="text-primary underline-offset-2 hover:underline">
              metodologia
            </Link>
            . Em todos os casos, o resultado é uma estimativa educativa: não substitui a declaração
            oficial, o contracheque nem a orientação de um contador.
          </p>
        </div>

        <div className="mt-12 flex flex-col items-start gap-4 rounded-2xl border border-border bg-surface p-6 shadow-[var(--shadow-card)] sm:flex-row sm:items-center sm:justify-between sm:p-8">
          <div>
            <h2 className="font-display text-lg text-foreground">Faltou alguma situação?</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Conte qual decisão você queria calcular e não encontrou aqui.
            </p>
          </div>
          <Link
            to="/contato"
            className="inline-flex shrink-0 items-center gap-2 rounded-md bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition hover:opacity-90"
          >
            Enviar sugestão <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
        </div>
      </div>
    </PageShell>
  );
}
