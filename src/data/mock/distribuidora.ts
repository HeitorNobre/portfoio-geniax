/**
 * CASE 2 — Distribuidora de alimentos e bebidas (empresa fictícia)
 *
 * Regras de negócio usadas na simulação:
 *  - ~420 clientes (restaurantes, bares, mercados, padarias, hotéis) em 5 rotas
 *  - pedidos de segunda a sábado, sem feriados; segunda e sexta mais fortes
 *  - sazonalidade: pico em dezembro, queda em janeiro/fevereiro, alta em junho
 *  - crescimento leve e contínuo da base
 *  - vendedor "Rafael" perde 3 grandes contas no fim de agosto (queda recente)
 *  - vendedora "Juliana" abre novas contas a partir de abril (crescimento)
 *  - a rota Zona Leste perde um veículo em junho e passa a atrasar mais
 *  - entregas atrasam mais às segundas e no pico de dezembro
 */
import { createRng } from "@/lib/random";
import { buildMonths, DAY_MS, REFERENCE_DATE, sum, type MonthRef } from "./common";

export const COMPANY_NAME = "Vale Norte Distribuidora";

export const MONTHS: MonthRef[] = buildMonths(12);

export const ROUTES = ["Centro", "Zona Norte", "Zona Sul", "Zona Leste", "ABC"] as const;
export type Route = (typeof ROUTES)[number];

export const SEGMENTS = ["Restaurante", "Bar", "Mercado", "Padaria", "Hotel"] as const;
export type Segment = (typeof SEGMENTS)[number];

export const CATEGORIES = ["Bebidas", "Mercearia", "Frios e laticínios", "Congelados", "Limpeza e descartáveis"] as const;
export type Category = (typeof CATEGORIES)[number];

/** Mix de compra por segmento (fração do valor do pedido por categoria) */
const SEGMENT_MIX: Record<Segment, number[]> = {
  Restaurante: [0.18, 0.34, 0.2, 0.18, 0.1],
  Bar: [0.55, 0.12, 0.12, 0.13, 0.08],
  Mercado: [0.3, 0.35, 0.15, 0.1, 0.1],
  Padaria: [0.2, 0.3, 0.35, 0.05, 0.1],
  Hotel: [0.2, 0.28, 0.22, 0.14, 0.16],
};

export type Seller = { id: string; name: string; routes: Route[] };

export const SELLERS: Seller[] = [
  { id: "ana", name: "Ana Paula", routes: ["Centro"] },
  { id: "bruno", name: "Bruno", routes: ["Zona Norte"] },
  { id: "carla", name: "Carla", routes: ["Zona Sul"] },
  { id: "diego", name: "Diego", routes: ["Zona Leste"] },
  { id: "fernanda", name: "Fernanda", routes: ["ABC"] },
  { id: "gustavo", name: "Gustavo", routes: ["Centro", "Zona Sul"] },
  { id: "juliana", name: "Juliana", routes: ["Zona Norte", "Zona Leste"] },
  { id: "rafael", name: "Rafael", routes: ["Zona Sul", "ABC"] },
];
export const sellerById = Object.fromEntries(SELLERS.map((s) => [s.id, s])) as Record<string, Seller>;

export type Client = {
  id: number;
  name: string;
  segment: Segment;
  route: Route;
  sellerId: string;
  /** valor médio de pedido */
  size: number;
  /** pedidos por mês */
  frequency: number;
  /** índice do dia em que começa / deixa de comprar */
  startDay: number;
  endDay: number;
};

export type Order = {
  id: number;
  day: number;
  clientId: number;
  sellerId: string;
  route: Route;
  value: number;
  items: number;
  /** dias de atraso na entrega (0 = no prazo) */
  lateDays: number;
};

export type Day = { index: number; date: Date; ts: number; month: number; weekday: number; label: string };

const HOLIDAYS = new Set([
  "2025-10-12",
  "2025-11-02",
  "2025-11-15",
  "2025-11-20",
  "2025-12-25",
  "2026-01-01",
  "2026-02-16",
  "2026-02-17",
  "2026-04-03",
  "2026-04-21",
  "2026-05-01",
  "2026-06-04",
  "2026-09-07",
]);

