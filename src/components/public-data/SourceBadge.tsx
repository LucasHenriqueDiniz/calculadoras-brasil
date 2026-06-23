import { Link } from "@tanstack/react-router";

interface SourceBadgeProps {
  sourceName: string;
  sourceLastUpdated?: string | null;
}

export function SourceBadge({ sourceName, sourceLastUpdated }: SourceBadgeProps) {
  const formattedDate = sourceLastUpdated
    ? new Intl.DateTimeFormat("pt-BR").format(new Date(sourceLastUpdated))
    : "data não disponível";

  return (
    <Link
      to="/metodologia"
      hash="fontes"
      className="inline-flex rounded-full bg-muted px-2.5 py-1 text-xs text-muted-foreground hover:text-foreground"
    >
      Fonte: {sourceName}, cache atualizado em {formattedDate}
    </Link>
  );
}
