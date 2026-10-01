import Link from "next/link";
import { AlertTriangle, ArrowRight, CalendarClock, ChevronRight, CircleAlert, Info, Lightbulb, TrendingUp } from "lucide-react";
import type { CaseStudy, Insight } from "@/data/cases";
import { DATA_REFERENCE } from "@/data/cases";
import { cn } from "@/lib/cn";
import { Container } from "@/components/ui/Container";
import { DemoBadge } from "@/components/ui/DemoBadge";
import { Button } from "@/components/ui/Button";
import { ContactButton } from "@/components/ui/ContactButton";

export function CaseHero({ study }: { study: CaseStudy }) {
  return (
    <header className="relative overflow-hidden border-b border-ink-200/70 pb-14 pt-8 sm:pb-20 sm:pt-12">
      <div aria-hidden className="grid-bg pointer-events-none absolute inset-0 [mask-image:radial-gradient(ellipse_70%_70%_at_80%_0%,black,transparent)]" />
      <Container className="relative">
        <nav aria-label="Trilha de navegação" className="text-sm text-ink-500">
          <ol className="flex flex-wrap items-center gap-1.5">
            <li>
              <Link href="/" className="hover:text-ink-900">
                Início
              </Link>
            </li>
            <ChevronRight aria-hidden className="h-3.5 w-3.5" />
            <li>
              <Link href="/#cases" className="hover:text-ink-900">
                Cases
              </Link>
            </li>
            <ChevronRight aria-hidden className="h-3.5 w-3.5" />
            <li aria-current="page" className="text-ink-800">
              {study.cardTitle}
            </li>
          </ol>
        </nav>

        <div className="mt-8 flex flex-wrap items-center gap-3">
          <DemoBadge />
          <span className="text-sm font-medium text-ink-500">{study.segment}</span>
        </div>
        <h1 className="mt-5 max-w-4xl text-balance text-[2rem] font-extrabold leading-[1.08] sm:text-5xl">{study.title}</h1>
        <p className="mt-5 max-w-3xl text-pretty text-lg leading-relaxed text-ink-600">{study.tagline}</p>

        <dl className="mt-10 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-ink-200 bg-ink-200 sm:grid-cols-4">
          {study.facts.map((f) => (
            <div key={f.label} className="bg-white px-5 py-4">
              <dt className="text-xs font-medium text-ink-500">{f.label}</dt>
              <dd className="mt-1 font-display text-2xl font-bold tracking-tight text-ink-950">{f.value}</dd>
            </div>
          ))}
        </dl>

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          <Button href="#dashboard" size="lg">
            Explorar o dashboard
            <ArrowRight aria-hidden className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </Button>
          <ContactButton label="Tenho um processo parecido" variant="secondary" message={`Olá! Vi o case "${study.cardTitle}" no site de vocês e tenho um processo parecido na minha empresa. Podemos conversar?`} />
        </div>

        <p className="mt-8 max-w-3xl rounded-xl border border-ink-200 bg-white/80 px-4 py-3 text-xs leading-relaxed text-ink-600">
          <strong className="text-ink-900">Sobre este case:</strong> a {study.company} é uma empresa fictícia. Todos os números são simulados
          (referência: {DATA_REFERENCE}) e foram construídos com regras de negócio realistas para demonstrar o raciocínio e o tipo de
          solução entregue. Os benefícios descritos são estimativas do processo proposto, não resultados obtidos.
        </p>
      </Container>
    </header>
  );
}

export const CASE_SECTIONS = [
  { id: "contexto", label: "Contexto" },
  { id: "processo", label: "Processo atual" },
  { id: "solucao", label: "Solução" },
  { id: "automacao", label: "Automação" },
  { id: "dashboard", label: "Dashboard" },
  { id: "insights", label: "Insights" },
  { id: "beneficios", label: "Benefícios" },
];

export function CaseSectionNav() {
  return (
    <nav aria-label="Seções do case" className="sticky top-[var(--header-h)] z-30 border-b border-ink-200/70 bg-white/90 backdrop-blur-md">
      <Container>
        <ol className="scrollbar-thin -mx-1 flex gap-1 overflow-x-auto px-1 py-2">
          {CASE_SECTIONS.map((s, i) => (
            <li key={s.id}>
              <a href={`#${s.id}`} className="flex items-center gap-2 whitespace-nowrap rounded-lg px-3 py-1.5 text-sm font-medium text-ink-600 transition-colors hover:bg-ink-100 hover:text-ink-950">
                <span className="tabular text-xs text-ink-400">{String(i + 1).padStart(2, "0")}</span>
                {s.label}
              </a>
            </li>
          ))}
        </ol>
      </Container>
    </nav>
  );
}

export function CaseSection({
  id,
  index,
  title,
  kicker,
  children,
  tone = "white",
  wide,
}: {
  id: string;
  index: number;
  title: string;
  kicker?: string;
  children: React.ReactNode;
  tone?: "white" | "muted";
  wide?: boolean;
}) {
  return (
    <section id={id} aria-labelledby={`${id}-title`} className={cn("scroll-mt-32 py-16 sm:py-20", tone === "muted" && "bg-ink-50")}>
      <Container className={wide ? "max-w-[84rem]" : undefined}>
        <div className="flex items-baseline gap-3">
          <span className="tabular font-display text-sm font-bold text-brand-600">{String(index).padStart(2, "0")}</span>
          <p className="eyebrow">{kicker ?? CASE_SECTIONS.find((s) => s.id === id)?.label}</p>
        </div>
        <h2 id={`${id}-title`} className="mt-3 max-w-3xl text-balance text-2xl font-bold leading-tight sm:text-[2rem]">
          {title}
        </h2>
        <div className="mt-8">{children}</div>
      </Container>
    </section>
  );
}

