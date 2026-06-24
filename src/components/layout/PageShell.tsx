import type { ReactNode } from "react";
import { Header } from "./Header";
import { Footer } from "./Footer";

interface PageShellProps {
  children: ReactNode;
}

export function PageShell({ children }: PageShellProps) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header />
      <main id="conteudo" className="flex-1">
        {children}
      </main>
      <Footer />
    </div>
  );
}

interface PageHeaderProps {
  eyebrow?: string;
  title: string;
  description?: string;
}

export function PageHeader({ eyebrow, title, description }: PageHeaderProps) {
  return (
    <section className="border-b border-border bg-surface">
      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-16">
        {eyebrow ? (
          <p className="mb-3 inline-flex items-center rounded-full bg-primary-soft px-3 py-1 text-xs font-semibold uppercase tracking-[0.14em] text-primary">
            {eyebrow}
          </p>
        ) : null}
        <h1 className="text-balance font-display text-3xl text-foreground sm:text-4xl">{title}</h1>
        {description ? (
          <p className="mt-4 text-pretty text-base leading-relaxed text-muted-foreground sm:text-lg">
            {description}
          </p>
        ) : null}
      </div>
    </section>
  );
}

const PROSE_TYPOGRAPHY =
  "[&_h2]:font-display [&_h2]:text-2xl [&_h2]:text-foreground [&_h2]:mt-10 [&_h2]:mb-3 [&_h2:first-child]:mt-0 [&_h3]:font-display [&_h3]:text-lg [&_h3]:text-foreground [&_h3]:mt-6 [&_h3]:mb-2 [&_p]:text-foreground/85 [&_p]:leading-relaxed [&_p+p]:mt-4 [&_ul]:mt-3 [&_ul]:space-y-2 [&_ul]:text-foreground/85 [&_ul]:list-disc [&_ul]:pl-6 [&_a]:text-primary [&_a]:underline [&_a]:underline-offset-2";

interface ProseProps {
  children: ReactNode;
  /** Quando definido, recolhe o conteúdo em um accordion com este rótulo. */
  collapsibleTitle?: string;
}

export function Prose({ children, collapsibleTitle }: ProseProps) {
  if (collapsibleTitle) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6">
        <details className="group overflow-hidden rounded-2xl border border-border bg-surface shadow-[var(--shadow-card)]">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-5 py-4 font-display text-lg font-semibold text-foreground transition-colors marker:hidden hover:bg-muted/40">
            <span>{collapsibleTitle}</span>
            <span
              className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-primary-soft text-lg leading-none text-primary transition group-open:rotate-45"
              aria-hidden
            >
              +
            </span>
          </summary>
          <div className={`border-t border-border/70 px-5 py-5 ${PROSE_TYPOGRAPHY}`}>
            {children}
          </div>
        </details>
      </div>
    );
  }

  return (
    <div className={`mx-auto max-w-3xl px-4 py-10 sm:px-6 sm:py-14 ${PROSE_TYPOGRAPHY}`}>
      {children}
    </div>
  );
}
