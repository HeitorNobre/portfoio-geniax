"use client";

import { useMemo, useState } from "react";
import { Bar, BarChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import {
  DEFAULT_DIST_FILTERS,
  ROUTES,
  SELLERS,
  categoryMix,
  distKpis,
  distSeries,
  lateByWeekday,
  pickingProductivity,
  routeDelivery,
  sellerPerformance,
  stockPosition,
  weeklyLate,
  type DistFilters,
  type DistPeriod,
  type Route,
} from "@/data/mock/distribuidora";
import { REFERENCE_DATE, formatDateBR } from "@/data/mock/common";
import { formatAxisBRL, formatBRL, formatBRLCompact, formatDecimal, formatNumber, formatPct, formatSignedPct } from "@/lib/format";
import { CHART, axisProps, gridProps, pctAxis, yAxisProps } from "@/components/charts/theme";
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

type Tab = "comercial" | "entregas" | "estoque";

const PERIOD_LABEL: Record<DistPeriod, string> = { "30d": "últimos 30 dias", "90d": "últimos 90 dias", "12m": "últimos 12 meses" };

export default function DistribuidoraDashboard() {
  const [filters, setFilters] = useState<DistFilters>(DEFAULT_DIST_FILTERS);
  const [tab, setTab] = useState<Tab>("comercial");

  return (
    <DashboardShell
      company="Vale Norte Distribuidora"
      title="Operação comercial e logística"
      updatedAt={`${formatDateBR(REFERENCE_DATE)} 18:30`}
      filters={
        <>
          <Segmented<DistPeriod>
            label="Período"
            value={filters.period}
            onChange={(period) => setFilters((f) => ({ ...f, period }))}
            options={[
              { value: "30d", label: "30 dias" },
              { value: "90d", label: "90 dias" },
              { value: "12m", label: "12 meses" },
            ]}
          />
          <SelectFilter
            label="Vendedor"
            value={filters.sellerId}
            onChange={(sellerId) => setFilters((f) => ({ ...f, sellerId }))}
            options={[{ value: "all", label: "Todos os vendedores" }, ...SELLERS.map((s) => ({ value: s.id, label: s.name }))]}
          />
          <SelectFilter
            label="Rota"
            value={filters.route}
            onChange={(route) => setFilters((f) => ({ ...f, route: route as Route | "all" }))}
            options={[{ value: "all", label: "Todas as rotas" }, ...ROUTES.map((r) => ({ value: r, label: r }))]}
          />
        </>
      }
      tabs={
        <Tabs<Tab>
          label="Visões do painel"
          value={tab}
          onChange={setTab}
          tabs={[
            { id: "comercial", label: "Comercial" },
            { id: "entregas", label: "Entregas e operação" },
            { id: "estoque", label: "Estoque" },
          ]}
        />
      }
    >
      <div role="tabpanel" aria-label={tab}>
        {tab === "comercial" && <Commercial filters={filters} />}
        {tab === "entregas" && <Deliveries filters={filters} />}
        {tab === "estoque" && <Stock />}
      </div>
    </DashboardShell>
  );
}

const delta = (cur: number, prev?: number | null) => (prev ? formatSignedPct(cur / prev - 1) : undefined);

/* ------------------------------------------------------------------ */

function Commercial({ filters }: { filters: DistFilters }) {
  const { current: c, previous: p } = useMemo(() => distKpis(filters), [filters]);
  const series = useMemo(() => distSeries(filters), [filters]);
  const sellers = useMemo(() => sellerPerformance({ ...filters, sellerId: "all" }).sort((a, b) => b.faturamento - a.faturamento), [filters]);
  const mix = useMemo(() => categoryMix(filters), [filters]);
  const cmpLabel = filters.period === "12m" ? undefined : "vs. período anterior";

  const alerts = useMemo<AlertItem[]>(() => {
    const out: AlertItem[] = [];
    if (filters.period !== "12m") {
      sellers
        .filter((s) => s.variacao < -0.15)
        .forEach((s) =>
          out.push({
            tone: "bad",
            title: `${s.seller.name}: ${formatSignedPct(s.variacao)} no faturamento`,
            detail: `${formatBRLCompact(s.faturamento)} contra ${formatBRLCompact(s.anterior)} no período anterior · ${formatPct(s.atingimento, 0)} da meta de setembro`,
          }),
        );
    }
    sellers
      .filter((s) => s.atingimento < 0.8 && !(filters.period !== "12m" && s.variacao < -0.15))
      .forEach((s) =>
        out.push({ tone: "warn", title: `${s.seller.name} abaixo de 80% da meta do mês`, detail: `Atingimento de ${formatPct(s.atingimento, 0)} em setembro.` }),
      );
    const top = [...sellers].sort((a, b) => b.variacao - a.variacao)[0];
    if (filters.period !== "12m" && top && top.variacao > 0.08)
      out.push({ tone: "info", title: `${top.seller.name} lidera o crescimento: ${formatSignedPct(top.variacao)}`, detail: `${formatNumber(top.clientes)} clientes atendidos no período.` });
    if (!out.length) out.push({ tone: "info", title: "Sem exceções comerciais no filtro atual", detail: "Todos os vendedores dentro da faixa esperada." });
    return out;
  }, [sellers, filters.period]);

  return (
    <div className="space-y-3 sm:space-y-4">
      <div className="grid grid-cols-2 gap-2.5 lg:grid-cols-4">
        <Kpi label="Faturamento" value={formatBRLCompact(c.faturamento)} delta={delta(c.faturamento, p?.faturamento)} deltaLabel={cmpLabel} hint={filters.period === "12m" ? PERIOD_LABEL["12m"] : undefined} />
        <Kpi label="Pedidos" value={formatNumber(c.pedidos)} delta={delta(c.pedidos, p?.pedidos)} deltaLabel={cmpLabel} />
        <Kpi label="Ticket médio" value={formatBRL(c.ticket)} delta={delta(c.ticket, p?.ticket)} deltaLabel={cmpLabel} />
        <Kpi label="Clientes que compraram" value={formatNumber(c.clientes)} delta={delta(c.clientes, p?.clientes)} deltaLabel={cmpLabel} />
      </div>

      <div className="grid gap-3 sm:gap-4 lg:grid-cols-5">
        <Panel
          className="lg:col-span-3"
          title={filters.period === "12m" ? "Faturamento mensal" : "Faturamento diário"}
          question="Como as vendas estão evoluindo?"
          footer={filters.period === "12m" ? "Pico em dezembro e queda em jan/fev são sazonais." : "Segunda e sexta concentram mais pedidos; sábado opera meio período."}
        >
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={series} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid {...gridProps} />
              <XAxis dataKey="label" {...axisProps} interval="preserveStartEnd" minTickGap={16} />
              <YAxis {...yAxisProps} tickFormatter={formatAxisBRL} />
              <Tooltip
                cursor={{ fill: "rgba(148,163,184,0.12)" }}
                content={
                  <ChartTooltip
                    formatter={(v, k) => (k === "faturamento" ? formatBRL(v) : formatNumber(v))}
                    names={{ faturamento: "Faturamento" }}
                    labelFormatter={(l, pl) => (pl && "weekday" in pl ? `${pl.weekday}, ${l} · ${pl.pedidos} pedidos` : `${l} · ${formatNumber(Number(pl?.pedidos ?? 0))} pedidos`)}
                  />
                }
              />
              <Bar dataKey="faturamento" name="Faturamento" fill={CHART.series1} radius={[3, 3, 0, 0]} maxBarSize={filters.period === "12m" ? 30 : 14} />
            </BarChart>
          </ResponsiveContainer>
        </Panel>
        <Panel className="lg:col-span-2" title="Alertas comerciais" question="Quem precisa de atenção?">
          <div className="px-2 pt-1">
            <AlertList items={alerts} />
          </div>
        </Panel>
      </div>

      <Panel
        title="Desempenho por vendedor"
        question="Qual vendedor teve queda recente?"
        footer="Meta de setembro = média dos 3 meses anteriores + 5%. Marcador vertical = 100% da meta."
      >
        <DataTable caption="Desempenho por vendedor">
          <thead>
            <tr>
              <th className={th}>Vendedor</th>
              <th className={`${th} text-right`}>Faturamento</th>
              <th className={`${th} text-right`}>Variação</th>
              <th className={`${th} text-right`}>Pedidos</th>
              <th className={`${th} text-right`}>Ticket</th>
              <th className={`${th} text-right`}>Clientes</th>
              <th className={th}>Meta do mês</th>
              <th className={th}>12 meses</th>
            </tr>
          </thead>
          <tbody>
            {sellers.map((s) => {
              const highlighted = filters.sellerId === s.seller.id;
              return (
                <tr key={s.seller.id} className={highlighted ? "bg-brand-50" : "hover:bg-ink-50"}>
                  <td className={td}>
                    <p className="font-medium text-ink-900">{s.seller.name}</p>
                    <p className="text-[0.6875rem] text-ink-500">{s.seller.routes.join(" · ")}</p>
                  </td>
                  <td className={`${td} tabular text-right font-semibold`}>{formatBRLCompact(s.faturamento)}</td>
                  <td className={`${td} text-right`}>
                    {filters.period === "12m" ? (
                      "—"
                    ) : (
                      <StatusPill status={s.variacao < -0.15 ? "bad" : s.variacao < -0.05 ? "warn" : "good"}>{formatSignedPct(s.variacao)}</StatusPill>
                    )}
                  </td>
                  <td className={`${td} tabular text-right`}>{formatNumber(s.pedidos)}</td>
                  <td className={`${td} tabular text-right`}>{formatBRL(s.ticket)}</td>
                  <td className={`${td} tabular text-right`}>{formatNumber(s.clientes)}</td>
                  <td className={td}>
                    <div className="flex items-center gap-2">
                      <InlineBar value={s.atingimento} max={1.2} marker={1} color={CHART.series1} />
                      <span className={`tabular w-9 text-right font-semibold ${s.atingimento < 0.8 ? "text-bad-text" : ""}`}>{formatPct(s.atingimento, 0)}</span>
                    </div>
                  </td>
                  <td className={td}>
                    <Sparkline values={s.trend} className="h-6 w-20" color={CHART.series1} ariaLabel={`Faturamento mensal de ${s.seller.name}`} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </DataTable>
      </Panel>

      <Panel title="Faturamento por categoria" question="O que os clientes mais compram?" footer={PERIOD_LABEL[filters.period]}>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={mix} layout="vertical" margin={{ top: 4, right: 16, left: 4, bottom: 0 }}>
            <CartesianGrid {...gridProps} horizontal={false} vertical />
            <XAxis type="number" {...axisProps} tickFormatter={formatAxisBRL} />
            <YAxis type="category" dataKey="category" {...yAxisProps} width={150} />
            <Tooltip cursor={{ fill: "rgba(148,163,184,0.12)" }} content={<ChartTooltip formatter={(v) => formatBRL(v)} names={{ value: "Faturamento" }} />} />
            <Bar dataKey="value" name="Faturamento" fill={CHART.series1} radius={[0, 4, 4, 0]} maxBarSize={16} />
          </BarChart>
        </ResponsiveContainer>
      </Panel>
    </div>
  );
}

/* ------------------------------------------------------------------ */

function Deliveries({ filters }: { filters: DistFilters }) {
  const { current: c, previous: p } = useMemo(() => distKpis(filters), [filters]);
  const routes = useMemo(() => routeDelivery(filters), [filters]);
  const weekly = useMemo(() => weeklyLate(filters), [filters]);
  const weekday = useMemo(() => lateByWeekday(filters), [filters]);
  const productivity = useMemo(() => pickingProductivity(filters), [filters]);
  const avgProd = productivity.reduce((s, d) => s + d.porSeparador, 0) / Math.max(1, productivity.length);
  const onTime = 1 - c.pctAtraso;
  const routeAxis = pctAxis(routes.flatMap((r) => [r.pct, r.pctAntesJunho]));
  const weeklyAxis = pctAxis(weekly.flatMap((w) => [w.pct, w.pctOutras]));
  const weekdayAxis = pctAxis(weekday.map((w) => w.pct));

  return (
    <div className="space-y-3 sm:space-y-4">
      <div className="grid grid-cols-2 gap-2.5 lg:grid-cols-4">
        <Kpi
          label="Entregas no prazo"
          value={formatPct(onTime)}
          hint={`${formatNumber(c.entregues)} entregas · meta 93%`}
          status={onTime < 0.9 ? "bad" : onTime < 0.93 ? "warn" : "good"}
        />
        <Kpi
          label="Entregas atrasadas"
          value={formatNumber(c.atrasadas)}
          delta={p ? delta(c.atrasadas, p.atrasadas) : undefined}
          deltaLabel={p ? "vs. período anterior" : undefined}
          goodWhen="down"
        />
        <Kpi label="Atraso médio" value={`${formatDecimal(c.atrasoMedio)} dia${c.atrasoMedio >= 1.5 ? "s" : ""}`} hint="Entre as entregas atrasadas" />
        <Kpi label="Pedidos por separador/dia" value={formatDecimal(avgProd)} hint="Equipe de 6 (7 em dezembro)" />
      </div>

      <div className="grid gap-3 sm:gap-4 lg:grid-cols-2">
        <Panel
          title="Atrasos por rota"
          question="Quais rotas estão atrasando mais entregas?"
          actions={
            <Legend
              items={[
                { label: "Até mai/26", color: CHART.reference },
                { label: PERIOD_LABEL[filters.period], color: CHART.series1 },
              ]}
            />
          }
        >
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={routes} margin={{ top: 8, right: 8, left: 0, bottom: 0 }} barGap={2}>
              <CartesianGrid {...gridProps} />
              <XAxis dataKey="route" {...axisProps} />
              <YAxis {...yAxisProps} width={44} domain={routeAxis.domain} ticks={routeAxis.ticks} tickFormatter={(v) => formatPct(v, 0)} />
              <Tooltip
                cursor={{ fill: "rgba(148,163,184,0.12)" }}
                content={<ChartTooltip formatter={(v) => formatPct(v)} names={{ pctAntesJunho: "Até mai/26", pct: "Período selecionado" }} />}
              />
              <Bar dataKey="pctAntesJunho" name="Até mai/26" fill={CHART.reference} radius={[4, 4, 0, 0]} maxBarSize={22} />
              <Bar dataKey="pct" name="Período" fill={CHART.series1} radius={[4, 4, 0, 0]} maxBarSize={22} />
            </BarChart>
          </ResponsiveContainer>
        </Panel>

        <Panel
          title="% de entregas atrasadas por semana"
          question="Quando o problema da Zona Leste começou?"
          actions={
            <Legend
              items={[
                { label: "Zona Leste", color: CHART.series2 },
                { label: "Demais rotas", color: CHART.series1 },
              ]}
            />
          }
          footer="Últimas 26 semanas"
        >
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={weekly} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid {...gridProps} />
              <XAxis dataKey="label" {...axisProps} interval="preserveStartEnd" minTickGap={20} />
              <YAxis {...yAxisProps} width={44} domain={weeklyAxis.domain} ticks={weeklyAxis.ticks} tickFormatter={(v) => formatPct(v, 0)} />
              <Tooltip content={<ChartTooltip formatter={(v) => formatPct(v)} names={{ pct: "Zona Leste", pctOutras: "Demais rotas" }} labelFormatter={(l) => `Semana de ${l}`} />} />
              <Line dataKey="pctOutras" name="Demais rotas" stroke={CHART.series1} strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
              <Line dataKey="pct" name="Zona Leste" stroke={CHART.series2} strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </Panel>
      </div>

      <div className="grid gap-3 sm:gap-4 lg:grid-cols-2">
        <Panel title="Atrasos por dia da semana" question="Existe um dia com mais problema?" footer="Segunda-feira concentra o volume do fim de semana.">
          <ResponsiveContainer width="100%" height={210}>
            <BarChart data={weekday} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid {...gridProps} />
              <XAxis dataKey="label" {...axisProps} />
              <YAxis {...yAxisProps} width={44} domain={weekdayAxis.domain} ticks={weekdayAxis.ticks} tickFormatter={(v) => formatPct(v, 0)} />
              <Tooltip cursor={{ fill: "rgba(148,163,184,0.12)" }} content={<ChartTooltip formatter={(v) => formatPct(v)} names={{ pct: "Atrasadas" }} />} />
              <Bar dataKey="pct" name="Atrasadas" fill={CHART.series1} radius={[4, 4, 0, 0]} maxBarSize={32} />
            </BarChart>
          </ResponsiveContainer>
        </Panel>

        <Panel title="Produtividade da separação" question="A equipe está no limite?" footer="Pedidos separados por pessoa por dia útil.">
          <ResponsiveContainer width="100%" height={210}>
            <LineChart data={productivity} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid {...gridProps} />
              <XAxis dataKey="label" {...axisProps} interval="preserveStartEnd" minTickGap={16} />
              <YAxis {...yAxisProps} width={32} domain={["auto", "auto"]} />
              <Tooltip content={<ChartTooltip formatter={(v) => formatDecimal(v)} names={{ porSeparador: "Pedidos por separador" }} />} />
              <Line dataKey="porSeparador" name="Pedidos por separador" stroke={CHART.series1} strokeWidth={2} dot={false} activeDot={{ r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </Panel>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */

function Stock() {
  const rows = useMemo(() => stockPosition(), []);
  const risk = rows.filter((r) => r.status === "ruptura");
  const excess = rows.filter((r) => r.status === "excesso");
  const totalValue = rows.reduce((s, r) => s + r.stockValue, 0);
  const avgCoverage = rows.reduce((s, r) => s + r.coverage * r.stockValue, 0) / Math.max(1, totalValue);

  const statusMap = {
    ruptura: { s: "bad" as const, label: "Risco de ruptura" },
    atencao: { s: "warn" as const, label: "Atenção" },
    ok: { s: "good" as const, label: "Adequado" },
    excesso: { s: "neutral" as const, label: "Excesso" },
  };

  return (
    <div className="space-y-3 sm:space-y-4">
      <div className="grid grid-cols-2 gap-2.5 lg:grid-cols-4">
        <Kpi label="Itens com risco de ruptura" value={formatNumber(risk.length)} hint="Cobertura menor que 7 dias" status={risk.length ? "bad" : "good"} />
        <Kpi label="Cobertura média" value={`${formatNumber(avgCoverage)} dias`} hint="Ponderada pelo valor em estoque" />
        <Kpi label="Valor em estoque" value={formatBRLCompact(totalValue)} hint="Itens monitorados" />
        <Kpi label="Itens em excesso" value={formatNumber(excess.length)} hint="Cobertura acima de 60 dias" status={excess.length ? "warn" : "good"} />
      </div>
      <Panel
        title="Cobertura de estoque por item"
        question="Quais produtos correm risco de faltar nos próximos dias?"
        footer="Cobertura = estoque atual ÷ venda média diária dos últimos 30 dias. Marcador = 7 dias (ponto de recompra). A posição de estoque é da empresa toda e não varia com os filtros."
      >
        <DataTable caption="Cobertura de estoque por item">
          <thead>
            <tr>
              <th className={th}>Produto</th>
              <th className={th}>Categoria</th>
              <th className={`${th} text-right`}>Estoque</th>
              <th className={`${th} text-right`}>Venda/dia</th>
              <th className={th}>Cobertura</th>
              <th className={th}>Status</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.sku} className="hover:bg-ink-50">
                <td className={td}>
                  <p className="font-medium text-ink-900">{r.name}</p>
                  <p className="text-[0.6875rem] text-ink-500">{r.sku}</p>
                </td>
                <td className={`${td} text-ink-600`}>{r.category}</td>
                <td className={`${td} tabular text-right`}>{formatNumber(r.stock)} un.</td>
                <td className={`${td} tabular text-right`}>{formatNumber(r.dailyUnits)}</td>
                <td className={td}>
                  <div className="flex items-center gap-2">
                    <InlineBar value={Math.min(r.coverage, 60)} max={60} marker={7} color={CHART.series1} />
                    <span className="tabular w-14 text-right font-semibold">{formatNumber(r.coverage)} dias</span>
                  </div>
                </td>
                <td className={td}>
                  <StatusPill status={statusMap[r.status].s}>{statusMap[r.status].label}</StatusPill>
                </td>
              </tr>
            ))}
          </tbody>
        </DataTable>
      </Panel>
    </div>
  );
}
