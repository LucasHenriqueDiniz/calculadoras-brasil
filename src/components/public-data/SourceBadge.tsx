import { Link } from "@tanstack/react-router";
import { ExternalLink, FileText } from "lucide-react";
import { formatShortDate } from "@/lib/format";

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
  // The sources date their data by calendar day ("2026-10-10"). Read as a local
  // time, that was midnight UTC, the evening before in Brasília: the ANP week
  // ending 10/10 showed as "09/10". It is the data's date, not when our cache
  // last refreshed, which the old label claimed.
  const formattedDate = sourceLastUpdated ? formatShortDate(sourceLastUpdated) : "não disponível";

  const label = `Fonte: ${sourceName}${sourcePeriod ? `, período ${sourcePeriod}` : ""}, dados de ${formattedDate}`;

  const pill =
    "inline-flex items-center gap-1.5 rounded-full border border-border bg-muted px-2.5 py-1 text-xs text-muted-foreground transition-colors hover:border-primary/40 hover:text-foreground";

  return (
    <span className="flex flex-wrap gap-2">
      {sourceUrl ? (
        <a href={sourceUrl} target="_blank" rel="noreferrer" className={pill}>
          <ExternalLink className="h-3.5 w-3.5 shrink-0" aria-hidden />
          {label}
        </a>
      ) : (
        <span className={pill}>
          <FileText className="h-3.5 w-3.5 shrink-0" aria-hidden />
          {label}
        </span>
      )}
      <Link to="/metodologia" hash="fontes" className={pill}>
        Ver metodologia e limitações
      </Link>
    </span>
  );
}
