import { Link } from "@tanstack/react-router";

interface SourceBadgeProps {
  sourceName: string;
  sourceLastUpdated?: string | null;
  sourceUrl?: string;
  sourcePeriod?: string;
}

export function SourceBadge({
  sourceName,
  sourceLastUpdated,
  sourceUrl,
  sourcePeriod,
}: SourceBadgeProps) {
  const formattedDate = sourceLastUpdated
    ? new Intl.DateTimeFormat("pt-BR").format(new Date(sourceLastUpdated))
    : "data não disponível";

  const label = `Fonte: ${sourceName}${sourcePeriod ? `, período ${sourcePeriod}` : ""}, cache atualizado em ${formattedDate}`;

  return (
    <span className="flex flex-wrap gap-2">
      {sourceUrl ? (
        <a
          href={sourceUrl}
          target="_blank"
          rel="noreferrer"
          className="inline-flex rounded-full bg-muted px-2.5 py-1 text-xs text-muted-foreground hover:text-foreground"
        >
          {label}
        </a>
      ) : (
        <span className="inline-flex rounded-full bg-muted px-2.5 py-1 text-xs text-muted-foreground">
          {label}
        </span>
      )}
      <Link
        to="/metodologia"
        hash="fontes"
        className="inline-flex rounded-full bg-muted px-2.5 py-1 text-xs text-muted-foreground hover:text-foreground"
      >
        Ver metodologia e limitações
      </Link>
    </span>
  );
}
