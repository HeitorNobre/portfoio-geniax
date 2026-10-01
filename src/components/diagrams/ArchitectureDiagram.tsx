import { ArrowDown, ArrowRight, Database, FileSpreadsheet, LayoutDashboard, Workflow } from "lucide-react";
import { cn } from "@/lib/cn";

type Props = {
  sources: string[];
  processing: string[];
  storage: string[];
  outputs: string[];
};

const COLUMNS = [
  { key: "sources", title: "Fontes", caption: "Onde os dados já estão", Icon: FileSpreadsheet, tone: "neutral" },
  { key: "processing", title: "Automação", caption: "Coleta, tratamento e regras", Icon: Workflow, tone: "brand" },
  { key: "storage", title: "Base consolidada", caption: "Um lugar, um número oficial", Icon: Database, tone: "brand" },
  { key: "outputs", title: "Entregas", caption: "O que o gestor recebe", Icon: LayoutDashboard, tone: "dark" },
] as const;

/** Arquitetura em 4 camadas: fontes → automação → base → entregas */
export function ArchitectureDiagram(props: Props) {
  return (
    <div className="grid items-stretch gap-2 lg:grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr]">
      {COLUMNS.map((col, i) => (
        <div key={col.key} className="contents">
          <div
            className={cn(
              "flex flex-col rounded-2xl border p-5",
              col.tone === "neutral" && "border-ink-200 bg-white",
              col.tone === "brand" && "border-brand-200 bg-brand-50/60",
              col.tone === "dark" && "border-ink-900 bg-ink-950 text-white",
            )}
          >
            <div className="flex items-center gap-2.5">
              <span
                className={cn(
                  "inline-flex h-9 w-9 items-center justify-center rounded-xl",
                  col.tone === "neutral" && "bg-ink-100 text-ink-700",
                  col.tone === "brand" && "bg-brand-700 text-white",
                  col.tone === "dark" && "bg-white/10 text-white",
                )}
              >
                <col.Icon aria-hidden className="h-[18px] w-[18px]" />
              </span>
              <div>
                <p className={cn("text-sm font-semibold", col.tone === "dark" ? "text-white" : "text-ink-950")}>{col.title}</p>
                <p className={cn("text-xs", col.tone === "dark" ? "text-ink-400" : "text-ink-500")}>{col.caption}</p>
              </div>
            </div>
            <ul className="mt-4 space-y-2">
              {props[col.key].map((item) => (
                <li
                  key={item}
                  className={cn(
                    "rounded-lg px-3 py-2 text-[0.8125rem] leading-snug",
                    col.tone === "neutral" && "bg-ink-50 text-ink-700",
                    col.tone === "brand" && "bg-white text-ink-800 ring-1 ring-inset ring-brand-100",
                    col.tone === "dark" && "bg-white/5 text-ink-200 ring-1 ring-inset ring-white/10",
                  )}
                >
                  {item}
                </li>
              ))}
            </ul>
          </div>
          {i < COLUMNS.length - 1 && (
            <div aria-hidden className="flex items-center justify-center py-1 text-brand-500">
              <ArrowDown className="h-5 w-5 lg:hidden" />
              <ArrowRight className="hidden h-5 w-5 lg:block" />
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
