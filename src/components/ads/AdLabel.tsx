import { type ReactNode } from "react";
import { Tag } from "lucide-react";

interface AdLabelProps {
  variant?: "top" | "inline";
  children?: ReactNode;
}

/**
 * AdLabel - Label claro para identificar ad-slots
 *
 * Garante conformidade com ADS-PROG-03 (ad labels) e ADS-UX-06 (sem confusão com conteúdo).
 * Deve ser sempre posicionado acima ou ao lado de cada ad-slot.
 *
 * Uso:
 * <AdLabel variant="top" />
 * <GoogleAdSense />
 */
export function AdLabel({ variant = "top", children }: AdLabelProps) {
  if (variant === "inline") {
    return (
      <div className="mb-3 flex items-center gap-2">
        <Tag className="h-3.5 w-3.5 text-muted-foreground" aria-hidden />
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {children || "Anúncio"}
        </span>
      </div>
    );
  }

  return (
    <div className="mb-2 flex items-center gap-2">
      <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {children || "Anúncio"}
      </span>
      <Tag className="h-3.5 w-3.5 text-muted-foreground" aria-hidden />
    </div>
  );
}

/**
 * AdContainer - Wrapper para ad-slots com styling e label
 *
 * Posiciona ads sem confusão com conteúdo principal.
 * Mantém separação visual clara.
 */
interface AdContainerProps {
  children: ReactNode;
  label?: string;
  ariaLabel?: string;
}

export function AdContainer({ children, label, ariaLabel }: AdContainerProps) {
  return (
    <aside
      aria-label={ariaLabel || "Espaço para anúncio"}
      className="my-6 rounded-lg border border-border/50 bg-muted/20 p-4 sm:p-6"
    >
      <AdLabel variant="top">{label}</AdLabel>
      <div className="min-h-[250px] sm:min-h-[280px]" id="ad-slot">
        {children}
      </div>
    </aside>
  );
}
