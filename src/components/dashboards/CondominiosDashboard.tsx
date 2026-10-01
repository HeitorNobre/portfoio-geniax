"use client";

import { useMemo, useState } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  ComposedChart,
  Line,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  DEFAULT_CONDO_FILTERS,
  MONTHS,
  REGIONS,
  categoryBudget,
  condoData,
  condoRanking,
  kpis,
  monthlySeries,
  openTicketsLate,
  supplierRecentSla,
  supplierStats,
  ticketsByCategory,
  type CondoFilters,
  type Region,
} from "@/data/mock/condominios";
import { REFERENCE_DATE, formatDateBR } from "@/data/mock/common";
import { formatAxisBRL, formatBRL, formatBRLCompact, formatHours, formatNumber, formatPct, formatPP } from "@/lib/format";
import { CHART, axisProps, gridProps, yAxisProps } from "@/components/charts/theme";
import { ChartTooltip } from "@/components/charts/ChartTooltip";
import { Sparkline } from "@/components/charts/Sparkline";
import {
  AlertList,
  DashboardShell,
  DataTable,
  InlineBar,
  Kpi,
  Legend,
  Panel,
  Segmented,
  SelectFilter,
  StatusPill,
  Tabs,
  td,
  th,
  type AlertItem,
} from "@/components/dashboard/primitives";

type Tab = "geral" | "financeiro" | "chamados" | "fornecedores";
const SLA_TARGET = 0.85;
const INAD_TARGET = 0.05;

export default function CondominiosDashboard() {
  const [filters, setFilters] = useState<CondoFilters>(DEFAULT_CONDO_FILTERS);
  const [tab, setTab] = useState<Tab>("geral");

  const condoOptions = useMemo(
    () =>
      condoData.condos
        .filter((c) => filters.region === "all" || c.region === filters.region)
        .sort((a, b) => a.name.localeCompare(b.name, "pt-BR")),
    [filters.region],
  );

  const setRegion = (region: Region | "all") =>
    setFilters((f) => ({
      ...f,
      region,
      condoId: f.condoId !== "all" && region !== "all" && condoData.condos.find((c) => c.id === f.condoId)?.region !== region ? "all" : f.condoId,
    }));

  return (
    <DashboardShell
      company="Solar Gestão Condominial"
      title="Painel da carteira de condomínios"
      updatedAt={`${formatDateBR(REFERENCE_DATE)} 06:10`}
      filters={
        <>
          <Segmented
            label="Período"
            value={filters.period}
            onChange={(period) => setFilters((f) => ({ ...f, period }))}
            options={[
              { value: 3, label: "3 meses" },
              { value: 6, label: "6 meses" },
              { value: 12, label: "12 meses" },
            ]}
          />
          <SelectFilter
            label="Região"
            value={filters.region}
            onChange={setRegion}
            options={[{ value: "all", label: "Todas as regiões" }, ...REGIONS.map((r) => ({ value: r, label: r }))]}
          />
          <SelectFilter
            label="Condomínio"
            className="min-w-[13rem] flex-1 sm:flex-none"
            value={filters.condoId}
            onChange={(condoId) => setFilters((f) => ({ ...f, condoId }))}
            options={[{ value: "all", label: "Todos os condomínios" }, ...condoOptions.map((c) => ({ value: c.id, label: c.name }))]}
          />
        </>
      }
      tabs={
        <Tabs<Tab>
          label="Visões do painel"
          value={tab}
          onChange={setTab}
          tabs={[
            { id: "geral", label: "Visão geral" },
            { id: "financeiro", label: "Financeiro" },
            { id: "chamados", label: "Chamados e SLA" },
            { id: "fornecedores", label: "Fornecedores" },
          ]}
        />
      }
    >
      <div role="tabpanel" aria-label={tab}>
        {tab === "geral" && <Overview filters={filters} />}
        {tab === "financeiro" && <Finance filters={filters} />}
        {tab === "chamados" && <Tickets filters={filters} />}
        {tab === "fornecedores" && <Suppliers filters={filters} />}
      </div>
    </DashboardShell>
  );
}

/* ------------------------------------------------------------------ */

function useData(filters: CondoFilters) {
  return useMemo(
    () => ({
      k: kpis(filters),
      series: monthlySeries(filters),
      ranking: condoRanking(filters),
    }),
    [filters],
  );
}

