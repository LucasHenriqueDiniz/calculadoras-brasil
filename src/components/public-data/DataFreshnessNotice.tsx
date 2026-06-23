import type { DataFreshness } from "@/lib/public-data/types";

const MESSAGES: Record<DataFreshness, string> = {
  fresh: "Sugestão baseada no cache mais recente disponível.",
  stale: "Os dados podem estar desatualizados; confira o valor real antes de decidir.",
  unavailable: "Fonte pública indisponível agora. Preencha manualmente.",
  manual: "Você está usando um valor editado manualmente.",
};

export function DataFreshnessNotice({ state }: { state: DataFreshness }) {
  return (
    <p
      className="text-xs text-muted-foreground"
      role={state === "unavailable" ? "status" : undefined}
    >
      {MESSAGES[state]}
    </p>
  );
}
