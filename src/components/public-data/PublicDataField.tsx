import { LoaderCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DataFreshnessNotice } from "./DataFreshnessNotice";
import { SourceBadge } from "./SourceBadge";

interface PublicDataFieldProps {
  label: string;
  value: number | string;
  sourceName?: string;
  sourceLastUpdated?: string | null;
  sourceUrl?: string;
  sourcePeriod?: string;
  isLoading?: boolean;
  isStale?: boolean;
  error?: string | null;
  isManual?: boolean;
  helperText?: string;
  onManualChange: (value: string) => void;
}

export function PublicDataField({
  label,
  value,
  sourceName,
  sourceLastUpdated,
  sourceUrl,
  sourcePeriod,
  isLoading = false,
  isStale = false,
  error,
  isManual = false,
  helperText,
  onManualChange,
}: PublicDataFieldProps) {
  const id = `public-data-${label.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;
  const state = error ? "unavailable" : isManual ? "manual" : isStale ? "stale" : "fresh";

  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <div className="relative">
        <Input
          id={id}
          type="text"
          inputMode="decimal"
          value={value}
          disabled={isLoading}
          onChange={(event) => onManualChange(event.target.value)}
          aria-describedby={`${id}-help`}
          aria-busy={isLoading}
          className={`h-11 bg-background transition-shadow focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/40 ${isLoading ? "pr-10" : ""}`}
        />
        {isLoading ? (
          <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-primary">
            <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden />
            <span className="sr-only">Carregando dados públicos…</span>
          </span>
        ) : null}
      </div>
      <div id={`${id}-help`} className="space-y-2">
        {helperText ? (
          <p className="text-xs leading-relaxed text-muted-foreground">{helperText}</p>
        ) : null}
        <DataFreshnessNotice state={state} />
        {error ? (
          <p className="text-xs leading-relaxed text-destructive" role="status">
            {error}
          </p>
        ) : null}
        {sourceName ? (
          <SourceBadge
            sourceName={sourceName}
            sourceLastUpdated={sourceLastUpdated}
            sourceUrl={sourceUrl}
            sourcePeriod={sourcePeriod}
          />
        ) : null}
      </div>
    </div>
  );
}
