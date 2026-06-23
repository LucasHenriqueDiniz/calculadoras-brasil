import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DataFreshnessNotice } from "./DataFreshnessNotice";
import { SourceBadge } from "./SourceBadge";

interface PublicDataFieldProps {
  label: string;
  value: number | string;
  sourceName?: string;
  sourceLastUpdated?: string | null;
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
      <Input
        id={id}
        type="text"
        inputMode="decimal"
        value={value}
        disabled={isLoading}
        onChange={(event) => onManualChange(event.target.value)}
        aria-describedby={`${id}-help`}
      />
      <div id={`${id}-help`} className="space-y-1">
        {helperText ? <p className="text-xs text-muted-foreground">{helperText}</p> : null}
        <DataFreshnessNotice state={state} />
        {error ? (
          <p className="text-xs text-destructive" role="status">
            {error}
          </p>
        ) : null}
        {sourceName ? (
          <SourceBadge sourceName={sourceName} sourceLastUpdated={sourceLastUpdated} />
        ) : null}
      </div>
    </div>
  );
}
