import { AlertCircle, CheckCircle2, Clock, Pencil } from "lucide-react";
import type { DataFreshness } from "@/lib/public-data/types";

const CONFIG: Record<
  DataFreshness,
  { message: string; className: string; Icon: typeof CheckCircle2; role?: "status" }
> = {
  fresh: {
    message: "Sugestão baseada no cache mais recente disponível.",
    className: "border-success/30 bg-success/10 text-success",
    Icon: CheckCircle2,
  },
  stale: {
    message: "Os dados podem estar desatualizados; confira o valor real antes de decidir.",
    className: "border-warning/40 bg-warning/10 text-warning",
    Icon: Clock,
  },
  unavailable: {
    message: "Fonte pública indisponível agora. Preencha manualmente.",
    className: "border-destructive/30 bg-destructive/10 text-destructive",
    Icon: AlertCircle,
    role: "status",
  },
  manual: {
    message: "Você está usando um valor editado manualmente.",
    className: "border-border bg-muted text-muted-foreground",
    Icon: Pencil,
  },
};

export function DataFreshnessNotice({ state }: { state: DataFreshness }) {
  const { message, className, Icon, role } = CONFIG[state];
  return (
    <span
      className={`inline-flex items-start gap-1.5 rounded-md border px-2 py-1 text-xs leading-snug ${className}`}
      role={role}
    >
      <Icon className="mt-px h-3.5 w-3.5 shrink-0" aria-hidden />
      <span>{message}</span>
    </span>
  );
}