const NAME_PREFIX: Record<Segment, string[]> = {
  Restaurante: ["Restaurante", "Cantina", "Bistrô", "Churrascaria", "Cozinha"],
  Bar: ["Bar", "Boteco", "Choperia", "Empório Bar"],
  Mercado: ["Mercado", "Mercadinho", "Minimercado", "Supermercado"],
  Padaria: ["Padaria", "Panificadora", "Confeitaria"],
  Hotel: ["Hotel", "Pousada Urbana", "Flat"],
};
const NAME_SUFFIX = [
  "Bom Sabor", "Da Esquina", "Santa Luzia", "Primavera", "Dois Irmãos", "São Jorge", "Aurora", "Estrela",
  "Bela Vista", "Nova Era", "do Largo", "Central", "Imperial", "Paulista", "Real", "Jardim", "Vila Rica",
  "Tradição", "Família", "Ponto Certo", "Recanto", "Alvorada", "Bom Jesus", "Harmonia", "Sabor Caseiro",
  "Nossa Terra", "Três Marias", "Boa Praça", "Monte Verde", "Portal", "Horizonte", "Oliveira", "Figueira",
];

const dateKey = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
const WEEKDAY = ["dom", "seg", "ter", "qua", "qui", "sex", "sáb"];

function buildDays(): Day[] {
  const days: Day[] = [];
  const start = new Date(MONTHS[0].year, MONTHS[0].month, 1);
  for (let d = new Date(start); d <= REFERENCE_DATE; d = new Date(d.getTime() + DAY_MS)) {
    const date = new Date(d.getFullYear(), d.getMonth(), d.getDate());
    if (date.getDay() === 0 || HOLIDAYS.has(dateKey(date))) continue;
    const monthIdx = MONTHS.findIndex((m) => m.year === date.getFullYear() && m.month === date.getMonth());
    days.push({
      index: days.length,
      date,
      ts: date.getTime(),
      month: monthIdx,
      weekday: date.getDay(),
      label: `${String(date.getDate()).padStart(2, "0")}/${String(date.getMonth() + 1).padStart(2, "0")}`,
    });
  }
  return days;
}

