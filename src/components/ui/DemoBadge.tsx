import { FlaskConical } from "lucide-react";
import { cn } from "@/lib/cn";

/** Selo obrigatório em todo case: deixa claro que empresa e dados são fictícios */
export function DemoBadge({ className, compact }: { className?: string; compact?: boolean }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border border-warn/50 bg-warn-soft px-2.5 py-1 text-xs font-semibold text-warn-text",
        className,
      )}
    >
      <FlaskConical aria-hidden className="h-3.5 w-3.5" />
      {compact ? "Case demonstrativo" : "Case demonstrativo · dados simulados"}
    </span>
  );
}
