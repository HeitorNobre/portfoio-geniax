/**
 * Tokens de gráficos — uma única fonte para cores e eixos.
 * Categóricas em ordem fixa (validadas para daltonismo): azul, laranja, verde-água.
 * Status (bom/atenção/crítico) nunca são usados como série.
 */
export const CHART = {
  series1: "#2A78D6",
  series2: "#EB6834",
  series3: "#1BAF7A",
  series1Soft: "#B7D3F6",
  reference: "#CBD5E1",
  referenceStrong: "#94A3B8",
  grid: "#E2E8F0",
  axis: "#CBD5E1",
  tick: "#64748B",
  good: "#0CA30C",
  warn: "#FAB219",
  bad: "#D03B3B",
  surface: "#FFFFFF",
} as const;

export const axisProps = {
  tick: { fill: CHART.tick, fontSize: 11 },
  tickLine: false,
  axisLine: { stroke: CHART.axis },
} as const;

export const yAxisProps = {
  tick: { fill: CHART.tick, fontSize: 11 },
  tickLine: false,
  axisLine: false,
  width: 60,
} as const;

export const gridProps = {
  stroke: CHART.grid,
  strokeDasharray: "0",
  vertical: false,
} as const;

/** Eixo percentual com ticks redondos (1, 2, 5 ou 10 p.p.) a partir dos valores plotados */
export function pctAxis(values: number[]) {
  const max = Math.max(0.01, ...values.filter((v) => Number.isFinite(v)));
  const step = max > 0.4 ? 0.1 : max > 0.16 ? 0.05 : max > 0.08 ? 0.02 : 0.01;
  const top = Math.ceil(max / step) * step;
  const ticks: number[] = [];
  for (let v = 0; v <= top + 1e-9; v += step) ticks.push(Number(v.toFixed(4)));
  return { domain: [0, top] as [number, number], ticks };
}
