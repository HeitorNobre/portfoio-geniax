import { CheckCircle2, Send } from "lucide-react";
import { condoHeadline, monthlySeries, DEFAULT_CONDO_FILTERS } from "@/data/mock/condominios";
import { dailyBriefing } from "@/data/mock/distribuidora";
import { formatBRLCompact, formatNumber, formatPct, formatPP, formatSignedPct } from "@/lib/format";

/** Mini gráfico de barras em SVG (sem biblioteca) para o hero */
function MiniBars({ values, highlightLast }: { values: number[]; highlightLast?: boolean }) {
  const max = Math.max(...values);
  const min = Math.min(...values) * 0.9;
  const w = 100 / values.length;
  return (
    <svg viewBox="0 0 100 40" preserveAspectRatio="none" className="h-24 w-full" aria-hidden>
      {[10, 20, 30].map((y) => (
        <line key={y} x1="0" x2="100" y1={y} y2={y} stroke="#E2E8F0" strokeWidth="0.4" vectorEffect="non-scaling-stroke" />
      ))}
      {values.map((v, i) => {
        const h = ((v - min) / (max - min || 1)) * 34 + 4;
        return (
          <rect
            key={i}
            x={i * w + w * 0.22}
            y={40 - h}
            width={w * 0.56}
            height={h}
            rx="0.8"
            fill={highlightLast && i === values.length - 1 ? "#1C5CAB" : "#2A78D6"}
            opacity={highlightLast && i !== values.length - 1 ? 0.78 : 1}
          />
        );
      })}
    </svg>
  );
}

export function HeroVisual() {
  const h = condoHeadline();
  const series = monthlySeries(DEFAULT_CONDO_FILTERS);
  const brief = dailyBriefing();

  return (
    <div className="relative mx-auto w-full max-w-[560px] lg:max-w-none">
      {/* Chip de rotina concluída */}
      <div className="absolute -top-4 right-3 z-20 hidden items-center gap-2 rounded-full border border-ink-200 bg-white py-1.5 pl-2 pr-3.5 text-xs font-medium text-ink-700 shadow-lift sm:flex motion-safe:animate-fade-up [animation-delay:500ms]">
        <CheckCircle2 aria-hidden className="h-4 w-4 text-good" />
        Rotina das 6h concluída · 5 fontes consolidadas
      </div>

      {/* Painel principal */}
      <figure className="relative z-10 overflow-hidden rounded-2xl border border-ink-200 bg-white shadow-float">
        <figcaption className="flex items-center justify-between gap-3 border-b border-ink-100 px-4 py-3">
          <div className="min-w-0">
            <p className="truncate text-[0.8125rem] font-semibold text-ink-950">Painel da carteira de condomínios</p>
            <p className="truncate text-[0.6875rem] text-ink-500">Case demonstrativo · dados simulados</p>
          </div>
          <span className="flex shrink-0 items-center gap-1.5 text-[0.6875rem] text-ink-500">
            <span className="h-1.5 w-1.5 rounded-full bg-good" aria-hidden />
            Atualizado hoje, 06:10
          </span>
        </figcaption>

        <div className="grid grid-cols-3 gap-2 p-3">
          {[
            { label: "Inadimplência", value: formatPct(h.k.inadAtual), sub: `${h.rising.length} em alta`, tone: "text-bad-text" },
            { label: "SLA cumprido", value: formatPct(h.k.sla, 0), sub: "meta 85%", tone: "text-warn-text" },
            { label: "Fora do SLA", value: formatNumber(h.k.abertosAtrasados), sub: `de ${h.k.abertosAgora} abertos`, tone: "text-bad-text" },
          ].map((kpi) => (
            <div key={kpi.label} className="rounded-xl border border-ink-100 bg-ink-50/60 p-2.5">
              <p className="truncate text-[0.625rem] font-medium text-ink-500 sm:text-[0.6875rem]">{kpi.label}</p>
              <p className="mt-0.5 font-display text-lg font-bold tracking-tight text-ink-950 sm:text-xl">{kpi.value}</p>
              <p className={`truncate text-[0.625rem] font-medium ${kpi.tone}`}>{kpi.sub}</p>
            </div>
          ))}
        </div>

        <div className="px-4 pb-1">
          <div className="flex items-baseline justify-between">
            <p className="text-[0.6875rem] font-semibold text-ink-700">Arrecadação mensal</p>
            <p className="text-[0.6875rem] text-ink-500">{formatBRLCompact(h.k.recebido)} em 12 meses</p>
          </div>
          <MiniBars values={series.map((s) => s.recebido)} highlightLast />
          <div className="flex justify-between text-[0.5625rem] text-ink-400" aria-hidden>
            <span>{series[0].label}</span>
            <span>{series[series.length - 1].label}</span>
          </div>
        </div>

        <div className="mt-2 border-t border-ink-100 px-4 py-3">
          <p className="mb-2 text-[0.6875rem] font-semibold text-ink-700">Inadimplência subindo</p>
          <ul className="space-y-1.5">
            {h.rising.slice(0, 3).map((r) => (
              <li key={r.condo.id} className="flex items-center justify-between gap-3 text-[0.75rem]">
                <span className="truncate text-ink-700">{r.condo.name}</span>
                <span className="flex shrink-0 items-center gap-2">
                  <span className="tabular font-semibold text-ink-900">{formatPct(r.inadAtual)}</span>
                  <span className="tabular rounded bg-bad-soft px-1.5 py-0.5 text-[0.625rem] font-semibold text-bad-text">{formatPP(r.inadAtual - r.inadAnterior)}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      </figure>

      {/* Resumo automático enviado */}
      <div className="relative z-20 mx-3 mt-3 rounded-2xl border border-ink-200 bg-white p-4 shadow-lift sm:absolute sm:-bottom-40 sm:-left-8 sm:mx-0 sm:mt-0 sm:w-[300px] motion-safe:animate-fade-up [animation-delay:800ms]">
        <div className="flex items-center gap-2">
          <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-brand-700 text-white">
            <Send aria-hidden className="h-3.5 w-3.5" />
          </span>
          <div>
            <p className="text-xs font-semibold text-ink-950">Resumo diário enviado</p>
            <p className="text-[0.6875rem] text-ink-500">Distribuidora · automático às 18:30</p>
          </div>
        </div>
        <ul className="mt-3 space-y-1.5 text-[0.75rem] text-ink-700">
          <li className="flex justify-between gap-2">
            <span>Faturamento do dia</span>
            <span className="tabular font-semibold text-ink-950">
              {formatBRLCompact(brief.faturamento)} <span className="font-normal text-ink-500">({formatSignedPct(brief.vsMedia)})</span>
            </span>
          </li>
          <li className="flex justify-between gap-2">
            <span>Entregas atrasadas</span>
            <span className="tabular font-semibold text-ink-950">
              {brief.atrasadasOntem} <span className="font-normal text-ink-500">({brief.atrasadasLeste} na Zona Leste)</span>
            </span>
          </li>
          <li className="flex justify-between gap-2">
            <span>Risco de ruptura</span>
            <span className="tabular font-semibold text-bad-text">{brief.stockAlerts.length} itens</span>
          </li>
        </ul>
      </div>
    </div>
  );
}
