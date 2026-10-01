/**
 * Referências de tempo compartilhadas pelos datasets simulados.
 * Os dados são "congelados" em uma data de referência para que os
 * números exibidos nunca mudem conforme o dia em que o site é aberto.
 */
export const REFERENCE_DATE = new Date(2026, 8, 30, 18, 0, 0); // 30/09/2026
export const REFERENCE_LABEL = "30/09/2026";

const MONTH_SHORT = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];
const MONTH_LONG = [
  "janeiro",
  "fevereiro",
  "março",
  "abril",
  "maio",
  "junho",
  "julho",
  "agosto",
  "setembro",
  "outubro",
  "novembro",
  "dezembro",
];

export type MonthRef = {
  index: number;
  year: number;
  /** 0-11 */
  month: number;
  key: string;
  label: string;
  longLabel: string;
};

/** Últimos `count` meses terminando no mês da data de referência */
export function buildMonths(count: number, end = REFERENCE_DATE): MonthRef[] {
  const months: MonthRef[] = [];
  for (let i = count - 1; i >= 0; i--) {
    const d = new Date(end.getFullYear(), end.getMonth() - i, 1);
    months.push({
      index: count - 1 - i,
      year: d.getFullYear(),
      month: d.getMonth(),
      key: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`,
      label: `${MONTH_SHORT[d.getMonth()]}/${String(d.getFullYear()).slice(2)}`,
      longLabel: `${MONTH_LONG[d.getMonth()]} de ${d.getFullYear()}`,
    });
  }
  return months;
}

export const monthShort = (m: number) => MONTH_SHORT[m];
export const monthLong = (m: number) => MONTH_LONG[m];

export const DAY_MS = 86_400_000;
export const HOUR_MS = 3_600_000;

export function daysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

export function formatDateBR(d: Date | number) {
  const date = typeof d === "number" ? new Date(d) : d;
  return `${String(date.getDate()).padStart(2, "0")}/${String(date.getMonth() + 1).padStart(2, "0")}`;
}

export function formatFullDateBR(d: Date | number) {
  const date = typeof d === "number" ? new Date(d) : d;
  return `${formatDateBR(date)}/${date.getFullYear()}`;
}

export const sum = (values: number[]) => values.reduce((s, v) => s + v, 0);
export const avg = (values: number[]) => (values.length ? sum(values) / values.length : 0);
export const clamp = (v: number, min: number, max: number) => Math.min(max, Math.max(min, v));
