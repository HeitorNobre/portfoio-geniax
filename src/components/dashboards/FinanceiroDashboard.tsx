"use client";

import { useMemo, useState } from "react";
import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import {
  DEFAULT_FIN_FILTERS,
  PROFILE_LABEL,
  SEGMENTS,
  aging,
  collectionQueue,
  finKpis,
  forecast,
  monthlyEvolution,
  segmentExposure,
  topDebtors,
  upcomingRisk,
  upcomingRiskyTitles,
  type FinFilters,
  type PayProfile,
  type Segment,
} from "@/data/mock/financeiro";
import { REFERENCE_DATE, formatDateBR } from "@/data/mock/common";
import { formatAxisBRL, formatBRL, formatBRLCompact, formatNumber, formatPct } from "@/lib/format";
import { CHART, axisProps, gridProps, yAxisProps } from "@/components/charts/theme";
import { ChartTooltip } from "@/components/charts/ChartTooltip";
import {
  AlertList,
  DashboardShell,
  DataTable,
  Kpi,
  Legend,
  Panel,
  SelectFilter,
  StatusPill,
  Tabs,
  td,
  th,
  type AlertItem,
} from "@/components/dashboard/primitives";

type Tab = "carteira" | "aging" | "previsao";

/** Rampa ordinal de laranja para faixas de atraso (claro → escuro) */
const AGING_COLORS: Record<string, string> = {
  av60: "#86B6EF",
  av30: CHART.series1,
  v15: "#F4A582",
  v30: "#EF8A5E",
  v60: CHART.series2,
  v90: "#C4501F",
  v90p: "#8F3814",
};

export default function FinanceiroDashboard() {
  const [filters, setFilters] = useState<FinFilters>(DEFAULT_FIN_FILTERS);
  const [tab, setTab] = useState<Tab>("carteira");

  return (
    <DashboardShell
      company="Serrano Facilities"
      title="Contas a receber e cobrança"
      updatedAt={`${formatDateBR(REFERENCE_DATE)} 07:05`}
      filters={
        <>
          <SelectFilter
            label="Segmento"
            value={filters.segment}
            onChange={(segment) => setFilters((f) => ({ ...f, segment: segment as Segment | "all" }))}
            options={[{ value: "all", label: "Todos os segmentos" }, ...SEGMENTS.map((s) => ({ value: s, label: s }))]}
          />
          <SelectFilter
            label="Perfil de pagamento"
            value={filters.profile}
            onChange={(profile) => setFilters((f) => ({ ...f, profile: profile as PayProfile | "all" }))}
            options={[
              { value: "all", label: "Todos os perfis" },
              ...(Object.keys(PROFILE_LABEL) as PayProfile[]).map((p) => ({ value: p, label: PROFILE_LABEL[p] })),
            ]}
          />
        </>
      }
      tabs={
        <Tabs<Tab>
          label="Visões do painel"
          value={tab}
          onChange={setTab}
          tabs={[
            { id: "carteira", label: "Carteira" },
            { id: "aging", label: "Aging e cobrança" },
            { id: "previsao", label: "Previsão de recebimento" },
          ]}
        />
      }
    >
      <div role="tabpanel" aria-label={tab}>
        {tab === "carteira" && <Portfolio filters={filters} />}
        {tab === "aging" && <Aging filters={filters} />}
        {tab === "previsao" && <Forecast filters={filters} />}
      </div>
    </DashboardShell>
  );
}

/* ------------------------------------------------------------------ */

