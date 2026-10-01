import { AlertTriangle, ArrowDown, ArrowRight, Check, Hand } from "lucide-react";
import { cn } from "@/lib/cn";

export type FlowNode = { label: string; detail?: string; manual?: boolean };

type Props = {
  steps: FlowNode[];
  variant: "before" | "after";
  className?: string;
  /** Layout compacto para a home */
  compact?: boolean;
};

/**
 * Diagrama de processo. Horizontal em telas largas, vertical no celular.
 * "before": etapas manuais destacadas em âmbar, conectores cinza.
 * "after": etapas automatizadas em azul, conector com fluxo animado.
 */
export function FlowDiagram({ steps, variant, className, compact }: Props) {
  const isAfter = variant === "after";
  return (
    <ol
      className={cn("flex flex-col items-stretch gap-0 lg:flex-row lg:items-stretch", className)}
      aria-label={isAfter ? "Processo automatizado" : "Processo manual atual"}
    >
      {steps.map((step, i) => {
        const last = i === steps.length - 1;
        const manual = !isAfter && step.manual;
        const endpoint = i === 0 || last;
        return (
          <li key={step.label} className="flex flex-col items-stretch lg:flex-1 lg:flex-row lg:items-center">
            <div
              className={cn(
                "relative flex flex-1 items-start gap-3 rounded-xl border px-3.5 py-3 lg:h-full lg:flex-col lg:gap-2 lg:px-3 lg:py-3.5",
                manual && "border-dashed border-warn/70 bg-warn-soft/60",
                !manual && !isAfter && "border-ink-200 bg-white",
                isAfter && !endpoint && "border-brand-200 bg-brand-50/70",
                isAfter && endpoint && "border-ink-200 bg-white",
                isAfter && last && "border-ink-950 bg-ink-950",
              )}
            >
              <span
                className={cn(
                  "mt-0.5 inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[0.6875rem] font-bold lg:mt-0",
                  manual && "bg-warn text-ink-950",
                  !manual && !isAfter && "bg-ink-100 text-ink-600",
                  isAfter && !last && "bg-brand-700 text-white",
                  isAfter && last && "bg-white text-ink-950",
                )}
                aria-hidden
              >
                {manual ? <Hand className="h-3.5 w-3.5" /> : isAfter && !endpoint ? <Check className="h-3.5 w-3.5" /> : i + 1}
              </span>
              <div className="min-w-0">
                <p
                  className={cn(
                    "text-sm font-semibold leading-snug",
                    isAfter && last ? "text-white" : "text-ink-950",
                    compact && "text-[0.8125rem]",
                  )}
                >
                  {step.label}
                </p>
                {step.detail && !compact && (
                  <p className={cn("mt-1 text-xs leading-relaxed", isAfter && last ? "text-ink-300" : "text-ink-600")}>
                    {step.detail}
                  </p>
                )}
                {manual && (
                  <span className="mt-1.5 inline-flex items-center gap-1 text-[0.6875rem] font-semibold uppercase tracking-wide text-warn-text">
                    <AlertTriangle aria-hidden className="h-3 w-3" /> Manual
                  </span>
                )}
              </div>
            </div>
            {!last && <Connector animated={isAfter} />}
          </li>
        );
      })}
    </ol>
  );
}

function Connector({ animated }: { animated: boolean }) {
  return (
    <div aria-hidden className="flex items-center justify-center py-1 lg:w-6 lg:shrink-0 lg:py-0">
      {animated ? (
        <>
          <svg className="h-5 w-3 lg:hidden" viewBox="0 0 12 20">
            <line x1="6" y1="0" x2="6" y2="20" stroke="#2A78D6" strokeWidth="2" strokeDasharray="4 4" className="motion-safe:animate-flow-dash" />
          </svg>
          <svg className="hidden h-3 w-6 lg:block" viewBox="0 0 24 12">
            <line x1="0" y1="6" x2="24" y2="6" stroke="#2A78D6" strokeWidth="2" strokeDasharray="4 4" className="motion-safe:animate-flow-dash" />
          </svg>
        </>
      ) : (
        <>
          <ArrowDown className="h-4 w-4 text-ink-400 lg:hidden" />
          <ArrowRight className="hidden h-4 w-4 text-ink-400 lg:block" />
        </>
      )}
    </div>
  );
}