function generate() {
  const rng = createRng(4242);
  const days = buildDays();
  const lastDay = days.length - 1;
  const dayOfMonth = (m: number) => days.findIndex((d) => d.month === m);

  // ----- clientes -----
  const clients: Client[] = [];
  const usedNames = new Set<string>();
  for (let i = 0; i < 420; i++) {
    const segment = rng.weighted(SEGMENTS, [0.34, 0.2, 0.2, 0.18, 0.08]);
    const route = rng.weighted(ROUTES, [0.24, 0.2, 0.22, 0.2, 0.14]);
    const candidates = SELLERS.filter((s) => s.routes.includes(route));
    const sellerId = rng.pick(candidates).id;
    const sizeBase = segment === "Mercado" ? 2400 : segment === "Hotel" ? 2100 : segment === "Restaurante" ? 1500 : segment === "Bar" ? 1100 : 950;
    let name = "";
    do {
      name = `${rng.pick(NAME_PREFIX[segment])} ${rng.pick(NAME_SUFFIX)}`;
      if (usedNames.has(name)) name = `${name} ${rng.pick(["II", "Express", "Gourmet", "Filial", "Mooca", "Centro"])}`;
    } while (usedNames.has(name));
    usedNames.add(name);

    const isNew = rng.chance(0.07);
    const churns = !isNew && rng.chance(0.05);
    clients.push({
      id: i + 1,
      name,
      segment,
      route,
      sellerId,
      size: rng.lognormal(sizeBase, 0.45),
      frequency: Math.max(1.5, rng.lognormal(segment === "Bar" || segment === "Restaurante" ? 6 : 4.5, 0.35)),
      startDay: isNew ? rng.int(20, lastDay - 30) : 0,
      endDay: churns ? rng.int(40, lastDay - 20) : lastDay + 1,
    });
  }

  // História: Rafael perde as 3 maiores contas no fim de agosto (para um concorrente)
  const rafaelClients = clients.filter((c) => c.sellerId === "rafael").sort((a, b) => b.size * b.frequency - a.size * a.frequency);
  rafaelClients.slice(0, 3).forEach((c, i) => {
    c.size *= 2.6;
    c.frequency = Math.max(c.frequency, 7);
    c.endDay = lastDay - 30 + i * 2;
    c.startDay = 0;
  });

  // História: Juliana abre 16 novas contas a partir de abril
  const aprilStart = dayOfMonth(6);
  for (let k = 0; k < 16; k++) {
    const segment = rng.weighted(SEGMENTS, [0.4, 0.25, 0.2, 0.1, 0.05]);
    clients.push({
      id: clients.length + 1,
      name: `${rng.pick(NAME_PREFIX[segment])} ${rng.pick(NAME_SUFFIX)} ${rng.pick(["Tucuruvi", "Santana", "Penha", "Tatuapé", "Vila Maria", "Mandaqui"])}`,
      segment,
      route: rng.chance(0.5) ? "Zona Norte" : "Zona Leste",
      sellerId: "juliana",
      size: rng.lognormal(1500, 0.4),
      frequency: rng.lognormal(6, 0.3),
      startDay: aprilStart + rng.int(0, 120),
      endDay: lastDay + 1,
    });
  }

  // ----- pedidos -----
  const monthSeason = [1.0, 1.08, 1.28, 0.86, 0.9, 0.97, 0.98, 1.0, 1.05, 1.02, 0.99, 1.02]; // out → set
  const weekdayFactor = [0, 1.18, 1.05, 1.0, 1.0, 1.12, 0.42];
  const businessDaysPerMonth = 24;
  const juneStart = dayOfMonth(8);

  const orders: Order[] = [];
  let orderId = 1;
  for (const day of days) {
    const trend = 1 + day.month * 0.008;
    const season = monthSeason[day.month];
    const wf = weekdayFactor[day.weekday];
    for (const c of clients) {
      if (day.index < c.startDay || day.index >= c.endDay) continue;
      let p = (c.frequency / businessDaysPerMonth) * wf * (0.55 + 0.45 * season);
      if (c.segment === "Bar" && day.month === 4) p *= 1.15; // carnaval
      if (!rng.chance(Math.min(p, 0.95))) continue;
      const value = Math.max(180, c.size * trend * (0.6 + 0.4 * season) * Math.exp(rng.normal(0, 0.28)));

      let lateP = 0.05;
      if (c.route === "Zona Leste" && day.index >= juneStart) lateP = 0.17;
      if (day.month === 2) lateP += 0.07;
      if (day.weekday === 1) lateP += 0.04;
      if (c.route === "ABC") lateP += 0.02;
      const lateDays = rng.chance(lateP) ? rng.weighted([1, 2, 3], [0.65, 0.25, 0.1]) : 0;

      orders.push({
        id: orderId++,
        day: day.index,
        clientId: c.id,
        sellerId: c.sellerId,
        route: c.route,
        value,
        items: Math.max(3, Math.round(value / rng.range(34, 46))),
        lateDays,
      });
    }
  }

  return { days, clients, orders };
}

export const distData = generate();
export const clientById = Object.fromEntries(distData.clients.map((c) => [c.id, c])) as Record<number, Client>;

/* ------------------------------------------------------------------ */
/* Consultas                                                           */
/* ------------------------------------------------------------------ */

export type DistPeriod = "30d" | "90d" | "12m";
export type DistFilters = { period: DistPeriod; sellerId: string | "all"; route: Route | "all" };
export const DEFAULT_DIST_FILTERS: DistFilters = { period: "30d", sellerId: "all", route: "all" };

const LAST_DAY = distData.days.length - 1;
const periodBusinessDays = (p: DistPeriod) => (p === "30d" ? 26 : p === "90d" ? 77 : distData.days.length);

export function periodRange(p: DistPeriod, offset = 0) {
  const len = periodBusinessDays(p);
  const end = LAST_DAY - offset * len;
  return { start: Math.max(0, end - len + 1), end, len };
}

function match(o: Order, f: DistFilters) {
  return (f.sellerId === "all" || o.sellerId === f.sellerId) && (f.route === "all" || o.route === f.route);
}

function ordersIn(f: DistFilters, offset = 0) {
  const { start, end } = periodRange(f.period, offset);
  return distData.orders.filter((o) => o.day >= start && o.day <= end && match(o, f));
}

