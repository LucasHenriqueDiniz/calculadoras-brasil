import { useId, type ReactNode } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { parseBRNumber } from "@/lib/format";

interface BaseProps {
  label: string;
  hint?: string;
  id?: string;
}

interface NumberFieldProps extends BaseProps {
  value: number;
  onChange: (n: number) => void;
  min?: number;
  max?: number;
  step?: number;
  suffix?: ReactNode;
  prefix?: ReactNode;
  decimals?: number;
}

function FieldWrap({
  htmlFor,
  label,
  hint,
  children,
}: {
  htmlFor: string;
  label: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={htmlFor} className="text-sm font-medium text-foreground">
        {label}
      </Label>
      {children}
      {hint ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
    </div>
  );
}

export function NumberInput({
  label,
  hint,
  id,
  value,
  onChange,
  min = 0,
  max,
  step = 1,
  suffix,
}: NumberFieldProps) {
  const reactId = useId();
  const inputId = id ?? reactId;
  return (
    <FieldWrap htmlFor={inputId} label={label} hint={hint}>
      <div className="relative">
        <Input
          id={inputId}
          type="number"
          inputMode="decimal"
          min={min}
          max={max}
          step={step}
          value={Number.isFinite(value) ? value : 0}
          onChange={(e) => {
            const n = Number(e.target.value);
            const safe = Number.isFinite(n) ? Math.max(min, n) : 0;
            onChange(max !== undefined ? Math.min(max, safe) : safe);
          }}
          className={suffix ? "pr-14" : undefined}
        />
        {suffix ? (
          <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-xs text-muted-foreground">
            {suffix}
          </span>
        ) : null}
      </div>
    </FieldWrap>
  );
}

export function CurrencyInput({ label, hint, id, value, onChange, min = 0 }: NumberFieldProps) {
  const reactId = useId();
  const inputId = id ?? reactId;
  return (
    <FieldWrap htmlFor={inputId} label={label} hint={hint}>
      <div className="relative">
        <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-sm text-muted-foreground">
          R$
        </span>
        <Input
          id={inputId}
          type="text"
          inputMode="decimal"
          value={Number.isFinite(value) ? value.toString().replace(".", ",") : "0"}
          onChange={(e) => {
            const n = parseBRNumber(e.target.value);
            onChange(Math.max(min, n));
          }}
          className="pl-9"
        />
      </div>
    </FieldWrap>
  );
}

export function PercentageInput(props: NumberFieldProps) {
  return <NumberInput {...props} min={props.min ?? 0} max={props.max ?? 100} suffix="%" />;
}

interface SelectFieldProps extends BaseProps {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}

export function SelectField({ label, hint, id, value, onChange, options }: SelectFieldProps) {
  const reactId = useId();
  const inputId = id ?? reactId;
  return (
    <FieldWrap htmlFor={inputId} label={label} hint={hint}>
      <select
        id={inputId}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </FieldWrap>
  );
}
