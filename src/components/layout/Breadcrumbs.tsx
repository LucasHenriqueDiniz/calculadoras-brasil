import { Fragment } from "react";
import { Link } from "@tanstack/react-router";
import { ChevronRight, Home } from "lucide-react";

export interface Crumb {
  label: string;
  /** Caminho do TanStack Router. Quando ausente, é o item atual (sem link). */
  to?: string;
}

export function Breadcrumbs({ items }: { items: Crumb[] }) {
  return (
    <nav aria-label="Trilha de navegação" className="min-w-0">
      <ol className="flex flex-wrap items-center gap-1.5 text-sm text-muted-foreground">
        <li className="flex items-center">
          <Link
            to="/"
            className="inline-flex items-center gap-1 rounded-md px-1 py-0.5 transition-colors hover:text-foreground"
          >
            <Home className="h-3.5 w-3.5" aria-hidden />
            <span className="sr-only sm:not-sr-only">Início</span>
          </Link>
        </li>
        {items.map((item, index) => {
          const isLast = index === items.length - 1;
          return (
            <Fragment key={item.label}>
              <li aria-hidden className="text-border">
                <ChevronRight className="h-3.5 w-3.5" />
              </li>
              <li className="flex min-w-0 items-center">
                {item.to && !isLast ? (
                  <Link
                    to={item.to}
                    className="truncate rounded-md px-1 py-0.5 transition-colors hover:text-foreground"
                  >
                    {item.label}
                  </Link>
                ) : (
                  <span
                    className="truncate px-1 py-0.5 font-medium text-foreground"
                    aria-current={isLast ? "page" : undefined}
                  >
                    {item.label}
                  </span>
                )}
              </li>
            </Fragment>
          );
        })}
      </ol>
    </nav>
  );
}
