"use client";

import { useId, useRef } from "react";
import { AlertTriangle, ArrowDownRight, ArrowUpRight, CheckCircle2, ChevronDown, CircleAlert, Info, Minus } from "lucide-react";
import { cn } from "@/lib/cn";

/* ------------------------------------------------------------------ */
/* Moldura do dashboard                                                */
/* ------------------------------------------------------------------ */

export function DashboardShell({
  company,
  title,
  updatedAt,
  filters,
  tabs,
  children,
}: {
  company: string;
  title: string;
  updatedAt: string;
  filters?: React.ReactNode;
  tabs?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-ink-200 bg-ink-50 shadow-float">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-ink-200 bg-white px-4 py-3 sm:px-5">
        <div className="flex min-w-0 items-center gap-3">
          <div className="hidden gap-1.5 sm:flex" aria-hidden>
            <span className="h-2.5 w-2.5 rounded-full bg-ink-200" />
            <span className="h-2.5 w-2.5 rounded-full bg-ink-200" />
            <span className="h-2.5 w-2.5 rounded-full bg-ink-200" />
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-ink-950">{title}</p>
            <p className="truncate text-xs text-ink-500">{company} · empresa fictícia</p>
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs text-ink-500">
          <span className="relative flex h-2 w-2" aria-hidden>
            <span className="absolute inline-flex h-full w-full rounded-full bg-good opacity-60 motion-safe:animate-ping" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-good" />
          </span>
          <span>
            Atualização automática · <span className="tabular">{updatedAt}</span>
          </span>
        </div>
      </div>
      {(filters || tabs) && (
        <div className="flex flex-col gap-3 border-b border-ink-200 bg-white px-4 pb-0 pt-3 sm:px-5">
          {filters && <div className="flex flex-wrap items-end gap-2.5">{filters}</div>}
          {tabs}
        </div>
      )}
      <div className="p-3 sm:p-5">{children}</div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Abas acessíveis                                                     */
/* ------------------------------------------------------------------ */

export function Tabs<T extends string>({
  tabs,
  value,
  onChange,
  label,
}: {
  tabs: { id: T; label: string }[];
  value: T;
  onChange: (id: T) => void;
  label: string;
}) {
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const onKey = (e: React.KeyboardEvent, i: number) => {
    if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
    e.preventDefault();
    const next = (i + (e.key === "ArrowRight" ? 1 : -1) + tabs.length) % tabs.length;
    onChange(tabs[next].id);
    refs.current[next]?.focus();
  };
  return (
    <div role="tablist" aria-label={label} className="scrollbar-thin -mx-1 flex gap-1 overflow-x-auto px-1">
      {tabs.map((t, i) => {
        const selected = t.id === value;
        return (
          <button
            key={t.id}
            ref={(el) => {
              refs.current[i] = el;
            }}
            role="tab"
            type="button"
            aria-selected={selected}
            tabIndex={selected ? 0 : -1}
            onClick={() => onChange(t.id)}
            onKeyDown={(e) => onKey(e, i)}
            className={cn(
              "relative whitespace-nowrap px-3 pb-3 pt-1.5 text-sm font-medium transition-colors",
              selected ? "text-ink-950" : "text-ink-500 hover:text-ink-800",
            )}
          >
            {t.label}
            <span
              aria-hidden
              className={cn(
                "absolute inset-x-2 bottom-0 h-0.5 rounded-full transition-all",
                selected ? "bg-brand-600 opacity-100" : "bg-transparent opacity-0",
              )}
            />
          </button>
        );
      })}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Filtros                                                             */
/* ------------------------------------------------------------------ */

export function Segmented<T extends string | number>({
  options,
  value,
  onChange,
  label,
}: {
  options: { value: T; label: string }[];
  value: T;
  onChange: (v: T) => void;
  label: string;
}) {
  return (
    <div className="flex flex-col gap-1">
      <span className="text-[0.6875rem] font-medium uppercase tracking-wide text-ink-500">{label}</span>
      <div role="radiogroup" aria-label={label} className="inline-flex rounded-lg bg-ink-100 p-0.5">
        {options.map((o) => {
          const selected = o.value === value;
          return (
            <button
              key={String(o.value)}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => onChange(o.value)}
              className={cn(
                "h-8 rounded-md px-3 text-xs font-semibold transition-all",
                selected ? "bg-white text-ink-950 shadow-sm" : "text-ink-600 hover:text-ink-900",
              )}
            >
              {o.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export function SelectFilter<T extends string>({
  label,
  value,
  onChange,
  options,
  className,
}: {
  label: string;
  value: T;
  onChange: (v: T) => void;
  options: { value: T; label: string }[];
  className?: string;
}) {
  const id = useId();
  return (
    <div className={cn("flex min-w-[9rem] flex-col gap-1", className)}>
      <label htmlFor={id} className="text-[0.6875rem] font-medium uppercase tracking-wide text-ink-500">
        {label}
      </label>
      <div className="relative">
        <select
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value as T)}
          className="h-9 w-full appearance-none rounded-lg border border-ink-200 bg-white pl-3 pr-8 text-xs font-medium text-ink-900 transition-colors hover:border-ink-300 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100"
        >
          {options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <ChevronDown aria-hidden className="pointer-events-none absolute right-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-ink-500" />
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* KPI                                                                 */
/* ------------------------------------------------------------------ */

export function Kpi({
  label,
  value,
  delta,
  deltaLabel,
  goodWhen = "up",
  hint,
  status,
  children,
}: {
  label: string;
  value: string;
  /** variação já formatada com sinal, ex.: "+4,2%" ou "−1,3 p.p." */
  delta?: string;
  deltaLabel?: string;
  goodWhen?: "up" | "down";
  hint?: string;
  status?: "good" | "warn" | "bad";
  children?: React.ReactNode;
}) {
  return (
    <div className="flex min-w-0 flex-col rounded-xl border border-ink-200 bg-white p-3.5 sm:p-4">
      <div className="flex items-start justify-between gap-2">
        <p className="text-xs font-medium leading-snug text-ink-600">{label}</p>
        {status && <StatusDot status={status} />}
      </div>
      <p className="mt-1.5 truncate font-display text-[1.375rem] font-bold leading-tight tracking-tight text-ink-950 sm:text-2xl">{value}</p>
      {delta && <DeltaLine delta={delta} goodWhen={goodWhen} label={deltaLabel} />}
      {hint && <p className="mt-1 text-[0.6875rem] leading-snug text-ink-500">{hint}</p>}
      {children}
    </div>
  );
}

function DeltaLine({ delta, goodWhen, label }: { delta: string; goodWhen: "up" | "down"; label?: string }) {
  const dir = delta.startsWith("+") ? "up" : delta.startsWith("−") || delta.startsWith("-") ? "down" : "flat";
  const good = dir === "flat" ? null : (dir === "up") === (goodWhen === "up");
  const Icon = dir === "up" ? ArrowUpRight : dir === "down" ? ArrowDownRight : Minus;
  return (
    <p className="mt-1 flex flex-wrap items-center gap-1 text-[0.6875rem]">
      <span
        className={cn(
          "inline-flex items-center gap-0.5 rounded px-1 py-0.5 font-semibold",
          good === true && "bg-good-soft text-good-text",
          good === false && "bg-bad-soft text-bad-text",
          good === null && "bg-ink-100 text-ink-600",
        )}
      >
        <Icon aria-hidden className="h-3 w-3" />
        {delta}
      </span>
      {label && <span className="text-ink-500">{label}</span>}
    </p>
  );
}

export function StatusDot({ status }: { status: "good" | "warn" | "bad" }) {
  const label = status === "good" ? "Dentro do esperado" : status === "warn" ? "Atenção" : "Crítico";
  const Icon = status === "good" ? CheckCircle2 : status === "warn" ? AlertTriangle : CircleAlert;
  return (
    <span
      title={label}
      className={cn(
        "inline-flex items-center",
        status === "good" && "text-good-text",
        status === "warn" && "text-warn-text",
        status === "bad" && "text-bad-text",
      )}
    >
      <Icon aria-hidden className="h-4 w-4" />
      <span className="sr-only">{label}</span>
    </span>
  );
}

export function StatusPill({ status, children }: { status: "good" | "warn" | "bad" | "neutral"; children: React.ReactNode }) {
  const Icon = status === "good" ? CheckCircle2 : status === "warn" ? AlertTriangle : status === "bad" ? CircleAlert : Info;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 whitespace-nowrap rounded-full px-2 py-0.5 text-[0.6875rem] font-semibold",
        status === "good" && "bg-good-soft text-good-text",
        status === "warn" && "bg-warn-soft text-warn-text",
        status === "bad" && "bg-bad-soft text-bad-text",
        status === "neutral" && "bg-ink-100 text-ink-700",
      )}
    >
      <Icon aria-hidden className="h-3 w-3" />
      {children}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/* Painel                                                              */
/* ------------------------------------------------------------------ */

export function Panel({
  title,
  question,
  children,
  className,
  actions,
  footer,
}: {
  title: string;
  /** pergunta de negócio que o painel responde */
  question?: string;
  children: React.ReactNode;
  className?: string;
  actions?: React.ReactNode;
  footer?: React.ReactNode;
}) {
  return (
    <section className={cn("flex min-w-0 flex-col rounded-xl border border-ink-200 bg-white", className)}>
      <header className="flex flex-wrap items-start justify-between gap-2 px-4 pb-2 pt-3.5">
        <div className="min-w-0">
          <h4 className="font-sans text-sm font-semibold tracking-normal text-ink-950">{title}</h4>
          {question && <p className="mt-0.5 text-xs text-ink-500">{question}</p>}
        </div>
        {actions}
      </header>
      <div className="min-w-0 flex-1 px-2 pb-3 sm:px-3">{children}</div>
      {footer && <footer className="border-t border-ink-100 px-4 py-2.5 text-[0.6875rem] text-ink-500">{footer}</footer>}
    </section>
  );
}

/** Legenda — identidade nunca depende só de cor */
export function Legend({ items }: { items: { label: string; color: string; dashed?: boolean }[] }) {
  return (
    <ul className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[0.6875rem] text-ink-600">
      {items.map((i) => (
        <li key={i.label} className="inline-flex items-center gap-1.5">
          {i.dashed ? (
            <span aria-hidden className="h-0 w-3.5 border-t-2 border-dashed" style={{ borderColor: i.color }} />
          ) : (
            <span aria-hidden className="h-2 w-2 rounded-sm" style={{ background: i.color }} />
          )}
          {i.label}
        </li>
      ))}
    </ul>
  );
}

/* ------------------------------------------------------------------ */
/* Alertas                                                             */
/* ------------------------------------------------------------------ */

export type AlertItem = { tone: "bad" | "warn" | "info"; title: string; detail: string };

export function AlertList({ items }: { items: AlertItem[] }) {
  return (
    <ul className="space-y-2">
      {items.map((a) => (
        <li
          key={a.title}
          className={cn(
            "flex gap-2.5 rounded-lg border px-3 py-2.5",
            a.tone === "bad" && "border-bad/20 bg-bad-soft/60",
            a.tone === "warn" && "border-warn/30 bg-warn-soft/70",
            a.tone === "info" && "border-brand-100 bg-brand-50/70",
          )}
        >
          <span
            className={cn(
              "mt-0.5 shrink-0",
              a.tone === "bad" && "text-bad-text",
              a.tone === "warn" && "text-warn-text",
              a.tone === "info" && "text-brand-700",
            )}
          >
            {a.tone === "info" ? <Info aria-hidden className="h-4 w-4" /> : a.tone === "warn" ? <AlertTriangle aria-hidden className="h-4 w-4" /> : <CircleAlert aria-hidden className="h-4 w-4" />}
          </span>
          <div className="min-w-0">
            <p className="text-xs font-semibold leading-snug text-ink-900">{a.title}</p>
            <p className="mt-0.5 text-[0.6875rem] leading-relaxed text-ink-600">{a.detail}</p>
          </div>
        </li>
      ))}
    </ul>
  );
}

/* ------------------------------------------------------------------ */
/* Tabela                                                              */
/* ------------------------------------------------------------------ */

export function DataTable({ children, caption }: { children: React.ReactNode; caption: string }) {
  return (
    <div className="scrollbar-thin -mx-2 overflow-x-auto sm:-mx-3">
      <table className="w-full min-w-[440px] border-collapse text-left text-xs">
        <caption className="sr-only">{caption}</caption>
        {children}
      </table>
    </div>
  );
}

export const th = "whitespace-nowrap border-b border-ink-200 px-3 py-2 text-[0.6875rem] font-semibold uppercase tracking-wide text-ink-500";
export const td = "whitespace-nowrap border-b border-ink-100 px-3 py-2.5 text-ink-800";

/** Barra horizontal inline para tabelas */
export function InlineBar({ value, max, color = "#2A78D6", marker }: { value: number; max: number; color?: string; marker?: number }) {
  const pct = Math.max(0, Math.min(1, value / (max || 1)));
  return (
    <div className="relative h-1.5 w-20 rounded-full bg-ink-100">
      <div className="absolute inset-y-0 left-0 rounded-full" style={{ width: `${pct * 100}%`, background: color }} />
      {marker !== undefined && (
        <div className="absolute -top-1 h-3.5 w-px bg-ink-700" style={{ left: `${Math.min(1, marker / (max || 1)) * 100}%` }} aria-hidden />
      )}
    </div>
  );
}
