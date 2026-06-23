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

      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <p className="mt-4 text-xs text-muted-foreground">
          Revisado em <time dateTime={SITE_REVIEW_DATE}>{SITE_REVIEW_DATE_LABEL}</time>
          {" · "}Responsável editorial: {EDITORIAL_RESPONSIBLE}
        </p>
        <Link
          to="/"
          className="mt-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden /> Todas as calculadoras
        </Link>
      </div>

      <section className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
        <div className="grid gap-6 lg:grid-cols-[1fr_22rem]">
          <div className="space-y-6 rounded-2xl border border-border bg-surface p-5 sm:p-6">
            {form}
          </div>
          <aside className="space-y-4 lg:sticky lg:top-6 lg:self-start">{result}</aside>
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
    <fieldset className="space-y-4">
      <legend className="font-display text-lg text-foreground">{title}</legend>
      {description ? <p className="text-sm text-muted-foreground">{description}</p> : null}
      <div className="grid gap-4 sm:grid-cols-2">{children}</div>
    </fieldset>
  );
}