function periodLabel(period: number) {
  return `últimos ${period} meses`;
}

function Overview({ filters }: { filters: CondoFilters }) {
  const { k, series, ranking } = useData(filters);
  const suppliers = useMemo(() => supplierStats(filters), [filters]);
  const execucao = k.orcado ? k.realizado / k.orcado : 0;

  const alerts = useMemo<AlertItem[]>(() => {
    const out: AlertItem[] = [];
    const rising = ranking.filter((r) => r.mesesEmAlta >= 3 && r.inadAtual > 0.07).sort((a, b) => b.inadAtual - a.inadAtual);
    if (rising.length)
      out.push({
        tone: "bad",
        title: `${rising.length} ${rising.length === 1 ? "condomínio" : "condomínios"} com inadimplência em alta há 3+ meses`,
        detail: rising
          .slice(0, 3)
          .map((r) => `${r.condo.name} (${formatPct(r.inadAtual)})`)
          .join(" · "),
      });
    const slaBad = suppliers.filter((s) => s.encerrados >= 5 && s.slaPct < 0.6).sort((a, b) => a.slaPct - b.slaPct);
    slaBad.slice(0, 1).forEach((s) =>
      out.push({
        tone: "bad",
        title: `${s.supplier.name} com ${formatPct(s.slaPct, 0)} dos chamados no prazo`,
        detail: `${formatNumber(s.chamados)} chamados no período · ${s.abertosAtrasados} abertos fora do SLA agora`,
      }),
    );
    const worsening = suppliers
      .filter((s) => s.encerrados >= 5)
      .map((s) => ({ s, d: supplierRecentSla(s.supplier.id).recent - s.slaAnterior }))
      .filter((x) => x.d < -0.08)
      .sort((a, b) => a.d - b.d)[0];
    if (worsening)
      out.push({
        tone: "warn",
        title: `${worsening.s.supplier.name}: SLA caiu ${formatPP(worsening.d).replace("−", "")} no trimestre`,
        detail: "Queda consistente nos últimos 3 meses em relação ao trimestre anterior.",
      });
    const over = ranking.filter((r) => r.desvio > 0.05).sort((a, b) => b.desvio - a.desvio);
    if (over.length)
      out.push({
        tone: "warn",
        title: `${over.length} ${over.length === 1 ? "condomínio" : "condomínios"} acima de 5% do orçamento`,
        detail: over
          .slice(0, 2)
          .map((r) => `${r.condo.name} (+${formatPct(r.desvio)})`)
          .join(" · "),
      });
    if (!out.length) out.push({ tone: "info", title: "Nenhuma exceção relevante no filtro atual", detail: "Indicadores dentro dos limites definidos." });
    return out;
  }, [ranking, suppliers]);

  const rising = [...ranking].sort((a, b) => b.inadAtual - b.inadAnterior - (a.inadAtual - a.inadAnterior)).slice(0, 5);

  return (
    <div className="space-y-3 sm:space-y-4">
      <div className="grid grid-cols-2 gap-2.5 md:grid-cols-3 xl:grid-cols-6">
        <Kpi label="Arrecadação" value={formatBRLCompact(k.recebido)} hint={`${formatPct(k.previsto ? k.recebido / k.previsto : 0)} do previsto · ${periodLabel(filters.period)}`} />
        <Kpi
          label="Inadimplência (mês atual)"
          value={formatPct(k.inadAtual)}
          delta={formatPP(k.inadVar)}
          deltaLabel="vs. 3 meses atrás"
          goodWhen="down"
          status={k.inadAtual > 0.08 ? "bad" : k.inadAtual > INAD_TARGET ? "warn" : "good"}
        />
        <Kpi label="Despesa realizada" value={formatBRLCompact(k.realizado)} hint={`Orçado: ${formatBRLCompact(k.orcado)}`} />
        <Kpi
          label="Execução do orçamento"
          value={formatPct(execucao)}
          hint="Realizado ÷ orçado"
          status={execucao > 1.05 ? "bad" : execucao > 1.0 ? "warn" : "good"}
        />
        <Kpi
          label="Chamados abertos agora"
          value={formatNumber(k.abertosAgora)}
          hint={`${k.abertosAtrasados} fora do SLA`}
          status={k.abertosAtrasados > 10 ? "bad" : k.abertosAtrasados > 0 ? "warn" : "good"}
        />
        <Kpi
          label="Chamados no prazo"
          value={formatPct(k.sla)}
          hint={`Meta: ${formatPct(SLA_TARGET, 0)} · TMA ${formatHours(k.tma)}`}
          status={k.sla < 0.75 ? "bad" : k.sla < SLA_TARGET ? "warn" : "good"}
        />
      </div>

      <div className="grid gap-3 sm:gap-4 lg:grid-cols-5">
        <Panel
          className="lg:col-span-3"
          title="Arrecadação x despesa"
          question="A carteira está gerando caixa suficiente para as despesas?"
          actions={
            <Legend
              items={[
                { label: "Arrecadado", color: CHART.series1 },
                { label: "Despesa realizada", color: CHART.series2 },
              ]}
            />
          }
        >
          <ResponsiveContainer width="100%" height={250}>
            <ComposedChart data={series} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid {...gridProps} />
              <XAxis dataKey="label" {...axisProps} />
              <YAxis {...yAxisProps} tickFormatter={formatAxisBRL} />
              <Tooltip
                cursor={{ fill: "rgba(148,163,184,0.12)" }}
                content={<ChartTooltip formatter={(v) => formatBRL(v)} names={{ recebido: "Arrecadado", realizado: "Despesa realizada" }} />}
              />
              <Bar dataKey="recebido" name="Arrecadado" fill={CHART.series1} radius={[4, 4, 0, 0]} maxBarSize={28} />
              <Line dataKey="realizado" name="Despesa realizada" stroke={CHART.series2} strokeWidth={2} dot={{ r: 3, fill: CHART.series2, stroke: "#fff", strokeWidth: 1.5 }} activeDot={{ r: 5 }} />
            </ComposedChart>
          </ResponsiveContainer>
        </Panel>

        <Panel className="lg:col-span-2" title="Alertas automáticos" question="O que precisa de atenção agora?">
          <div className="px-2 pt-1">
            <AlertList items={alerts} />
          </div>
        </Panel>
      </div>

      <div className="grid gap-3 sm:gap-4 lg:grid-cols-5">
        <Panel className="lg:col-span-2" title="Inadimplência mensal" question="A inadimplência está subindo ou caindo?" footer="Linha tracejada: referência de 5%. Picos em jan/fev são sazonais.">
          <ResponsiveContainer width="100%" height={210}>
            <AreaChart data={series} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="inadFill" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor={CHART.series1} stopOpacity={0.25} />
                  <stop offset="100%" stopColor={CHART.series1} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid {...gridProps} />
              <XAxis dataKey="label" {...axisProps} />
              <YAxis {...yAxisProps} width={40} tickFormatter={(v) => formatPct(v, 0)} domain={[0, "auto"]} />
              <Tooltip content={<ChartTooltip formatter={(v) => formatPct(v)} names={{ inad: "Inadimplência" }} />} />
              <ReferenceLine y={INAD_TARGET} stroke={CHART.referenceStrong} strokeDasharray="4 4" />
              <Area dataKey="inad" name="Inadimplência" stroke={CHART.series1} strokeWidth={2} fill="url(#inadFill)" dot={false} activeDot={{ r: 5 }} />
            </AreaChart>
          </ResponsiveContainer>
        </Panel>

        <Panel className="lg:col-span-3" title="Onde a inadimplência mais subiu" question="Quais condomínios estão aumentando a inadimplência?" footer="Comparação: média dos últimos 3 meses vs. 3 meses anteriores.">
          <DataTable caption="Condomínios com maior aumento de inadimplência">
            <thead>
              <tr>
                <th className={th}>Condomínio</th>
                <th className={`${th} text-right`}>Atual</th>
                <th className={`${th} text-right`}>Variação</th>
                <th className={th}>12 meses</th>
              </tr>
            </thead>
            <tbody>
              {rising.map((r) => {
                const d = r.inadAtual - r.inadAnterior;
                return (
                  <tr key={r.condo.id} className="hover:bg-ink-50">
                    <td className={td}>
                      <p className="font-medium text-ink-900">{r.condo.name}</p>
                      <p className="text-[0.6875rem] text-ink-500">
                        {r.condo.region} · {r.condo.units} unid.
                      </p>
                    </td>
                    <td className={`${td} tabular text-right font-semibold`}>{formatPct(r.inadAtual)}</td>
                    <td className={`${td} text-right`}>
                      <StatusPill status={d > 0.015 ? "bad" : d > 0.005 ? "warn" : "good"}>{formatPP(d)}</StatusPill>
                    </td>
                    <td className={td}>
                      <Sparkline values={r.inadTrend} color={CHART.series1} ariaLabel={`Tendência de inadimplência de ${r.condo.name}`} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </DataTable>
        </Panel>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */

function Finance({ filters }: { filters: CondoFilters }) {
  const { ranking } = useData(filters);
  const budget = useMemo(() => categoryBudget(filters), [filters]);
  const byDeviation = [...ranking].sort((a, b) => b.desvio - a.desvio).slice(0, 8);
  const bySpend = [...ranking]
    .sort((a, b) => b.realizado - a.realizado)
    .slice(0, 10)
    .map((r) => ({ name: r.condo.name.replace(/^(Residencial|Edifício|Condomínio) /, ""), full: r.condo.name, realizado: r.realizado }));
  const inadRank = [...ranking].sort((a, b) => b.inadAtual - a.inadAtual);

  return (
    <div className="space-y-3 sm:space-y-4">
      <div className="grid gap-3 sm:gap-4 lg:grid-cols-2">
        <Panel
          title="Orçado x realizado por categoria"
          question="Em quais categorias a despesa passou do orçamento?"
          actions={
            <Legend
              items={[
                { label: "Orçado", color: CHART.reference },
                { label: "Realizado", color: CHART.series1 },
              ]}
            />
          }
        >
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={budget} layout="vertical" margin={{ top: 4, right: 12, left: 4, bottom: 0 }} barGap={2}>
              <CartesianGrid {...gridProps} horizontal={false} vertical />
              <XAxis type="number" {...axisProps} tickFormatter={formatAxisBRL} />
              <YAxis type="category" dataKey="label" {...yAxisProps} width={128} tick={{ fill: CHART.tick, fontSize: 11 }} />
              <Tooltip
                cursor={{ fill: "rgba(148,163,184,0.12)" }}
                content={
                  <ChartTooltip
                    formatter={(v) => formatBRL(v)}
                    names={{ orcado: "Orçado", realizado: "Realizado" }}
                    labelFormatter={(l, p) => `${l} · ${p && typeof p.desvio === "number" ? (p.desvio >= 0 ? "+" : "") + formatPct(p.desvio) : ""}`}
                  />
                }
              />
              <Bar dataKey="orcado" name="Orçado" fill={CHART.reference} radius={[0, 4, 4, 0]} maxBarSize={10} />
              <Bar dataKey="realizado" name="Realizado" fill={CHART.series1} radius={[0, 4, 4, 0]} maxBarSize={10} />
            </BarChart>
          </ResponsiveContainer>
        </Panel>

        <Panel title="Maiores desvios de orçamento" question="Quais condomínios estão gastando acima do aprovado?">
          <DataTable caption="Condomínios com maior desvio de orçamento">
            <thead>
              <tr>
                <th className={th}>Condomínio</th>
                <th className={`${th} text-right`}>Orçado</th>
                <th className={`${th} text-right`}>Realizado</th>
                <th className={`${th} text-right`}>Desvio</th>
              </tr>
            </thead>
            <tbody>
              {byDeviation.map((r) => (
                <tr key={r.condo.id} className="hover:bg-ink-50">
                  <td className={`${td} font-medium text-ink-900`}>{r.condo.name}</td>
                  <td className={`${td} tabular text-right`}>{formatBRLCompact(r.orcado)}</td>
                  <td className={`${td} tabular text-right`}>{formatBRLCompact(r.realizado)}</td>
                  <td className={`${td} text-right`}>
                    <StatusPill status={r.desvio > 0.05 ? "bad" : r.desvio > 0.01 ? "warn" : "good"}>
                      {r.desvio >= 0 ? "+" : "−"}
                      {formatPct(Math.abs(r.desvio))}
                    </StatusPill>
                  </td>
                </tr>
              ))}
            </tbody>
          </DataTable>
        </Panel>
      </div>

      <div className="grid gap-3 sm:gap-4 lg:grid-cols-2">
        <Panel title="Gastos por condomínio" question="Quais condomínios concentram a despesa?" footer={`Top 10 · ${periodLabel(filters.period)}`}>
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={bySpend} layout="vertical" margin={{ top: 4, right: 12, left: 4, bottom: 0 }}>
              <CartesianGrid {...gridProps} horizontal={false} vertical />
              <XAxis type="number" {...axisProps} tickFormatter={formatAxisBRL} />
              <YAxis type="category" dataKey="name" {...yAxisProps} width={140} />
              <Tooltip
                cursor={{ fill: "rgba(148,163,184,0.12)" }}
                content={<ChartTooltip formatter={(v) => formatBRL(v)} names={{ realizado: "Despesa" }} labelFormatter={(_, p) => String(p?.full ?? "")} />}
              />
              <Bar dataKey="realizado" name="Despesa" fill={CHART.series1} radius={[0, 4, 4, 0]} maxBarSize={14} />
            </BarChart>
          </ResponsiveContainer>
        </Panel>

        <Panel title="Ranking de inadimplência" question="Como cada condomínio está hoje?" footer="Média dos últimos 3 meses · ordenado do maior para o menor">
          <div className="scrollbar-thin max-h-[320px] overflow-y-auto">
            <DataTable caption="Ranking de inadimplência por condomínio">
              <thead className="sticky top-0 z-10 bg-white">
                <tr>
                  <th className={th}>Condomínio</th>
                  <th className={`${th} text-right`}>Inadimpl.</th>
                  <th className={`${th} text-right`}>Var.</th>
                  <th className={th}>Tendência</th>
                </tr>
              </thead>
              <tbody>
                {inadRank.map((r) => (
                  <tr key={r.condo.id} className="hover:bg-ink-50">
                    <td className={`${td} font-medium text-ink-900`}>{r.condo.name}</td>
                    <td className={`${td} tabular text-right font-semibold`}>{formatPct(r.inadAtual)}</td>
                    <td className={`${td} tabular text-right text-ink-600`}>{formatPP(r.inadAtual - r.inadAnterior)}</td>
                    <td className={td}>
                      <Sparkline values={r.inadTrend} className="h-6 w-20" color={CHART.series1} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </DataTable>
          </div>
        </Panel>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */

function Tickets({ filters }: { filters: CondoFilters }) {
  const { k, series } = useData(filters);
  const cats = useMemo(() => ticketsByCategory(filters), [filters]);
  const late = useMemo(() => openTicketsLate(filters, 8), [filters]);

  return (
    <div className="space-y-3 sm:space-y-4">
      <div className="grid grid-cols-2 gap-2.5 md:grid-cols-4">
        <Kpi label="Chamados abertos no período" value={formatNumber(k.abertosNoPeriodo)} hint={periodLabel(filters.period)} />
        <Kpi label="Encerrados" value={formatNumber(k.encerrados)} hint={`${formatPct(k.abertosNoPeriodo ? k.encerrados / k.abertosNoPeriodo : 0)} dos abertos`} />
        <Kpi label="Tempo médio de atendimento" value={formatHours(k.tma)} hint="Da abertura ao encerramento" />
        <Kpi
          label="Abertos fora do SLA agora"
          value={formatNumber(k.abertosAtrasados)}
          hint={`de ${k.abertosAgora} chamados em aberto`}
          status={k.abertosAtrasados > 10 ? "bad" : k.abertosAtrasados > 0 ? "warn" : "good"}
        />
      </div>

      <div className="grid gap-3 sm:gap-4 lg:grid-cols-2">
        <Panel
          title="Chamados abertos x encerrados"
          question="A equipe está dando conta da demanda?"
          actions={
            <Legend
              items={[
                { label: "Abertos", color: CHART.series1 },
                { label: "Encerrados", color: CHART.series3 },
              ]}
            />
          }
        >
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={series} margin={{ top: 8, right: 8, left: 0, bottom: 0 }} barGap={2}>
              <CartesianGrid {...gridProps} />
              <XAxis dataKey="label" {...axisProps} />
              <YAxis {...yAxisProps} width={36} />
              <Tooltip cursor={{ fill: "rgba(148,163,184,0.12)" }} content={<ChartTooltip names={{ abertos: "Abertos", encerrados: "Encerrados" }} />} />
              <Bar dataKey="abertos" name="Abertos" fill={CHART.series1} radius={[4, 4, 0, 0]} maxBarSize={16} />
              <Bar dataKey="encerrados" name="Encerrados" fill={CHART.series3} radius={[4, 4, 0, 0]} maxBarSize={16} />
            </BarChart>
          </ResponsiveContainer>
        </Panel>

        <Panel title="Chamados atendidos no prazo (mensal)" question="O SLA está melhorando ou piorando?" footer={`Linha tracejada: meta de ${formatPct(SLA_TARGET, 0)}`}>
          <ResponsiveContainer width="100%" height={240}>
            <AreaChart data={series} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="slaFill" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor={CHART.series1} stopOpacity={0.22} />
                  <stop offset="100%" stopColor={CHART.series1} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid {...gridProps} />
              <XAxis dataKey="label" {...axisProps} />
              <YAxis {...yAxisProps} width={40} domain={[0.5, 1]} tickFormatter={(v) => formatPct(v, 0)} />
              <Tooltip content={<ChartTooltip formatter={(v) => formatPct(v)} names={{ sla: "No prazo" }} />} />
              <ReferenceLine y={SLA_TARGET} stroke={CHART.referenceStrong} strokeDasharray="4 4" />
              <Area dataKey="sla" name="No prazo" stroke={CHART.series1} strokeWidth={2} fill="url(#slaFill)" activeDot={{ r: 5 }} />
            </AreaChart>
          </ResponsiveContainer>
        </Panel>
      </div>

      <div className="grid gap-3 sm:gap-4 lg:grid-cols-2">
        <Panel title="SLA por categoria" question="Em quais tipos de chamado o prazo mais estoura?" footer={`Marcador vertical: meta de ${formatPct(SLA_TARGET, 0)}`}>
          <DataTable caption="SLA por categoria de chamado">
            <thead>
              <tr>
                <th className={th}>Categoria</th>
                <th className={`${th} text-right`}>Prazo</th>
                <th className={`${th} text-right`}>Chamados</th>
                <th className={`${th} text-right`}>TMA</th>
                <th className={th}>No prazo</th>
              </tr>
            </thead>
            <tbody>
              {[...cats]
                .sort((a, b) => a.slaPct - b.slaPct)
                .map((c) => (
                  <tr key={c.id} className="hover:bg-ink-50">
                    <td className={`${td} font-medium text-ink-900`}>{c.label}</td>
                    <td className={`${td} tabular text-right text-ink-600`}>{c.slaHours} h</td>
                    <td className={`${td} tabular text-right`}>{formatNumber(c.total)}</td>
                    <td className={`${td} tabular text-right`}>{formatHours(c.tma)}</td>
                    <td className={td}>
                      <div className="flex items-center gap-2">
                        <InlineBar value={c.slaPct} max={1} marker={SLA_TARGET} color={CHART.series1} />
                        <span className="tabular w-9 text-right font-semibold">{formatPct(c.slaPct, 0)}</span>
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </DataTable>
        </Panel>

        <Panel title="Chamados abertos fora do prazo" question="Quais chamados precisam de cobrança hoje?">
          {late.length ? (
            <DataTable caption="Chamados abertos fora do SLA">
              <thead>
                <tr>
                  <th className={th}>Chamado</th>
                  <th className={th}>Fornecedor</th>
                  <th className={`${th} text-right`}>Aberto há</th>
                </tr>
              </thead>
              <tbody>
                {late.map((t) => (
                  <tr key={t.id} className="hover:bg-ink-50">
                    <td className={td}>
                      <p className="font-medium text-ink-900">
                        #{t.id} · {t.categoryLabel}
                      </p>
                      <p className="max-w-[14rem] truncate text-[0.6875rem] text-ink-500">{t.condo.name}</p>
                    </td>
                    <td className={`${td} text-ink-700`}>{t.supplier.name}</td>
                    <td className={`${td} text-right`}>
                      <StatusPill status={t.hours > t.slaHours * 3 ? "bad" : "warn"}>{formatHours(t.hours)}</StatusPill>
                      <p className="mt-0.5 text-[0.6875rem] text-ink-500">prazo {t.slaHours} h</p>
                    </td>
                  </tr>
                ))}
              </tbody>
            </DataTable>
          ) : (
            <p className="px-2 py-6 text-center text-xs text-ink-500">Nenhum chamado aberto fora do prazo neste filtro.</p>
          )}
        </Panel>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */

function Suppliers({ filters }: { filters: CondoFilters }) {
  const rows = useMemo(() => supplierStats(filters), [filters]);
  const ids = useMemo(() => new Set(condoData.condos.filter((c) => (filters.region === "all" || c.region === filters.region) && (filters.condoId === "all" || c.id === filters.condoId)).map((c) => c.id)), [filters]);
  const withTickets = rows.filter((r) => r.chamados > 0).sort((a, b) => a.slaPct - b.slaPct);
  const spend = [...rows]
    .filter((r) => r.gasto > 0)
    .sort((a, b) => b.gasto - a.gasto)
    .map((r) => ({ name: r.supplier.name, gasto: r.gasto }));

  return (
    <div className="space-y-3 sm:space-y-4">
      <Panel
        title="Desempenho de fornecedores"
        question="Quais fornecedores estão quebrando o SLA?"
        footer={`Tendência: % no prazo nos últimos 3 meses vs. trimestre anterior · dados até ${MONTHS[MONTHS.length - 1].label}`}
      >
        <DataTable caption="Desempenho de fornecedores">
          <thead>
            <tr>
              <th className={th}>Fornecedor</th>
              <th className={`${th} text-right`}>Condomínios</th>
              <th className={`${th} text-right`}>Chamados</th>
              <th className={th}>No prazo</th>
              <th className={`${th} text-right`}>Tendência</th>
              <th className={`${th} text-right`}>TMA</th>
              <th className={`${th} text-right`}>Atrasados agora</th>
            </tr>
          </thead>
          <tbody>
            {withTickets.map((r) => {
              const recent = supplierRecentSla(r.supplier.id, ids);
              const d = recent.recent - recent.before;
              return (
                <tr key={r.supplier.id} className="hover:bg-ink-50">
                  <td className={td}>
                    <p className="font-medium text-ink-900">{r.supplier.name}</p>
                    <p className="text-[0.6875rem] text-ink-500">{r.supplier.segment}</p>
                  </td>
                  <td className={`${td} tabular text-right`}>{r.condos || "—"}</td>
                  <td className={`${td} tabular text-right`}>{formatNumber(r.chamados)}</td>
                  <td className={td}>
                    <div className="flex items-center gap-2">
                      <InlineBar value={r.slaPct} max={1} marker={SLA_TARGET} color={CHART.series1} />
                      <span className="tabular w-9 text-right font-semibold">{formatPct(r.slaPct, 0)}</span>
                      {r.slaPct < 0.6 && <StatusPill status="bad">Crítico</StatusPill>}
                    </div>
                  </td>
                  <td className={`${td} text-right`}>
                    {recent.before > 0 ? <StatusPill status={d < -0.08 ? "bad" : d < -0.03 ? "warn" : "good"}>{formatPP(d)}</StatusPill> : "—"}
                  </td>
                  <td className={`${td} tabular text-right`}>{formatHours(r.tma)}</td>
                  <td className={`${td} tabular text-right font-semibold ${r.abertosAtrasados ? "text-bad-text" : "text-ink-400"}`}>{r.abertosAtrasados}</td>
                </tr>
              );
            })}
          </tbody>
        </DataTable>
      </Panel>

      <Panel title="Gastos por fornecedor" question="Para quem vai o dinheiro dos condomínios?" footer={`${periodLabel(filters.period)} · inclui contratos fixos e serviços avulsos`}>
        <ResponsiveContainer width="100%" height={Math.max(220, spend.length * 28)}>
          <BarChart data={spend} layout="vertical" margin={{ top: 4, right: 16, left: 4, bottom: 0 }}>
            <CartesianGrid {...gridProps} horizontal={false} vertical />
            <XAxis type="number" {...axisProps} tickFormatter={formatAxisBRL} />
            <YAxis type="category" dataKey="name" {...yAxisProps} width={170} />
            <Tooltip cursor={{ fill: "rgba(148,163,184,0.12)" }} content={<ChartTooltip formatter={(v) => formatBRL(v)} names={{ gasto: "Gasto" }} />} />
            <Bar dataKey="gasto" name="Gasto" fill={CHART.series1} radius={[0, 4, 4, 0]} maxBarSize={14} />
          </BarChart>
        </ResponsiveContainer>
      </Panel>
    </div>
  );
}