function summarize(list: Order[]) {
  const faturamento = sum(list.map((o) => o.value));
  const delivered = list.filter((o) => o.day < LAST_DAY);
  const late = delivered.filter((o) => o.lateDays > 0);
  return {
    faturamento,
    pedidos: list.length,
    ticket: list.length ? faturamento / list.length : 0,
    clientes: new Set(list.map((o) => o.clientId)).size,
    itens: sum(list.map((o) => o.items)),
    entregues: delivered.length,
    atrasadas: late.length,
    pctAtraso: delivered.length ? late.length / delivered.length : 0,
    atrasoMedio: late.length ? sum(late.map((o) => o.lateDays)) / late.length : 0,
  };
}

export function distKpis(f: DistFilters) {
  const current = summarize(ordersIn(f));
  const previous = f.period === "12m" ? null : summarize(ordersIn(f, 1));
  const { len } = periodRange(f.period);
  return { current, previous, businessDays: len };
}

/** Série temporal: diária para 30/90 dias, mensal para 12 meses */
export function distSeries(f: DistFilters) {
  const list = ordersIn(f);
  if (f.period === "12m") {
    return MONTHS.map((m) => {
      const rows = list.filter((o) => distData.days[o.day].month === m.index);
      const s = summarize(rows);
      return { label: m.label, ...s };
    });
  }
  const { start, end } = periodRange(f.period);
  const out = [];
  for (let d = start; d <= end; d++) {
    const rows = list.filter((o) => o.day === d);
    const day = distData.days[d];
    out.push({ label: day.label, weekday: WEEKDAY[day.weekday], ...summarize(rows) });
  }
  return out;
}

export type SellerRow = {
  seller: Seller;
  faturamento: number;
  anterior: number;
  variacao: number;
  pedidos: number;
  ticket: number;
  clientes: number;
  meta: number;
  atingimento: number;
  trend: number[];
};

/** Desempenho por vendedor. Meta mensal = média dos 3 meses anteriores × 1,05 */
export function sellerPerformance(f: DistFilters): SellerRow[] {
  return SELLERS.filter((s) => f.sellerId === "all" || s.id === f.sellerId).map((seller) => {
    const sf = { ...f, sellerId: seller.id };
    const cur = summarize(ordersIn(sf));
    const prev = f.period === "12m" ? null : summarize(ordersIn(sf, 1));
    const monthly = MONTHS.map(() => 0);
    distData.orders.forEach((o) => {
      if (match(o, sf)) monthly[distData.days[o.day].month] += o.value;
    });
    const lastIdx = MONTHS.length - 1;
    const meta = ((monthly[lastIdx - 1] + monthly[lastIdx - 2] + monthly[lastIdx - 3]) / 3) * 1.05;
    return {
      seller,
      faturamento: cur.faturamento,
      anterior: prev ? prev.faturamento : 0,
      variacao: prev && prev.faturamento ? cur.faturamento / prev.faturamento - 1 : 0,
      pedidos: cur.pedidos,
      ticket: cur.ticket,
      clientes: cur.clientes,
      meta,
      atingimento: meta ? monthly[lastIdx] / meta : 0,
      trend: monthly,
    };
  });
}

export function categoryMix(f: DistFilters) {
  const list = ordersIn(f);
  const totals = CATEGORIES.map(() => 0);
  list.forEach((o) => {
    const mix = SEGMENT_MIX[clientById[o.clientId].segment];
    mix.forEach((share, i) => (totals[i] += o.value * share));
  });
  return CATEGORIES.map((c, i) => ({ category: c, value: totals[i] })).sort((a, b) => b.value - a.value);
}

export function routeDelivery(f: DistFilters) {
  const list = ordersIn({ ...f, route: "all" }).filter((o) => o.day < LAST_DAY);
  const before = distData.orders.filter((o) => o.day < LAST_DAY && match(o, { ...f, route: "all" }));
  return ROUTES.map((route) => {
    const rows = list.filter((o) => o.route === route);
    const late = rows.filter((o) => o.lateDays > 0);
    const hist = before.filter((o) => o.route === route && distData.days[o.day].month <= 7);
    return {
      route,
      entregas: rows.length,
      atrasadas: late.length,
      pct: rows.length ? late.length / rows.length : 0,
      pctAntesJunho: hist.length ? hist.filter((o) => o.lateDays > 0).length / hist.length : 0,
    };
  });
}

