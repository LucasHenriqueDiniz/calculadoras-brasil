import { Link } from "@tanstack/react-router";
import { ArrowRight, Calculator, Mail } from "lucide-react";
import { calculators } from "@/data/calculators";

const EMAIL = "lucas.hdo@hotmail.com";

const institucional = [
  { to: "/calculadoras", label: "Calculadoras" },
  { to: "/comparar", label: "Comparar" },
  { to: "/sobre", label: "Sobre" },
  { to: "/metodologia", label: "Metodologia" },
] as const;

const legal = [
  { to: "/privacidade", label: "Privacidade" },
  { to: "/termos", label: "Termos" },
  { to: "/contato", label: "Contato" },
] as const;

export function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="mt-20 border-t border-border bg-surface">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-12">
        {/* Marca */}
        <div className="md:col-span-4">
          <Link to="/" className="flex items-center gap-2" aria-label="Calcule Brasil — Início">
            <span className="grid h-9 w-9 place-items-center rounded-lg bg-primary text-primary-foreground">
              <Calculator className="h-5 w-5" aria-hidden />
            </span>
            <span className="font-display text-base font-semibold text-foreground">
              Calcule Brasil
            </span>
          </Link>
          <p className="mt-3 max-w-sm text-sm leading-relaxed text-muted-foreground">
            Calculadoras simples para custos do dia a dia. Estimativas baseadas em médias públicas —
            sempre confira valores reais antes de tomar uma decisão.
          </p>
          <a
            href={`mailto:${EMAIL}`}
            className="mt-4 inline-flex items-center gap-2 text-sm text-foreground/80 transition hover:text-primary"
          >
            <Mail className="h-4 w-4" aria-hidden />
            {EMAIL}
          </a>
        </div>

        {/* Calculadoras */}
        <div className="md:col-span-4">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Calculadoras
          </p>
          <ul className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
            {calculators.map((c) => (
              <li key={c.slug}>
                <Link to={c.path} className="text-foreground/80 transition hover:text-foreground">
                  {c.shortTitle}
                </Link>
              </li>
            ))}
          </ul>
          <Link
            to="/calculadoras"
            className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
          >
            Ver todas <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
        </div>

        {/* Institucional + Legal */}
        <div className="grid grid-cols-2 gap-8 md:col-span-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Navegação
            </p>
            <ul className="mt-3 space-y-2 text-sm">
              {institucional.map((l) => (
                <li key={l.to}>
                  <Link to={l.to} className="text-foreground/80 transition hover:text-foreground">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Legal
            </p>
            <ul className="mt-3 space-y-2 text-sm">
              {legal.map((l) => (
                <li key={l.to}>
                  <Link to={l.to} className="text-foreground/80 transition hover:text-foreground">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div className="border-t border-border">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-5 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <p>© {year} Calcule Brasil. Todos os direitos reservados.</p>
          <p>
            Conteúdo informativo. Não constitui aconselhamento financeiro, jurídico ou veterinário.
          </p>
        </div>
      </div>
    </footer>
  );
}
