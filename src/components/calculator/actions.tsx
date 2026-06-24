import { useState } from "react";
import { Check, Copy, Link2, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const DONE_CLASS = "border-success/40 bg-success/10 text-success hover:bg-success/15";

export function CopyResultButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      className={cn("transition-colors", copied && DONE_CLASS)}
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(text);
          setCopied(true);
          setTimeout(() => setCopied(false), 1800);
        } catch {
          /* ignore */
        }
      }}
    >
      {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
      {copied ? "Copiado" : "Copiar resultado"}
    </Button>
  );
}

export function ShareResultButton({ title, text }: { title: string; text: string }) {
  const [done, setDone] = useState(false);
  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      className={cn("transition-colors", done && DONE_CLASS)}
      aria-label={`Copiar link de compartilhamento de ${title}`}
      onClick={async () => {
        const url = typeof window !== "undefined" ? window.location.href : "";
        try {
          await navigator.clipboard.writeText(`${text} ${url}`.trim());
          setDone(true);
          setTimeout(() => setDone(false), 1800);
        } catch {
          /* ignore */
        }
      }}
    >
      {done ? <Check className="h-4 w-4" /> : <Link2 className="h-4 w-4" />}
      {done ? "Link copiado" : "Copiar link"}
    </Button>
  );
}

export function ResetButton({ onReset }: { onReset: () => void }) {
  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      className="text-muted-foreground hover:text-foreground"
      onClick={onReset}
    >
      <RotateCcw className="h-4 w-4" /> Restaurar valores padrão
    </Button>
  );
}