function Portfolio({ filters }: { filters: FinFilters }) {
  const k = useMemo(() => finKpis(filters), [filters]);
  const evo = useMemo(() => monthlyEvolution(filters), [filters]);
  const segments = useMemo(() => segmentExposure(filters), [filters]);
  const risk = useMemo(() => upcomingRisk(filters), [filters]);
  const debtors = useMemo(() => topDebtors(filters, 5), [filters]);

  const alerts = useMemo<AlertItem[]>(() => {
    const out: AlertItem[] = [];
    const top5 = debtors.reduce((s, d) => s + d.vencido, 0);
    if (k.vencido > 0)
      out.push({
        tone: "bad",
        title: `${formatBRLCompact(k.vencidoMais30)} vencidos há mais de 30 dias`,
        detail: `${formatPct(k.vencido ? k.vencidoMais30 / k.vencido : 0, 0)} do vencido total · os 5 maiores devedores somam ${formatBRLCompact(top5)}`,
      });
    if (risk.risky)
      out.push({
        tone: "warn",
        title: `${risk.risky} títulos vencem em 7 dias de clientes que costumam atrasar`,
        detail: `${formatBRLCompact(risk.riskyValue)} · lembrete preventivo programado pela régua`,
      });
    out.push({
      tone: "info",
      title: `${formatBRLCompact(k.aVencer30)} vencem nos próximos 30 dias`,
      detail: `${formatNumber(k.aVencer30Titulos)} títulos · veja a previsão ajustada pelo histórico`,
    });
    return out;
  }, [k, risk, debtors]);

  return (
    <div className="space-y-3 sm:space-y-4">
      <div className="grid grid-cols-2 gap-2.5 md:grid-cols-3 xl:grid-cols-5">
        <Kpi label="Vencido em aberto" value={formatBRLCompact(k.vencido)} hint={`${formatNumber(k.vencidoTitulos)} títulos · ${k.vencidoClientes} clientes`} status={k.vencido > 0 ? "warn" : "good"} />
        <Kpi label="A vencer em 30 dias" value={formatBRLCompact(k.aVencer30)} hint={`${formatNumber(k.aVencer30Titulos)} títulos`} />
        <Kpi
          label="Inadimplência (+30 dias)"
          value={formatPct(k.inadimplencia)}
          hint="Não pago após 30 dias · 12 meses"
          status={k.inadimplencia > 0.05 ? "bad" : k.inadimplencia > 0.025 ? "warn" : "good"}
        />
        <Kpi label="Prazo médio de recebimento" value={`${formatNumber(k.pmr)} dias`} hint={`Da emissão ao pagamento · atraso médio ${formatNumber(k.atrasoMedio)} d`} />
        <Kpi label="Carteira programada" value={formatBRLCompact(k.aVencer)} hint="Parcelas de contrato nos próximos 90 dias" />
      </div>

      <div className="grid gap-3 sm:gap-4 lg:grid-cols-5">
        <Panel
          className="lg:col-span-3"
          title="Como cada mês foi pago"
          question="Os clientes estão pagando em dia?"
          actions={
            <Legend
              items={[
                { label: "No prazo", color: CHART.series1 },
                { label: "Com atraso", color: CHART.series2 },
                { label: "Em aberto", color: CHART.bad },
              ]}
            />
          }
          footer="Por mês de vencimento. Meses recentes ainda têm títulos em cobrança."
        >
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={evo} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid {...gridProps} />
              <XAxis dataKey="label" {...axisProps} />
              <YAxis {...yAxisProps} tickFormatter={formatAxisBRL} />
              <Tooltip
                cursor={{ fill: "rgba(148,163,184,0.12)" }}
                content={
                  <ChartTooltip
                    formatter={(v) => formatBRL(v)}
                    names={{ noPrazo: "No prazo", comAtraso: "Pago com atraso", emAberto: "Em aberto" }}
                    labelFormatter={(l, p) => `${l} · ${formatPct(Number(p?.pontualidade ?? 0), 0)} pago no prazo`}
                  />
                }
              />
              <Bar dataKey="noPrazo" stackId="a" name="No prazo" fill={CHART.series1} maxBarSize={30} stroke="#fff" strokeWidth={1} />
              <Bar dataKey="comAtraso" stackId="a" name="Com atraso" fill={CHART.series2} maxBarSize={30} stroke="#fff" strokeWidth={1} />
              <Bar dataKey="emAberto" stackId="a" name="Em aberto" fill={CHART.bad} radius={[4, 4, 0, 0]} maxBarSize={30} stroke="#fff" strokeWidth={1} />
            </BarChart>
          </ResponsiveContainer>
        </Panel>
        <Panel className="lg:col-span-2" title="Alertas do dia" question="O que a equipe deve priorizar?">
          <div className="px-2 pt-1">
            <AlertList items={alerts} />
          </div>
        </Panel>
      </div>

      <Panel title="Exposição por segmento" question="Onde está concentrado o risco?">
        <DataTable caption="Exposição por segmento de cliente">
          <thead>
            <tr>
              <th className={th}>Segmento</th>
              <th className={`${th} text-right`}>Clientes</th>
              <th className={`${th} text-right`}>Em aberto (90 d)</th>
              <th className={`${th} text-right`}>Vencido</th>
              <th className={`${th} text-right`}>Inadimplência</th>
            </tr>
          </thead>
          <tbody>
            {[...segments]
              .sort((a, b) => b.vencido - a.vencido)
              .map((s) => (
                <tr key={s.segment} className="hover:bg-ink-50">
                  <td className={`${td} font-medium text-ink-900`}>{s.segment}</td>
                  <td className={`${td} tabular text-right`}>{formatNumber(s.clientes)}</td>
                  <td className={`${td} tabular text-right`}>{formatBRLCompact(s.aberto)}</td>
                  <td className={`${td} tabular text-right font-semibold`}>{formatBRLCompact(s.vencido)}</td>
                  <td className={`${td} text-right`}>
                    <StatusPill status={s.inad > 0.05 ? "bad" : s.inad > 0.025 ? "warn" : "good"}>{formatPct(s.inad)}</StatusPill>
                  </td>
                </tr>
              ))}
          </tbody>
        </DataTable>
      </Panel>
    </div>
  );
}

