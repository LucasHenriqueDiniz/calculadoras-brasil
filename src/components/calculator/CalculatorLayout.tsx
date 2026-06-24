import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { PageShell, PageHeader } from "@/components/layout/PageShell";
import { EDITORIAL_RESPONSIBLE, SITE_REVIEW_DATE, SITE_REVIEW_DATE_LABEL } from "@/lib/seo-pages";

interface CalculatorLayoutProps {
  eyebrow?: string;
  title: string;
  description?: string;
  form: ReactNode;
  result: ReactNode;
  children?: ReactNode;
}

export function CalculatorLayout({
  eyebrow = "Calculadora",
  title,
  description,
  form,
  result,
  children,
}: CalculatorLayoutProps) {
  return (
    <PageShell>
      <PageHeader eyebrow={eyebrow} title={title} description={description} />

      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-x-4 gap-y-2 px-4 pt-5 sm:px-6">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden /> Todas as calculadoras
        </Link>
        <p className="text-xs text-muted-foreground">
          Revisado em <time dateTime={SITE_REVIEW_DATE}>{SITE_REVIEW_DATE_LABEL}</time>
          {" · "}Responsável editorial: {EDITORIAL_RESPONSIBLE}
        </p>
      </div>

      <section className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
        <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_23rem] lg:gap-8">
          <div className="min-w-0">{form}</div>
          <aside className="lg:sticky lg:top-24 lg:self-start">{result}</aside>
        </div>
      </section>

      {children}
    </PageShell>
  );
}

interface FormSectionProps {
  title: string;
  description?: string;
  children: ReactNode;
}

export function FormSection({ title, description, children }: FormSectionProps) {
  return (
    <fieldset className="space-y-5 rounded-2xl border border-border bg-surface p-5 shadow-[var(--shadow-card)] sm:p-6">
      <div className="space-y-1 border-b border-border/70 pb-4">
        <legend className="font-display text-lg font-semibold text-foreground">{title}</legend>
        {description ? (
          <p className="text-sm leading-relaxed text-muted-foreground">{description}</p>
        ) : null}
      </div>
      <div className="grid gap-x-5 gap-y-4 sm:grid-cols-2">{children}</div>
    </fieldset>
  );
}