export function Prose({ paragraphs }: { paragraphs: string[] }) {
  return (
    <div className="space-y-4 text-[1.0625rem] leading-relaxed text-ink-700">
      {paragraphs.map((p) => (
        <p key={p.slice(0, 32)}>{p}</p>
      ))}
    </div>
  );
}

export function ManualTasksTable({ study }: { study: CaseStudy }) {
  return (
    <div className="overflow-hidden rounded-2xl border border-ink-200 bg-white">
      <div className="scrollbar-thin overflow-x-auto">
        <table className="w-full min-w-[640px] text-left text-sm">
          <caption className="sr-only">Tarefas manuais do processo atual</caption>
          <thead className="bg-ink-50">
            <tr className="text-xs uppercase tracking-wide text-ink-500">
              <th className="px-5 py-3 font-semibold">Tarefa manual</th>
              <th className="px-5 py-3 font-semibold">Frequência</th>
              <th className="px-5 py-3 text-right font-semibold">Tempo estimado</th>
              <th className="px-5 py-3 font-semibold">Risco</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ink-100">
            {study.manualTasks.map((t) => (
              <tr key={t.task}>
                <td className="px-5 py-3.5 font-medium text-ink-900">{t.task}</td>
                <td className="px-5 py-3.5 text-ink-600">{t.frequency}</td>
                <td className="tabular px-5 py-3.5 text-right font-semibold text-ink-900">{t.time}</td>
                <td className="px-5 py-3.5 text-ink-600">{t.risk}</td>
              </tr>
            ))}
          </tbody>
          <tfoot className="border-t border-ink-200 bg-warn-soft/50">
            <tr>
              <td className="px-5 py-3.5 font-semibold text-ink-950" colSpan={2}>
                Esforço manual estimado no cenário
              </td>
              <td className="px-5 py-3.5 text-right font-bold text-ink-950" colSpan={2}>
                {study.manualTotal}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}

export function Callout({ title, paragraphs, tone = "warn" }: { title: string; paragraphs: string[]; tone?: "warn" | "brand" }) {
  return (
    <div className={cn("flex gap-4 rounded-2xl border p-6", tone === "warn" ? "border-warn/40 bg-warn-soft/60" : "border-brand-100 bg-brand-50/70")}>
      {tone === "warn" ? (
        <AlertTriangle aria-hidden className="mt-0.5 h-5 w-5 shrink-0 text-warn-text" />
      ) : (
        <Lightbulb aria-hidden className="mt-0.5 h-5 w-5 shrink-0 text-brand-700" />
      )}
      <div>
        <p className="font-display text-lg font-semibold text-ink-950">{title}</p>
        <div className="mt-2 space-y-3 text-[0.9375rem] leading-relaxed text-ink-700">
          {paragraphs.map((p) => (
            <p key={p.slice(0, 32)}>{p}</p>
          ))}
        </div>
      </div>
    </div>
  );
}

export function AutomationTimeline({ steps }: { steps: CaseStudy["automation"] }) {
  return (
    <ol className="relative space-y-3">
      {steps.map((s, i) => (
        <li key={s.title} className="relative flex gap-4 rounded-2xl border border-ink-200 bg-white p-5">
          <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-brand-700 font-display text-sm font-bold text-white">{i + 1}</span>
          <div className="min-w-0">
            <p className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-700">
              <CalendarClock aria-hidden className="h-3.5 w-3.5" />
              {s.when}
            </p>
            <h3 className="mt-1 text-base font-semibold">{s.title}</h3>
            <p className="mt-1 text-sm leading-relaxed text-ink-600">{s.text}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}

const INSIGHT_STYLE: Record<Insight["tone"], { Icon: React.ComponentType<{ className?: string }>; cls: string; label: string }> = {
  bad: { Icon: CircleAlert, cls: "text-bad-text bg-bad-soft", label: "Problema" },
  warn: { Icon: AlertTriangle, cls: "text-warn-text bg-warn-soft", label: "Atenção" },
  good: { Icon: TrendingUp, cls: "text-good-text bg-good-soft", label: "Destaque positivo" },
  info: { Icon: Info, cls: "text-brand-800 bg-brand-50", label: "Informação" },
};

export function InsightsGrid({ insights }: { insights: Insight[] }) {
  return (
    <ul className="grid gap-4 md:grid-cols-2">
      {insights.map((ins) => {
        const s = INSIGHT_STYLE[ins.tone];
        return (
          <li key={ins.title} className="card flex flex-col p-6">
            <span className={cn("inline-flex w-fit items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold", s.cls)}>
              <s.Icon aria-hidden className="h-3.5 w-3.5" />
              {s.label}
            </span>
            <h3 className="mt-4 text-lg font-semibold leading-snug">{ins.title}</h3>
            <p className="mt-2 text-[0.9375rem] leading-relaxed text-ink-600">{ins.text}</p>
          </li>
        );
      })}
    </ul>
  );
}