export function lateByWeekday(f: DistFilters) {
  const list = ordersIn(f).filter((o) => o.day < LAST_DAY);
  return [1, 2, 3, 4, 5, 6].map((wd) => {
    const rows = list.filter((o) => distData.days[o.day].weekday === wd);
    return { label: WEEKDAY[wd], pct: rows.length ? rows.filter((o) => o.lateDays > 0).length / rows.length : 0 };
  });
}

/** % de atraso por semana (últimas 26 semanas) para a rota selecionada e o restante */
export function weeklyLate(f: DistFilters) {
  const weeks: { label: string; pct: number; pctOutras: number }[] = [];
  const endTs = distData.days[LAST_DAY - 1].ts;
  for (let w = 25; w >= 0; w--) {
    const wEnd = endTs - w * 7 * DAY_MS;
    const wStart = wEnd - 6 * DAY_MS;
    const rows = distData.orders.filter((o) => {
      const ts = distData.days[o.day].ts;
      return ts >= wStart && ts <= wEnd && (f.sellerId === "all" || o.sellerId === f.sellerId);
    });
    const leste = rows.filter((o) => o.route === "Zona Leste");
    const others = rows.filter((o) => o.route !== "Zona Leste");
    const d = new Date(wStart);
    weeks.push({
      label: `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}`,
      pct: leste.length ? leste.filter((o) => o.lateDays > 0).length / leste.length : 0,
      pctOutras: others.length ? others.filter((o) => o.lateDays > 0).length / others.length : 0,
    });
  }
  return weeks;
}

/** Produtividade da separação: 6 separadores (7 em dezembro, com temporário) */
export function pickingProductivity(f: DistFilters) {
  return distSeries({ ...f, sellerId: "all", route: "all" }).map((d) => {
    const team = d.label.startsWith("dez") || d.label.endsWith("/12") ? 7 : 6;
    const perDay = f.period === "12m" ? d.pedidos / Math.max(1, businessDaysInMonthLabel(d.label)) : d.pedidos;
    return { label: d.label, porSeparador: perDay / team };
  });
}

function businessDaysInMonthLabel(label: string) {
  const m = MONTHS.find((x) => x.label === label);
  if (!m) return 24;
  return distData.days.filter((d) => d.month === m.index).length;
}

/* ----- Estoque (derivado das vendas por categoria dos últimos 30 dias) ----- */

type SkuDef = { sku: string; name: string; category: Category; price: number; share: number; stockDays: number };

const SKUS: SkuDef[] = [
  { sku: "BEB-0102", name: "Refrigerante lata 350 ml (cx 12)", category: "Bebidas", price: 42, share: 0.22, stockDays: 4.5 },
  { sku: "BEB-0217", name: "Água mineral 500 ml (fardo 12)", category: "Bebidas", price: 18, share: 0.12, stockDays: 21 },
  { sku: "BEB-0330", name: "Cerveja long neck (cx 24)", category: "Bebidas", price: 115, share: 0.3, stockDays: 12 },
  { sku: "MER-1044", name: "Arroz tipo 1 — 5 kg", category: "Mercearia", price: 29, share: 0.2, stockDays: 18 },
  { sku: "MER-1101", name: "Óleo de soja 900 ml (cx 20)", category: "Mercearia", price: 148, share: 0.14, stockDays: 6 },
  { sku: "MER-1180", name: "Molho de tomate 2 kg", category: "Mercearia", price: 21, share: 0.1, stockDays: 74 },
  { sku: "FRI-2003", name: "Queijo muçarela (kg)", category: "Frios e laticínios", price: 39, share: 0.34, stockDays: 5.5 },
  { sku: "FRI-2051", name: "Presunto cozido (kg)", category: "Frios e laticínios", price: 31, share: 0.18, stockDays: 16 },
  { sku: "FRI-2090", name: "Creme de leite 1 L (cx 12)", category: "Frios e laticínios", price: 96, share: 0.12, stockDays: 27 },
  { sku: "CON-3012", name: "Batata pré-frita 2,5 kg", category: "Congelados", price: 38, share: 0.36, stockDays: 9 },
  { sku: "CON-3040", name: "Hambúrguer bovino (cx 36)", category: "Congelados", price: 89, share: 0.2, stockDays: 68 },
  { sku: "LIM-4008", name: "Copo descartável 200 ml (cx 2.500)", category: "Limpeza e descartáveis", price: 112, share: 0.18, stockDays: 33 },
  { sku: "LIM-4033", name: "Detergente 5 L", category: "Limpeza e descartáveis", price: 24, share: 0.14, stockDays: 3 },
  { sku: "LIM-4070", name: "Guardanapo folha simples (cx 50 pct)", category: "Limpeza e descartáveis", price: 76, share: 0.12, stockDays: 45 },
];

