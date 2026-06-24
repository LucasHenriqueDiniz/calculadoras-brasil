import { useState } from "react";
import { Check, Copy, RotateCcw, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export function CopyResultButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
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
      {copied ? <Check className="mr-1 h-4 w-4" /> : <Copy className="mr-1 h-4 w-4" />}
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
      <Share2 className="mr-1 h-4 w-4" />
      {done ? "Link copiado" : "Copiar link"}
    </Button>
  );
}

export function ResetButton({ onReset }: { onReset: () => void }) {
  return (
    <Button type="button" variant="ghost" size="sm" onClick={onReset}>
      <RotateCcw className="mr-1 h-4 w-4" /> Restaurar valores padrão
    </Button>
  );
}
