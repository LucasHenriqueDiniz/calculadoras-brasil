import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ArrowRight, Search } from "lucide-react";
import { PageShell, PageHeader } from "@/components/layout/PageShell";
import { calculators, calculatorCategories } from "@/data/calculators";
import { absoluteUrl } from "@/lib/site";

export const Route = createFileRoute("/calculadoras")({
  head: () => ({
    meta: [
      { title: "Todas as calculadoras | Calcule Brasil" },
      {
        name: "description",
        content:
          "Explore todas as calculadoras de custo do dia a dia no Brasil, organizadas por categoria: moradia, veículos, finanças e pets.",
      },
      { property: "og:title", content: "Todas as calculadoras | Calcule Brasil" },
      {
        property: "og:description",
        content: "Calculadoras de custo organizadas por categoria.",
      },
      { property: "og:url", content: absoluteUrl("/calculadoras") },
    ],
    links: [{ rel: "canonical", href: absoluteUrl("/calculadoras") }],
  }),
  component: CalculadorasPage,
});

function CalculadorasPage() {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return calculators;
    return calculators.filter((c) =>
      [c.shortTitle, c.title, c.tagline, c.description].some((t) =>
        t.toLowerCase().includes(q),
      ),
    );
  }, [query]);

  const categoriesWithItems = calculatorCategories
    .map((category) => ({
      category,
      items: filtered.filter((c) => c.category === category.id),
    }))
    .filter((group) => group.items.length > 0);

  return (
    <PageShell>
      <PageHeader
        eyebrow="Calculadoras"
        title="Todas as calculadoras"
        description="Ferramentas gratuitas para estimar custos do dia a dia, organizadas por categoria. Novas calculadoras entram aqui conforme são publicadas."
      />

      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-16">
        {/* Busca + atalhos de categoria */}
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative w-full lg:max-w-sm">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden
            />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar calculadora..."
              aria-label="Buscar calculadora"
              className="w-full rounded-lg border border-border bg-surface py-2.5 pl-9 pr-3 text-sm text-foreground outline-none transition placeholder:text-muted-foreground focus:border-primary/40 focus:ring-2 focus:ring-primary/15"
            />
          </div>

          <nav aria-label="Categorias" className="flex flex-wrap gap-2">
            {calculatorCategories.map((category) => (
              <a
                key={category.id}
                href={`#${category.id}`}
                className="inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1.5 text-sm text-foreground/80 transition hover:border-primary/30 hover:text-primary"
              >
                <category.icon className="h-4 w-4 text-primary" aria-hidden />
                {category.label}
              </a>
            ))}
          </nav>
        </div>

        {/* Grupos por categoria */}
        {categoriesWithItems.length === 0 ? (
          <p className="mt-16 rounded-2xl border border-dashed border-border bg-surface px-6 py-16 text-center text-muted-foreground">
            Nenhuma calculadora encontrada para{" "}
            <span className="font-medium text-foreground">&ldquo;{query}&rdquo;</span>.
          </p>
        ) : (
          <div className="mt-12 space-y-14">
            {categoriesWithItems.map(({ category, items }) => {
              const CategoryIcon = category.icon;
              return (
                <section key={category.id} id={category.id} className="scroll-mt-24">
                  <div className="flex items-center gap-3 border-b border-border pb-4">
                    <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-primary-soft text-primary">
                      <CategoryIcon className="h-5 w-5" aria-hidden />
                    </span>
                    <div>
                      <h2 className="font-display text-xl text-foreground sm:text-2xl">
                        {category.label}
                      </h2>
                      <p className="text-sm text-muted-foreground">{category.description}</p>
                    </div>
                    <span className="ml-auto rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">
                      {items.length}
                    </span>
                  </div>

                  <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {items.map((c) => {
                      const Icon = c.icon;
                      return (
                        <li key={c.slug}>
                          <Link
                            to={c.path}
                            className="group flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-surface p-6 shadow-[var(--shadow-card)] transition hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-[var(--shadow-card-hover)]"
                          >
                            <span className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary-soft text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                              <Icon className="h-6 w-6" aria-hidden />
                            </span>
                            <h3 className="font-display text-lg font-semibold text-foreground">
                              {c.shortTitle}
                            </h3>
                            <p className="mt-1 flex-1 text-sm leading-relaxed text-muted-foreground">
                              {c.description}
                            </p>
                            <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary">
                              Abrir calculadora
                              <ArrowRight
                                className="h-4 w-4 transition group-hover:translate-x-0.5"
                                aria-hidden
                              />
                            </span>
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                </section>
              );
            })}
          </div>
        )}

        {/* Sugestão de novas calculadoras */}
        <div className="mt-16 flex flex-col items-start gap-4 rounded-2xl border border-border bg-surface p-6 shadow-[var(--shadow-card)] sm:flex-row sm:items-center sm:justify-between sm:p-8">
          <div>
            <h2 className="font-display text-lg text-foreground">Faltou alguma calculadora?</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Sugira a próxima ferramenta que faria diferença no seu orçamento.
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
