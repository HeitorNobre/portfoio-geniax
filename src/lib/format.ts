const brl = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });
const num = new Intl.NumberFormat("pt-BR", { maximumFractionDigits: 0 });
const num1 = new Intl.NumberFormat("pt-BR", { minimumFractionDigits: 1, maximumFractionDigits: 1 });

export const formatBRL = (v: number) => brl.format(v);
export const formatNumber = (v: number) => num.format(v);
export const formatDecimal = (v: number) => num1.format(v);

/** R$ compacto: R$ 1,2 mi · R$ 845 mil */
export function formatBRLCompact(v: number) {
  const abs = Math.abs(v);
  const sign = v < 0 ? "-" : "";
  if (abs >= 1_000_000) return `${sign}R$ ${num1.format(abs / 1_000_000)} mi`;
  if (abs >= 10_000) return `${sign}R$ ${num.format(abs / 1_000)} mil`;
  if (abs >= 1_000) return `${sign}R$ ${num1.format(abs / 1_000)} mil`;
  return `${sign}R$ ${num.format(abs)}`;
}

/** Eixo de gráficos: 1,2 mi · 845 mil */
export function formatAxisBRL(v: number) {
  const abs = Math.abs(v);
  if (abs >= 1_000_000) return `${num1.format(v / 1_000_000)} mi`;
  if (abs >= 1_000) return `${num.format(v / 1_000)} mil`;
  return num.format(v);
}

/** Recebe fração (0.123) e devolve "12,3%" */
export const formatPct = (v: number, digits = 1) =>
  `${new Intl.NumberFormat("pt-BR", { minimumFractionDigits: digits, maximumFractionDigits: digits }).format(v * 100)}%`;

/** Diferença em pontos percentuais: "+1,4 p.p." */
export const formatPP = (v: number) => `${v >= 0 ? "+" : "−"}${num1.format(Math.abs(v * 100))} p.p.`;

export const formatSignedPct = (v: number) => `${v >= 0 ? "+" : "−"}${formatPct(Math.abs(v))}`;

export function formatHours(h: number) {
  if (h < 48) return `${num.format(h)} h`;
  return `${num1.format(h / 24)} dias`;
}