/* ------------------------------------------------------------------ */

const ACTION_STATUS = {
  Lembrete: "neutral",
  "Cobrança ativa": "warn",
  Negociação: "bad",
  "Suspensão / jurídico": "bad",
} as const;

function Aging({ filters }: { filters: FinFilters }) {
  const allBuckets = useMemo(() => aging(filters), [filters]);
  const buckets = allBuckets.filter((b) => b.kind === "vencido");
  const upcoming30 = allBuckets.find((b) => b.id === "av30")?.value ?? 0;
  const upcoming90 = allBuckets.find((b) => b.id === "av60")?.value ?? 0;
  const debtors = useMemo(() => topDebtors(filters, 10), [filters]);
  const queue = useMemo(() => collectionQueue(filters), [filters]);

  return (
    <div className="space-y-3 sm:space-y-4">
      <div className="grid gap-3 sm:gap-4 lg:grid-cols-5">
        <Panel
          className="lg:col-span-3"
          title="Aging dos títulos vencidos"
          question="Quanto está vencido e há quanto tempo?"
          actions={<Legend items={[{ label: "Mais escuro = atraso mais antigo", color: CHART.series2 }]} />}
          footer={`A vencer: ${formatBRLCompact(upcoming30)} em até 30 dias · ${formatBRLCompact(upcoming90)} entre 31 e 90 dias (parcelas programadas).`}
        >
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={buckets} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid {...gridProps} />
              <XAxis dataKey="label" {...axisProps} interval={0} />
              <YAxis {...yAxisProps} tickFormatter={formatAxisBRL} />
              <Tooltip
                cursor={{ fill: "rgba(148,163,184,0.12)" }}
                content={<ChartTooltip formatter={(v) => formatBRL(v)} names={{ value: "Valor" }} labelFormatter={(l, p) => `${l} · ${p?.titles ?? 0} títulos`} />}
              />
              <Bar dataKey="value" name="Valor" radius={[4, 4, 0, 0]} maxBarSize={40}>
                {buckets.map((b) => (
                  <Cell key={b.id} fill={AGING_COLORS[b.id]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Panel>

        <Panel className="lg:col-span-2" title="Régua de cobrança — fila de hoje" question="Quantos contatos a régua dispara hoje?">
          <ol className="space-y-1.5 px-2 pt-1">
            {queue.map((q, i) => (
              <li key={q.label} className="flex items-center gap-3 rounded-lg border border-ink-100 px-3 py-2">
                <span className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-ink-100 text-[0.6875rem] font-bold text-ink-700">{i + 1}</span>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold text-ink-900">{q.label}</p>
                  <p className="truncate text-[0.6875rem] text-ink-500">{q.rule}</p>
                </div>
                <div className="text-right">
                  <p className="tabular text-xs font-semibold text-ink-900">{q.titulos} títulos</p>
                  <p className="tabular text-[0.6875rem] text-ink-500">{formatBRLCompact(q.valor)}</p>
                </div>
              </li>
            ))}
          </ol>
        </Panel>
      </div>

      <Panel title="Principais clientes devedores" question="Quais clientes concentram a dívida?" footer="Ação sugerida pela régua: lembrete (até 7 d), cobrança ativa (8–30 d), negociação (31–90 d), suspensão/jurídico (+90 d).">
        <DataTable caption="Principais clientes devedores">
          <thead>
            <tr>
              <th className={th}>Cliente</th>
              <th className={th}>Perfil</th>
              <th className={`${th} text-right`}>Vencido</th>
              <th className={`${th} text-right`}>Títulos</th>
              <th className={`${th} text-right`}>Maior atraso</th>
              <th className={`${th} text-right`}>Ação sugerida</th>
            </tr>
          </thead>
          <tbody>
            {debtors.map((d) => (
              <tr key={d.client.id} className="hover:bg-ink-50">
                <td className={td}>
                  <p className="font-medium text-ink-900">{d.client.name}</p>
                  <p className="text-[0.6875rem] text-ink-500">{d.client.segment}</p>
                </td>
                <td className={`${td} text-ink-600`}>{PROFILE_LABEL[d.client.profile]}</td>
                <td className={`${td} tabular text-right font-semibold`}>{formatBRL(d.vencido)}</td>
                <td className={`${td} tabular text-right`}>{d.titulos}</td>
                <td className={`${td} tabular text-right`}>{d.maiorAtraso} dias</td>
                <td className={`${td} text-right`}>
                  <StatusPill status={ACTION_STATUS[d.acao]}>{d.acao}</StatusPill>
                </td>
              </tr>
            ))}
          </tbody>
        </DataTable>
      </Panel>
    </div>
  );
}

/* ------------------------------------------------------------------ */

function Forecast({ filters }: { filters: FinFilters }) {
  const weeks = useMemo(() => forecast(filters), [filters]);
  const riskyAll = useMemo(() => upcomingRiskyTitles(filters, 7), [filters]);
  const risky = riskyAll.slice(0, 8);
  const next4 = weeks.slice(0, 4);
  const nominal = next4.reduce((s, w) => s + w.nominal, 0);
  const expected = next4.reduce((s, w) => s + w.esperado, 0);

  return (
    <div className="space-y-3 sm:space-y-4">
      <div className="grid grid-cols-2 gap-2.5 lg:grid-cols-4">
        <Kpi label="Vencimentos nas próximas 4 semanas" value={formatBRLCompact(nominal)} hint="Valor nominal dos títulos" />
        <Kpi label="Recebimento esperado" value={formatBRLCompact(expected)} hint="Ajustado pelo histórico de cada cliente" />
        <Kpi label="Diferença" value={formatBRLCompact(expected - nominal)} hint={`${formatPct(nominal ? expected / nominal - 1 : 0)} vs. nominal`} status="warn" />
        <Kpi label="Títulos de risco em 7 dias" value={formatNumber(riskyAll.length)} hint="Clientes com 40%+ de pagamentos atrasados" status={riskyAll.length ? "warn" : "good"} />
      </div>

      <Panel
        title="Previsão de recebimento — próximas 8 semanas"
        question="Quanto devemos receber de fato?"
        actions={
          <Legend
            items={[
              { label: "Nominal (vencimentos)", color: CHART.reference },
              { label: "Esperado", color: CHART.series1 },
            ]}
          />
        }
        footer="Esperado = títulos da semana × taxa histórica de pagamento em até 7 dias do cliente + recuperação estimada de vencidos recentes. Vencimentos concentrados nos dias 5 e 10."
      >
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={weeks} margin={{ top: 8, right: 8, left: 0, bottom: 0 }} barGap={2}>
            <CartesianGrid {...gridProps} />
            <XAxis dataKey="label" {...axisProps} />
            <YAxis {...yAxisProps} tickFormatter={formatAxisBRL} />
            <Tooltip
              cursor={{ fill: "rgba(148,163,184,0.12)" }}
              content={<ChartTooltip formatter={(v) => formatBRL(v)} names={{ nominal: "Nominal", esperado: "Esperado" }} labelFormatter={(l) => `Semana de ${l}`} />}
            />
            <Bar dataKey="nominal" name="Nominal" fill={CHART.reference} radius={[4, 4, 0, 0]} maxBarSize={26} />
            <Bar dataKey="esperado" name="Esperado" fill={CHART.series1} radius={[4, 4, 0, 0]} maxBarSize={26} />
          </BarChart>
        </ResponsiveContainer>
      </Panel>

      <Panel
        title="Vencem em 7 dias — clientes que costumam atrasar"
        question="Com quem vale fazer contato preventivo?"
        footer={riskyAll.length > risky.length ? `Mostrando os ${risky.length} de maior valor × risco, de ${riskyAll.length} títulos.` : undefined}
      >
        {risky.length ? (
          <DataTable caption="Títulos a vencer de clientes com histórico de atraso">
            <thead>
              <tr>
                <th className={th}>Cliente</th>
                <th className={th}>Título</th>
                <th className={`${th} text-right`}>Vencimento</th>
                <th className={`${th} text-right`}>Valor</th>
                <th className={`${th} text-right`}>Pagamentos atrasados</th>
              </tr>
            </thead>
            <tbody>
              {risky.map((t) => (
                <tr key={t.id} className="hover:bg-ink-50">
                  <td className={td}>
                    <p className="font-medium text-ink-900">{t.client.name}</p>
                    <p className="text-[0.6875rem] text-ink-500">{t.client.segment}</p>
                  </td>
                  <td className={`${td} tabular text-ink-600`}>{t.id}</td>
                  <td className={`${td} tabular text-right`}>{formatDateBR(t.dueAt)}</td>
                  <td className={`${td} tabular text-right font-semibold`}>{formatBRL(t.value)}</td>
                  <td className={`${td} text-right`}>
                    <StatusPill status={t.lateShare > 0.75 ? "bad" : "warn"}>{formatPct(t.lateShare, 0)}</StatusPill>
                  </td>
                </tr>
              ))}
            </tbody>
          </DataTable>
        ) : (
          <p className="px-2 py-6 text-center text-xs text-ink-500">Nenhum título de risco vencendo nos próximos 7 dias neste filtro.</p>
        )}
      </Panel>
    </div>
  );
}
