import Link from "next/link";
import { ArrowUpRight, HelpCircle } from "lucide-react";
import { CASES } from "@/data/cases";
import { condoRanking, DEFAULT_CONDO_FILTERS, kpis } from "@/data/mock/condominios";
import { distSeries, sellerPerformance } from "@/data/mock/distribuidora";
import { aging, DEFAULT_FIN_FILTERS, finKpis } from "@/data/mock/financeiro";
import { formatBRLCompact, formatPct, formatSignedPct } from "@/lib/format";
import { Container } from "@/components/ui/Container";
import { DemoBadge } from "@/components/ui/DemoBadge";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Sparkline } from "@/components/charts/Sparkline";

/** Miniaturas "vivas" de cada dashboard, calculadas dos mesmos dados das páginas */
function CondoPreview() {
  const k = kpis(DEFAULT_CONDO_FILTERS);
  const top = [...condoRanking(DEFAULT_CONDO_FILTERS)].sort((a, b) => b.inadAtual - b.inadAnterior - (a.inadAtual - a.inadAnterior))[0];
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-2">
        <Tile label="Chamados no prazo" value={formatPct(k.sla, 0)} />
        <Tile label="Fora do SLA agora" value={String(k.abertosAtrasados)} alert />
      </div>
      <div className="rounded-lg bg-white p-2.5 ring-1 ring-ink-100">
        <p className="truncate text-[0.6875rem] text-ink-500">Inadimplência · {top.condo.name}</p>
        <Sparkline values={top.inadTrend} area className="mt-1 h-10 w-full" color="#2A78D6" />
      </div>
    </div>
  );
}

function DistPreview() {
  const monthly = distSeries({ period: "12m", sellerId: "all", route: "all" });
  const worst = [...sellerPerformance({ period: "30d", sellerId: "all", route: "all" })].sort((a, b) => a.variacao - b.variacao)[0];
  const last = monthly[monthly.length - 1];
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-2">
        <Tile label="Faturamento do mês" value={formatBRLCompact(last.faturamento)} />
        <Tile label={`${worst.seller.name} · 30 dias`} value={formatSignedPct(worst.variacao)} alert />
      </div>
      <div className="rounded-lg bg-white p-2.5 ring-1 ring-ink-100">
        <p className="text-[0.6875rem] text-ink-500">Faturamento mensal · 12 meses</p>
        <Sparkline values={monthly.map((m) => m.faturamento)} area className="mt-1 h-10 w-full" color="#2A78D6" />
      </div>
    </div>
  );
}

function FinPreview() {
  const k = finKpis(DEFAULT_FIN_FILTERS);
  const buckets = aging(DEFAULT_FIN_FILTERS).filter((b) => b.kind === "vencido");
  const max = Math.max(...buckets.map((b) => b.value));
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-2">
        <Tile label="A vencer em 30 dias" value={formatBRLCompact(k.aVencer30)} />
        <Tile label="Vencido" value={formatBRLCompact(k.vencido)} alert />
      </div>
      <div className="rounded-lg bg-white p-2.5 ring-1 ring-ink-100">
        <p className="text-[0.6875rem] text-ink-500">Aging dos vencidos</p>
        <div className="mt-1.5 flex h-10 items-end gap-1.5" aria-hidden>
          {buckets.map((b, i) => (
            <div key={b.id} className="flex-1 rounded-t-sm" style={{ height: `${Math.max(12, (b.value / max) * 100)}%`, background: ["#F4A582", "#EF8A5E", "#EB6834", "#C4501F", "#8F3814"][i] }} />
          ))}
        </div>
      </div>
    </div>
  );
}

function Tile({ label, value, alert }: { label: string; value: string; alert?: boolean }) {
  return (
    <div className="rounded-lg bg-white p-2.5 ring-1 ring-ink-100">
      <p className="truncate text-[0.6875rem] text-ink-500">{label}</p>
      <p className={`mt-0.5 font-display text-lg font-bold tracking-tight ${alert ? "text-bad-text" : "text-ink-950"}`}>{value}</p>
    </div>
  );
}

const PREVIEWS = { condominios: CondoPreview, distribuidora: DistPreview, financeiro: FinPreview };

export function CasesGrid() {
  return (
    <section id="cases" className="scroll-mt-20 py-20 sm:py-28" aria-labelledby="cases-title">
      <Container>
        <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
          <SectionHeading
            id="cases-title"
            eyebrow="Cases"
            title="Exemplos do que consigo construir."
            lead="Três projetos completos — do processo manual ao dashboard — com dashboards interativos que você pode explorar."
          />
          <p className="max-w-sm rounded-xl border border-warn/40 bg-warn-soft/60 px-4 py-3 text-xs leading-relaxed text-warn-text lg:mb-1">
            <strong>Cases demonstrativos.</strong> As empresas são fictícias e os dados são simulados, construídos para refletir situações
            reais dessas operações. Não representam clientes reais.
          </p>
        </div>

        <div className="mt-14 grid gap-6 lg:grid-cols-3">
          {CASES.map((c, i) => {
            const Preview = PREVIEWS[c.dashboard];
            return (
              <Reveal key={c.slug} delay={i * 90} className="h-full">
                <Link
                  href={`/cases/${c.slug}`}
                  className="group flex h-full flex-col overflow-hidden rounded-2xl border border-ink-200 bg-white shadow-card transition-all duration-300 hover:border-ink-300 hover:shadow-lift motion-safe:hover:-translate-y-1"
                >
                  <div className="border-b border-ink-100 bg-ink-50 p-4">
                    <Preview />
                  </div>
                  <div className="flex flex-1 flex-col p-6">
                    <div className="flex flex-wrap items-center gap-2">
                      <DemoBadge compact />
                      <span className="text-xs font-medium text-ink-500">{c.segment}</span>
                    </div>
                    <h3 className="mt-4 text-xl font-bold leading-snug group-hover:text-brand-800">{c.cardTitle}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-ink-600">{c.cardSummary}</p>
                    <ul className="mt-5 space-y-2">
                      {c.questions.slice(0, 2).map((q) => (
                        <li key={q} className="flex gap-2 text-[0.8125rem] leading-snug text-ink-700">
                          <HelpCircle aria-hidden className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brand-600" />
                          {q}
                        </li>
                      ))}
                    </ul>
                    <span className="mt-auto inline-flex items-center gap-1.5 pt-6 text-sm font-semibold text-brand-700">
                      Ver case e dashboard
                      <ArrowUpRight aria-hidden className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                    </span>
                  </div>
                </Link>
              </Reveal>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