export type StockRow = SkuDef & {
  dailyUnits: number;
  stock: number;
  coverage: number;
  stockValue: number;
  status: "ruptura" | "atencao" | "ok" | "excesso";
};

export function stockPosition(): StockRow[] {
  const mix = categoryMix({ period: "30d", sellerId: "all", route: "all" });
  const days = periodRange("30d").len;
  return SKUS.map((s) => {
    const catRevenue = mix.find((m) => m.category === s.category)?.value ?? 0;
    const dailyUnits = (catRevenue * s.share) / s.price / days;
    const stock = Math.round(dailyUnits * s.stockDays);
    const coverage = stock / dailyUnits;
    const status: StockRow["status"] = coverage < 7 ? "ruptura" : coverage < 12 ? "atencao" : coverage > 60 ? "excesso" : "ok";
    return { ...s, dailyUnits, stock, coverage, stockValue: stock * s.price, status };
  }).sort((a, b) => a.coverage - b.coverage);
}

/** Resumo automático do "dia anterior" que o pipeline envia aos gestores */
export function dailyBriefing() {
  const day = LAST_DAY;
  const dayOrders = distData.orders.filter((o) => o.day === day);
  const weekday = distData.days[day].weekday;
  const sameWeekday = distData.days.filter((d) => d.weekday === weekday && d.index < day).slice(-8);
  const avgSame = sum(sameWeekday.map((d) => sum(distData.orders.filter((o) => o.day === d.index).map((o) => o.value)))) / sameWeekday.length;
  const faturamento = sum(dayOrders.map((o) => o.value));
  const prevDelivered = distData.orders.filter((o) => o.day === day - 1);
  const late = prevDelivered.filter((o) => o.lateDays > 0);
  const lateLeste = late.filter((o) => o.route === "Zona Leste").length;
  const sellers = sellerPerformance({ period: "30d", sellerId: "all", route: "all" });
  const worst = [...sellers].sort((a, b) => a.variacao - b.variacao)[0];
  const stock = stockPosition().filter((s) => s.status === "ruptura");
  const monthRows = distData.orders.filter((o) => distData.days[o.day].month === MONTHS.length - 1);
  return {
    date: distData.days[day].date,
    faturamento,
    pedidos: dayOrders.length,
    ticket: dayOrders.length ? faturamento / dayOrders.length : 0,
    vsMedia: avgSame ? faturamento / avgSame - 1 : 0,
    entregasOntem: prevDelivered.length,
    atrasadasOntem: late.length,
    atrasadasLeste: lateLeste,
    worstSeller: worst,
    stockAlerts: stock,
    mesAcumulado: sum(monthRows.map((o) => o.value)),
  };
}

export function distHeadline() {
  const k = distKpis({ period: "30d", sellerId: "all", route: "all" });
  const k12 = distKpis({ period: "12m", sellerId: "all", route: "all" });
  const sellers = sellerPerformance({ period: "30d", sellerId: "all", route: "all" });
  const routes = routeDelivery({ period: "90d", sellerId: "all", route: "all" });
  const monthly = distSeries({ period: "12m", sellerId: "all", route: "all" });
  const peak = [...monthly].sort((a, b) => b.faturamento - a.faturamento)[0];
  const low = [...monthly].sort((a, b) => a.faturamento - b.faturamento)[0];
  return {
    k,
    k12,
    worstSeller: [...sellers].sort((a, b) => a.variacao - b.variacao)[0],
    bestSeller: [...sellers].sort((a, b) => b.variacao - a.variacao)[0],
    leste: routes.find((r) => r.route === "Zona Leste")!,
    others: routes.filter((r) => r.route !== "Zona Leste"),
    peak,
    low,
    clients: distData.clients.length,
    stockRisk: stockPosition().filter((s) => s.status === "ruptura"),
  };
}
