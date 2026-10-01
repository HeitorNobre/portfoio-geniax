"use client";

import { useState } from "react";
import { AlertTriangle, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/cn";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { FlowDiagram, type FlowNode } from "@/components/diagrams/FlowDiagram";

const BEFORE: FlowNode[] = [
  { label: "ERP / Sistema", detail: "Os dados existem, mas presos no sistema" },
  { label: "Exportação manual", detail: "Alguém baixa relatório por relatório", manual: true },
  { label: "Planilhas", detail: "Um arquivo por área, período ou unidade", manual: true },
  { label: "Tratamento", detail: "Ajuste de colunas, datas e nomes", manual: true },
  { label: "Consolidação", detail: "Copiar, colar, conferir fórmulas", manual: true },
  { label: "Relatório", detail: "Montado à mão, sempre atrasado", manual: true },
  { label: "Gestor", detail: "Decide com números de semanas atrás" },
];

const AFTER: FlowNode[] = [
  { label: "Sistema + arquivos", detail: "As mesmas fontes de hoje, sem troca de sistema" },
  { label: "Pipeline automatizado", detail: "Coleta e trata no horário definido" },
  { label: "Base tratada", detail: "Dados padronizados e históricos" },
  { label: "Dashboard", detail: "Indicadores atualizados, com filtros" },
  { label: "Alertas / relatórios", detail: "Exceções avisadas automaticamente" },
  { label: "Gestor", detail: "Acompanha a operação no dia a dia" },
];

const NOTES = {
  before: [
    "Horas por semana em tarefas repetitivas",
    "Processo depende de quem sabe mexer na planilha",
    "Erros de cópia só aparecem depois",
    "Número chega quando já não dá para agir",
  ],
  after: [
    "Rotina roda sozinha, com registro de cada execução",
    "Lógica documentada, não na cabeça de uma pessoa",
    "Mesma base para todos os relatórios",
    "Problemas avisados enquanto ainda dá para agir",
  ],
};

export function BeforeAfter() {
  const [view, setView] = useState<"before" | "after">("before");
  const isAfter = view === "after";

  return (
    <section id="como-funciona" className="scroll-mt-20 bg-ink-50 py-20 sm:py-28" aria-labelledby="como-funciona-title">
      <Container>
        <div className="flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
          <SectionHeading
            id="como-funciona-title"
            eyebrow="Como funciona"
            title="O mesmo processo, sem as etapas manuais no meio."
            lead="Não troco os sistemas da sua empresa. Coloco uma camada automatizada entre eles e as pessoas que precisam da informação."
          />
          <div role="tablist" aria-label="Comparar processo" className="inline-flex shrink-0 self-start rounded-xl bg-white p-1 shadow-card ring-1 ring-ink-200 lg:self-end">
            {(["before", "after"] as const).map((v) => (
              <button
                key={v}
                role="tab"
                type="button"
                aria-selected={view === v}
                aria-controls="fluxo-panel"
                onClick={() => setView(v)}
                className={cn(
                  "h-10 rounded-lg px-5 text-sm font-semibold transition-all",
                  view === v ? (v === "after" ? "bg-brand-700 text-white shadow-sm" : "bg-ink-950 text-white shadow-sm") : "text-ink-600 hover:text-ink-950",
                )}
              >
                {v === "before" ? "Antes" : "Depois"}
              </button>
            ))}
          </div>
        </div>

        <div id="fluxo-panel" role="tabpanel" className="mt-12 rounded-3xl border border-ink-200 bg-white p-4 shadow-card sm:p-8">
          <div className="flex items-center gap-2">
            {isAfter ? <CheckCircle2 aria-hidden className="h-5 w-5 text-brand-600" /> : <AlertTriangle aria-hidden className="h-5 w-5 text-warn-text" />}
            <p className="font-display text-lg font-semibold text-ink-950">{isAfter ? "Processo automatizado" : "Processo manual típico"}</p>
          </div>
          <div key={view} className="mt-6 motion-safe:animate-fade-up">
            <FlowDiagram steps={isAfter ? AFTER : BEFORE} variant={view} />
          </div>
          <ul className="mt-8 grid gap-3 border-t border-ink-100 pt-6 sm:grid-cols-2 lg:grid-cols-4">
            {NOTES[view].map((n) => (
              <li key={n} className="flex gap-2.5 text-sm text-ink-700">
                {isAfter ? (
                  <CheckCircle2 aria-hidden className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" />
                ) : (
                  <AlertTriangle aria-hidden className="mt-0.5 h-4 w-4 shrink-0 text-warn-text" />
                )}
                {n}
              </li>
            ))}
          </ul>
        </div>
      </Container>
    </section>
  );
}
