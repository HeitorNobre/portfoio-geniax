/**
 * CASE 1 — Administradora de condomínios (empresa fictícia)
 *
 * Dados simulados com regras de negócio explícitas para permitir
 * histórias reais de gestão:
 *  - 40 condomínios, verticais e horizontais, em 5 regiões de SP
 *  - reajuste anual da taxa condominial em janeiro
 *  - inadimplência com sazonalidade (jan/fev mais alta) e 4 condomínios
 *    em tendência de alta nos últimos meses; 2 em recuperação após acordos
 *  - despesas por categoria com orçamento anual; água/energia mais altas no verão;
 *    obras extraordinárias que estouram o orçamento de alguns condomínios
 *  - chamados com SLA por categoria; fornecedores com desempenho diferente
 *    (um consistentemente fora do prazo e um piorando nos últimos meses)
 */
import { createRng } from "@/lib/random";
import { buildMonths, clamp, daysInMonth, HOUR_MS, REFERENCE_DATE, sum, type MonthRef } from "./common";

export const COMPANY_NAME = "Solar Gestão Condominial";

export const REGIONS = ["Zona Sul", "Zona Oeste", "Zona Norte", "Zona Leste", "Centro"] as const;
export type Region = (typeof REGIONS)[number];

export const MONTHS: MonthRef[] = buildMonths(12);

/* ------------------------------------------------------------------ */
/* Cadastros                                                           */
/* ------------------------------------------------------------------ */

export type ExpenseCategoryId =
  | "pessoal"
  | "seguranca"
  | "limpeza"
  | "utilidades"
  | "manutencao"
  | "elevadores"
  | "jardinagem"
  | "administracao"
  | "obras";

export const EXPENSE_CATEGORIES: { id: ExpenseCategoryId; label: string; share: number }[] = [
  { id: "pessoal", label: "Pessoal e encargos", share: 0.3 },
  { id: "seguranca", label: "Portaria e segurança", share: 0.16 },
  { id: "utilidades", label: "Água, energia e gás", share: 0.15 },
  { id: "limpeza", label: "Limpeza e conservação", share: 0.11 },
  { id: "manutencao", label: "Manutenção predial", share: 0.09 },
  { id: "administracao", label: "Taxa de administração", share: 0.06 },
  { id: "elevadores", label: "Elevadores", share: 0.05 },
  { id: "obras", label: "Obras e extraordinárias", share: 0.02 },
  { id: "jardinagem", label: "Jardinagem", share: 0.02 },
];

export type Supplier = {
  id: string;
  name: string;
  segment: string;
  /** Fator de tempo de atendimento em relação ao SLA (mediana). < 1 = rápido */
  speed: number;
  /** Piora (+) ou melhora (−) do fator por mês nos últimos 5 meses */
  drift: number;
};

export const SUPPLIERS: Supplier[] = [
  { id: "brilho", name: "Brilho Serviços de Limpeza", segment: "Limpeza", speed: 0.55, drift: 0 },
  { id: "conserva", name: "Conserva Plus", segment: "Limpeza", speed: 0.68, drift: 0 },
  { id: "guardiao", name: "Guardião Portaria", segment: "Portaria e segurança", speed: 0.5, drift: 0 },
  { id: "vigil", name: "Vigil Park Segurança", segment: "Portaria e segurança", speed: 0.64, drift: 0 },
  { id: "ascenda", name: "Ascenda Elevadores", segment: "Elevadores", speed: 0.55, drift: 0 },
  { id: "vertical", name: "Vertical Tech Elevadores", segment: "Elevadores", speed: 0.6, drift: 0.08 },
  { id: "hidrofix", name: "HidroFix Manutenção", segment: "Hidráulica", speed: 1.06, drift: 0 },
  { id: "reparoja", name: "Reparo Já Serviços", segment: "Manutenção geral", speed: 0.6, drift: 0 },
  { id: "eletroprime", name: "EletroPrime Instalações", segment: "Elétrica", speed: 0.66, drift: 0 },
  { id: "verdevivo", name: "Verde Vivo Paisagismo", segment: "Jardinagem", speed: 0.62, drift: 0 },
  { id: "olhovivo", name: "Olho Vivo Sistemas", segment: "CFTV e acesso", speed: 0.78, drift: 0 },
  { id: "interno", name: "Equipe interna (atendimento)", segment: "Administrativo", speed: 0.62, drift: 0 },
  { id: "baseforte", name: "Base Forte Engenharia", segment: "Obras", speed: 1, drift: 0 },
  { id: "fachada", name: "Fachada Nova Reformas", segment: "Obras", speed: 1, drift: 0 },
];

export const supplierById = Object.fromEntries(SUPPLIERS.map((s) => [s.id, s])) as Record<string, Supplier>;

export type TicketCategoryId =
  | "hidraulica"
  | "eletrica"
  | "elevador"
  | "portaria"
  | "limpeza"
  | "cftv"
  | "areas"
  | "administrativo";

export const TICKET_CATEGORIES: { id: TicketCategoryId; label: string; slaHours: number; weight: number }[] = [
  { id: "hidraulica", label: "Hidráulica", slaHours: 48, weight: 0.23 },
  { id: "administrativo", label: "Administrativo", slaHours: 72, weight: 0.16 },
  { id: "eletrica", label: "Elétrica", slaHours: 48, weight: 0.14 },
  { id: "elevador", label: "Elevador", slaHours: 24, weight: 0.12 },
  { id: "portaria", label: "Portaria e acesso", slaHours: 24, weight: 0.12 },
  { id: "limpeza", label: "Limpeza", slaHours: 24, weight: 0.1 },
  { id: "cftv", label: "CFTV", slaHours: 72, weight: 0.07 },
  { id: "areas", label: "Áreas comuns", slaHours: 120, weight: 0.06 },
];

export const ticketCategoryById = Object.fromEntries(TICKET_CATEGORIES.map((c) => [c.id, c])) as Record<
  TicketCategoryId,
  (typeof TICKET_CATEGORIES)[number]
>;

export type InadProfile = "estavel" | "alta" | "recuperacao";

export type Condo = {
  id: string;
  name: string;
  region: Region;
  units: number;
  fee: number;
  vertical: boolean;
  ageYears: number;
  profile: InadProfile;
  suppliers: {
    limpeza: string;
    seguranca: string;
    elevadores: string | null;
    hidraulica: string;
    eletrica: string;
  };
};

const CONDO_NAMES: [string, Region, boolean][] = [
  ["Residencial Jardim das Acácias", "Zona Sul", true],
  ["Edifício Monte Azul", "Zona Oeste", true],
  ["Condomínio Parque dos Ipês", "Zona Norte", false],
  ["Edifício Solar do Campo Belo", "Zona Sul", true],
  ["Residencial Vila Serena", "Zona Leste", true],
  ["Edifício Maison Pinheiros", "Zona Oeste", true],
  ["Condomínio Recanto Verde", "Zona Sul", false],
  ["Edifício Barão de Itapetininga", "Centro", true],
  ["Residencial Alto da Mooca", "Zona Leste", true],
  ["Edifício Vista Paulista", "Centro", true],
  ["Residencial Bosque Santana", "Zona Norte", true],
  ["Edifício Aurora Perdizes", "Zona Oeste", true],
  ["Condomínio Villaggio Tatuapé", "Zona Leste", true],
  ["Edifício Porto Moema", "Zona Sul", true],
  ["Residencial Horto Florestal", "Zona Norte", false],
  ["Edifício Lapa Office & Home", "Zona Oeste", true],
  ["Residencial Praça da Árvore", "Zona Sul", true],
  ["Edifício São Bento", "Centro", true],
  ["Residencial Jardim Anália", "Zona Leste", true],
  ["Condomínio Quinta da Cantareira", "Zona Norte", false],
  ["Edifício Belvedere Butantã", "Zona Oeste", true],
  ["Residencial Chácara Klabin", "Zona Sul", true],
  ["Edifício Liberdade Garden", "Centro", true],
  ["Residencial Parque Carrão", "Zona Leste", true],
  ["Edifício Imirim Plaza", "Zona Norte", true],
  ["Residencial Vila Madalena", "Zona Oeste", true],
  ["Condomínio Terras de Interlagos", "Zona Sul", false],
  ["Edifício Consolação 1200", "Centro", true],
  ["Residencial Penha Nova", "Zona Leste", true],
  ["Edifício Mirante do Tucuruvi", "Zona Norte", true],
  ["Residencial Vila Leopoldina", "Zona Oeste", true],
  ["Edifício Saúde Prime", "Zona Sul", true],
  ["Condomínio Jardins de Itaquera", "Zona Leste", false],
  ["Edifício República", "Centro", true],
  ["Residencial Casa Verde", "Zona Norte", true],
  ["Edifício Alto de Pinheiros", "Zona Oeste", true],
  ["Residencial Vila Mariana Park", "Zona Sul", true],
  ["Condomínio Aldeia da Serra Leste", "Zona Leste", false],
  ["Edifício Santa Cecília", "Centro", true],
  ["Residencial Jaçanã", "Zona Norte", true],
];

/** Condomínios com inadimplência em alta (história principal do case) */
const RISING = new Set([4, 12, 23, 34]);
/** Condomínios em recuperação após campanha de acordos */
const RECOVERING = new Set([7, 28]);

/** Obras extraordinárias: condomínio, meses (índice), multiplicador sobre o orçamento de obras */
const WORKS: { condo: number; months: number[]; factor: number; supplier: string; description: string }[] = [
  { condo: 1, months: [7, 8, 9], factor: 24, supplier: "fachada", description: "impermeabilização da cobertura" },
  { condo: 13, months: [2, 3], factor: 20, supplier: "baseforte", description: "troca de prumadas de água" },
  { condo: 21, months: [9, 10, 11], factor: 21, supplier: "fachada", description: "recuperação de fachada" },
  { condo: 9, months: [5], factor: 30, supplier: "baseforte", description: "adequação do sistema de incêndio" },
  { condo: 30, months: [10, 11], factor: 16, supplier: "baseforte", description: "reforma do salão de festas" },
];

/* ------------------------------------------------------------------ */
/* Registros gerados                                                   */
/* ------------------------------------------------------------------ */

export type CondoMonth = {
  condoId: string;
  m: number;
  previsto: number;
  recebido: number;
  inad: number;
  orcado: number;
  realizado: number;
  categories: Record<ExpenseCategoryId, { orcado: number; realizado: number }>;
  /** gasto por fornecedor no mês */
  supplierSpend: Record<string, number>;
};

export type Ticket = {
  id: number;
  condoId: string;
  m: number;
  category: TicketCategoryId;
  supplierId: string;
  openedAt: number;
  /** horas até resolução (encerrados) ou horas decorridas (abertos) */
  hours: number;
  closed: boolean;
  closedAt: number | null;
  withinSla: boolean;
};

function generate() {
  const rng = createRng(20260930);

  const condos: Condo[] = CONDO_NAMES.map(([name, region, vertical], i) => {
    const units = vertical ? rng.int(36, 220) : rng.int(60, 280);
    const fee = Math.round((vertical ? rng.range(520, 1450) : rng.range(420, 980)) / 10) * 10;
    return {
      id: `c${String(i + 1).padStart(2, "0")}`,
      name,
      region,
      units,
      fee,
      vertical,
      ageYears: rng.int(4, 46),
      profile: RISING.has(i) ? "alta" : RECOVERING.has(i) ? "recuperacao" : "estavel",
      suppliers: {
        limpeza: rng.chance(0.6) ? "brilho" : "conserva",
        seguranca: rng.chance(0.55) ? "guardiao" : "vigil",
        elevadores: vertical ? (rng.chance(0.5) ? "ascenda" : "vertical") : null,
        hidraulica: rng.chance(0.5) ? "hidrofix" : "reparoja",
        eletrica: rng.chance(0.65) ? "eletroprime" : "reparoja",
      },
    };
  });

  // Condomínios da história do SLA: garantem presença da HidroFix e da Vertical Tech
  [2, 5, 10, 17, 25, 31].forEach((i) => (condos[i].suppliers.hidraulica = "hidrofix"));
  [1, 5, 11, 20, 24, 35].forEach((i) => (condos[i].suppliers.elevadores = "vertical"));

  const inadBase = condos.map((c) =>
    c.profile === "recuperacao" ? rng.range(0.11, 0.14) : c.profile === "alta" ? rng.range(0.04, 0.06) : rng.range(0.02, 0.075),
  );

  const seasonalInad = [0.018, 0.012, 0.004, 0, 0, 0, 0.004, 0, 0, 0, 0, 0.006];
  const seasonalTickets = [1.25, 1.2, 1.15, 1, 0.95, 0.9, 0.9, 0.9, 0.95, 1, 1.05, 1.2];
  const seasonalUtilities = [1.14, 1.12, 1.06, 1, 0.95, 0.92, 0.92, 0.94, 0.98, 1.02, 1.06, 1.12];

  const records: CondoMonth[] = [];
  const tickets: Ticket[] = [];
  let ticketId = 1;
  const refTime = REFERENCE_DATE.getTime();

  condos.forEach((condo, ci) => {
    let prevPrevisto = 0;
    let prevInad = 0;
    const ageFactor = 0.8 + condo.ageYears / 60;

    MONTHS.forEach((month) => {
      const m = month.index;
      const reajuste = month.year >= 2026 ? 1.055 : 1;
      const previsto = condo.units * condo.fee * reajuste;

      // ----- inadimplência -----
      let inad = inadBase[ci] + seasonalInad[month.month] + rng.normal(0, 0.005);
      if (condo.profile === "alta" && m >= 6) inad += (m - 5) * 0.0125;
      if (condo.profile === "recuperacao" && m >= 5) inad -= (m - 4) * 0.011;
      inad = clamp(inad, 0.006, 0.3);
      const recuperado = prevPrevisto * prevInad * 0.35;
      const recebido = previsto * (1 - inad) + recuperado;

      // ----- chamados -----
      const monthStart = new Date(month.year, month.month, 1).getTime();
      const monthDays = daysInMonth(month.year, month.month);
      const maxOffset =
        m === MONTHS.length - 1 ? Math.min(monthDays * 24, (refTime - monthStart) / HOUR_MS) : monthDays * 24;
      const lambda = condo.units * 0.03 * ageFactor * seasonalTickets[month.month];
      const count = rng.poisson(lambda);
      const cats = TICKET_CATEGORIES.filter((c) => c.id !== "elevador" || condo.vertical);
      const weights = cats.map((c) => (c.id === "areas" && !condo.vertical ? c.weight * 2.5 : c.weight));
      let maintenanceTickets = 0;

      for (let k = 0; k < count; k++) {
        const cat = rng.weighted(cats, weights);
        const supplierId =
          cat.id === "hidraulica"
            ? condo.suppliers.hidraulica
            : cat.id === "eletrica"
              ? condo.suppliers.eletrica
              : cat.id === "elevador"
                ? (condo.suppliers.elevadores as string)
                : cat.id === "portaria"
                  ? condo.suppliers.seguranca
                  : cat.id === "limpeza"
                    ? condo.suppliers.limpeza
                    : cat.id === "cftv"
                      ? "olhovivo"
                      : cat.id === "areas"
                        ? "verdevivo"
                        : "interno";
        if (cat.id === "hidraulica" || cat.id === "eletrica") maintenanceTickets++;

        const supplier = supplierById[supplierId];
        let speed = supplier.speed + (m >= 7 ? (m - 6) * supplier.drift : 0);
        // férias da equipe interna em janeiro
        if (supplierId === "interno" && month.month === 0) speed *= 1.7;
        let hoursToResolve = Math.max(0.5, cat.slaHours * speed * Math.exp(rng.normal(0, 0.35)));
        // parte dos chamados fica parada aguardando peça ou aprovação de orçamento
        const pendingChance = supplierId === "hidrofix" ? 0.2 : supplierId === "interno" ? 0.04 : 0.07;
        if (rng.chance(pendingChance)) hoursToResolve *= rng.range(3, 16);
        const openedAt = monthStart + rng.next() * maxOffset * HOUR_MS;
        // chamados recentes que seguem parados (aguardando peça, orçamento ou aprovação do síndico)
        const stuckChance = supplierId === "hidrofix" ? 0.3 : supplierId === "vertical" ? 0.18 : 0.07;
        const stuck = refTime - openedAt < 40 * 24 * HOUR_MS && rng.chance(stuckChance);
        const resolvedAt = stuck ? refTime + HOUR_MS : openedAt + hoursToResolve * HOUR_MS;
        const closed = resolvedAt <= refTime;
        const hours = closed ? hoursToResolve : (refTime - openedAt) / HOUR_MS;

        tickets.push({
          id: ticketId++,
          condoId: condo.id,
          m,
          category: cat.id,
          supplierId,
          openedAt,
          hours,
          closed,
          closedAt: closed ? resolvedAt : null,
          withinSla: hours <= cat.slaHours,
        });
      }

      // ----- despesas -----
      const categories = {} as CondoMonth["categories"];
      const supplierSpend: Record<string, number> = {};
      const expectedMaint = lambda * 0.37;
      const budgetBase = condo.units * condo.fee * reajuste;

      EXPENSE_CATEGORIES.forEach((cat) => {
        let share = cat.share;
        if (!condo.vertical && cat.id === "elevadores") share = 0;
        if (!condo.vertical && cat.id === "manutencao") share += 0.03;
        if (!condo.vertical && cat.id === "jardinagem") share += 0.02;
        // o orçamento anual já prevê o 13º salário em novembro/dezembro
        const budgetSeason = cat.id === "pessoal" ? (month.month === 11 ? 1.9 : month.month === 10 ? 1.35 : 1) : 1;
        const orcado = budgetBase * share * budgetSeason;
        let realizado = orcado * (1 + rng.normal(0, 0.03));

        if (cat.id === "utilidades") realizado = orcado * seasonalUtilities[month.month] * (1 + rng.normal(0, 0.04));
        if (cat.id === "manutencao")
          realizado = orcado * (0.72 + 0.3 * (maintenanceTickets / Math.max(expectedMaint, 1))) * (1 + rng.normal(0, 0.05));
        if (cat.id === "obras") {
          const work = WORKS.find((w) => w.condo === ci && w.months.includes(m));
          realizado = work ? orcado * work.factor * (1 + rng.normal(0, 0.08)) : rng.chance(0.7) ? orcado * rng.range(0.6, 1.4) : 0;
          if (work) supplierSpend[work.supplier] = (supplierSpend[work.supplier] ?? 0) + realizado;
        }
        if (cat.id === "administracao") realizado = orcado;
        realizado = Math.max(0, realizado);
        categories[cat.id] = { orcado, realizado };

        if (cat.id === "limpeza") supplierSpend[condo.suppliers.limpeza] = realizado;
        if (cat.id === "seguranca") supplierSpend[condo.suppliers.seguranca] = realizado;
        if (cat.id === "elevadores" && condo.suppliers.elevadores) supplierSpend[condo.suppliers.elevadores] = realizado;
        if (cat.id === "jardinagem") supplierSpend.verdevivo = realizado;
        if (cat.id === "manutencao") {
          const h = condo.suppliers.hidraulica;
          const e = condo.suppliers.eletrica;
          supplierSpend[h] = (supplierSpend[h] ?? 0) + realizado * 0.6;
          supplierSpend[e] = (supplierSpend[e] ?? 0) + realizado * 0.4;
        }
      });
      // CFTV é contrato fixo dentro de segurança; separa uma fração para o fornecedor de sistemas
      const cftv = categories.seguranca.realizado * 0.08;
      supplierSpend[condo.suppliers.seguranca] -= cftv;
      supplierSpend.olhovivo = cftv;

      const orcado = sum(Object.values(categories).map((c) => c.orcado));
      const realizado = sum(Object.values(categories).map((c) => c.realizado));

      records.push({ condoId: condo.id, m, previsto, recebido, inad, orcado, realizado, categories, supplierSpend });
      prevPrevisto = previsto;
      prevInad = inad;
    });
  });

  return { condos, records, tickets };
}

export const condoData = generate();
export const condoById = Object.fromEntries(condoData.condos.map((c) => [c.id, c])) as Record<string, Condo>;
export const WORKS_INFO = WORKS.map((w) => ({
  condo: condoData.condos[w.condo],
  months: w.months.map((m) => MONTHS[m].label),
  description: w.description,
}));

/* ------------------------------------------------------------------ */
/* Consultas usadas pelo dashboard e pelos insights                    */
/* ------------------------------------------------------------------ */

export type CondoFilters = {
  /** quantidade de meses mais recentes */
  period: 3 | 6 | 12;
  region: Region | "all";
  condoId: string | "all";
};

export const DEFAULT_CONDO_FILTERS: CondoFilters = { period: 12, region: "all", condoId: "all" };

export function filterCondos(f: CondoFilters) {
  return condoData.condos.filter(
    (c) => (f.region === "all" || c.region === f.region) && (f.condoId === "all" || c.id === f.condoId),
  );
}

export function periodMonths(period: number) {
  return MONTHS.slice(MONTHS.length - period);
}

function scope(f: CondoFilters) {
  const ids = new Set(filterCondos(f).map((c) => c.id));
  const firstM = MONTHS.length - f.period;
  return { ids, firstM };
}

const weightedInad = (rows: CondoMonth[]) => {
  const prev = sum(rows.map((r) => r.previsto));
  return prev ? sum(rows.map((r) => r.previsto * r.inad)) / prev : 0;
};

export function monthlySeries(f: CondoFilters) {
  const { ids, firstM } = scope(f);
  return periodMonths(f.period).map((month) => {
    const rows = condoData.records.filter((r) => r.m === month.index && ids.has(r.condoId));
    const opened = condoData.tickets.filter((t) => t.m === month.index && ids.has(t.condoId));
    const closedIn = condoData.tickets.filter(
      (t) => t.closed && ids.has(t.condoId) && t.closedAt !== null && isInMonth(t.closedAt, month),
    );
    const onTime = closedIn.filter((t) => t.withinSla).length;
    return {
      label: month.label,
      m: month.index,
      previsto: sum(rows.map((r) => r.previsto)),
      recebido: sum(rows.map((r) => r.recebido)),
      orcado: sum(rows.map((r) => r.orcado)),
      realizado: sum(rows.map((r) => r.realizado)),
      inad: weightedInad(rows),
      abertos: opened.length,
      encerrados: closedIn.length,
      sla: closedIn.length ? onTime / closedIn.length : 0,
      tma: closedIn.length ? sum(closedIn.map((t) => t.hours)) / closedIn.length : 0,
      firstM,
    };
  });
}

function isInMonth(ts: number, month: MonthRef) {
  const d = new Date(ts);
  return d.getFullYear() === month.year && d.getMonth() === month.month;
}

export function kpis(f: CondoFilters) {
  const { ids, firstM } = scope(f);
  const rows = condoData.records.filter((r) => r.m >= firstM && ids.has(r.condoId));
  const periodTickets = condoData.tickets.filter((t) => t.m >= firstM && ids.has(t.condoId));
  const closed = periodTickets.filter((t) => t.closed);
  const openNow = condoData.tickets.filter((t) => !t.closed && ids.has(t.condoId));
  const lastM = MONTHS.length - 1;
  const lastRows = rows.filter((r) => r.m === lastM);
  const prevRows = condoData.records.filter((r) => r.m === lastM - 3 && ids.has(r.condoId));

  return {
    condos: ids.size,
    units: sum(filterCondos(f).map((c) => c.units)),
    previsto: sum(rows.map((r) => r.previsto)),
    recebido: sum(rows.map((r) => r.recebido)),
    orcado: sum(rows.map((r) => r.orcado)),
    realizado: sum(rows.map((r) => r.realizado)),
    inadAtual: weightedInad(lastRows),
    inadVar: weightedInad(lastRows) - weightedInad(prevRows),
    abertosNoPeriodo: periodTickets.length,
    encerrados: closed.length,
    abertosAgora: openNow.length,
    abertosAtrasados: openNow.filter((t) => !t.withinSla).length,
    sla: closed.length ? closed.filter((t) => t.withinSla).length / closed.length : 0,
    tma: closed.length ? sum(closed.map((t) => t.hours)) / closed.length : 0,
  };
}

export type CondoRow = {
  condo: Condo;
  inadAtual: number;
  inadAnterior: number;
  inadTrend: number[];
  mesesEmAlta: number;
  recebido: number;
  realizado: number;
  orcado: number;
  desvio: number;
  chamados: number;
  slaPct: number;
};

export function condoRanking(f: CondoFilters): CondoRow[] {
  const { firstM } = scope(f);
  const lastM = MONTHS.length - 1;
  return filterCondos(f).map((condo) => {
    const all = condoData.records.filter((r) => r.condoId === condo.id);
    const inPeriod = all.filter((r) => r.m >= firstM);
    const trend = all.map((r) => r.inad);
    const last3 = trend.slice(lastM - 2);
    const prev3 = trend.slice(lastM - 5, lastM - 2);
    let mesesEmAlta = 0;
    for (let i = trend.length - 1; i > 0 && trend[i] > trend[i - 1] + 0.002; i--) mesesEmAlta++;
    const orcado = sum(inPeriod.map((r) => r.orcado));
    const realizado = sum(inPeriod.map((r) => r.realizado));
    const t = condoData.tickets.filter((x) => x.condoId === condo.id && x.m >= firstM && x.closed);
    return {
      condo,
      inadAtual: last3.reduce((s, v) => s + v, 0) / last3.length,
      inadAnterior: prev3.reduce((s, v) => s + v, 0) / prev3.length,
      inadTrend: trend,
      mesesEmAlta,
      recebido: sum(inPeriod.map((r) => r.recebido)),
      realizado,
      orcado,
      desvio: orcado ? realizado / orcado - 1 : 0,
      chamados: condoData.tickets.filter((x) => x.condoId === condo.id && x.m >= firstM).length,
      slaPct: t.length ? t.filter((x) => x.withinSla).length / t.length : 0,
    };
  });
}

export function categoryBudget(f: CondoFilters) {
  const { ids, firstM } = scope(f);
  const rows = condoData.records.filter((r) => r.m >= firstM && ids.has(r.condoId));
  return EXPENSE_CATEGORIES.map((cat) => {
    const orcado = sum(rows.map((r) => r.categories[cat.id].orcado));
    const realizado = sum(rows.map((r) => r.categories[cat.id].realizado));
    return { id: cat.id, label: cat.label, orcado, realizado, desvio: orcado ? realizado / orcado - 1 : 0 };
  }).filter((c) => c.orcado > 0);
}

export type SupplierRow = {
  supplier: Supplier;
  gasto: number;
  chamados: number;
  encerrados: number;
  slaPct: number;
  slaAnterior: number;
  tma: number;
  abertosAtrasados: number;
  condos: number;
};

export function supplierStats(f: CondoFilters): SupplierRow[] {
  const { ids, firstM } = scope(f);
  const rows = condoData.records.filter((r) => r.m >= firstM && ids.has(r.condoId));
  const lastM = MONTHS.length - 1;
  return SUPPLIERS.map((supplier) => {
    const gasto = sum(rows.map((r) => r.supplierSpend[supplier.id] ?? 0));
    const tk = condoData.tickets.filter((t) => t.supplierId === supplier.id && ids.has(t.condoId));
    const inPeriod = tk.filter((t) => t.m >= firstM);
    const closed = inPeriod.filter((t) => t.closed);
    const recent = tk.filter((t) => t.closed && t.m > lastM - 3);
    const before = tk.filter((t) => t.closed && t.m <= lastM - 3 && t.m > lastM - 6);
    const pct = (list: Ticket[]) => (list.length ? list.filter((t) => t.withinSla).length / list.length : 0);
    const condos = new Set(rows.filter((r) => (r.supplierSpend[supplier.id] ?? 0) > 0).map((r) => r.condoId)).size;
    return {
      supplier,
      gasto,
      chamados: inPeriod.length,
      encerrados: closed.length,
      slaPct: pct(closed),
      slaAnterior: pct(before),
      tma: closed.length ? sum(closed.map((t) => t.hours)) / closed.length : 0,
      abertosAtrasados: tk.filter((t) => !t.closed && !t.withinSla).length,
      condos,
    };
  }).filter((s) => s.gasto > 0 || s.chamados > 0);
}

/** SLA recente (3 meses) vs trimestre anterior, por fornecedor */
export function supplierRecentSla(supplierId: string, ids?: Set<string>) {
  const lastM = MONTHS.length - 1;
  const tk = condoData.tickets.filter((t) => t.supplierId === supplierId && t.closed && (!ids || ids.has(t.condoId)));
  const pct = (list: Ticket[]) => (list.length ? list.filter((t) => t.withinSla).length / list.length : 0);
  return {
    recent: pct(tk.filter((t) => t.m > lastM - 3)),
    before: pct(tk.filter((t) => t.m <= lastM - 3 && t.m > lastM - 6)),
  };
}

export function ticketsByCategory(f: CondoFilters) {
  const { ids, firstM } = scope(f);
  return TICKET_CATEGORIES.map((cat) => {
    const tk = condoData.tickets.filter((t) => t.category === cat.id && t.m >= firstM && ids.has(t.condoId));
    const closed = tk.filter((t) => t.closed);
    return {
      id: cat.id,
      label: cat.label,
      slaHours: cat.slaHours,
      total: tk.length,
      abertos: tk.filter((t) => !t.closed).length,
      slaPct: closed.length ? closed.filter((t) => t.withinSla).length / closed.length : 0,
      tma: closed.length ? sum(closed.map((t) => t.hours)) / closed.length : 0,
    };
  }).filter((c) => c.total > 0);
}

export function openTicketsLate(f: CondoFilters, limit = 8) {
  const { ids } = scope(f);
  return condoData.tickets
    .filter((t) => !t.closed && !t.withinSla && ids.has(t.condoId))
    .sort((a, b) => b.hours / ticketCategoryById[b.category].slaHours - a.hours / ticketCategoryById[a.category].slaHours)
    .slice(0, limit)
    .map((t) => ({
      ...t,
      condo: condoById[t.condoId],
      supplier: supplierById[t.supplierId],
      categoryLabel: ticketCategoryById[t.category].label,
      slaHours: ticketCategoryById[t.category].slaHours,
    }));
}

/** Resumo usado no case, na home e nos insights */
export function condoHeadline() {
  const k = kpis(DEFAULT_CONDO_FILTERS);
  const ranking = condoRanking(DEFAULT_CONDO_FILTERS);
  const rising = ranking
    .filter((r) => r.inadAtual - r.inadAnterior > 0.015)
    .sort((a, b) => b.inadAtual - b.inadAnterior - (a.inadAtual - a.inadAnterior));
  const suppliers = supplierStats(DEFAULT_CONDO_FILTERS).filter((s) => s.encerrados >= 30);
  const worstSla = [...suppliers].sort((a, b) => a.slaPct - b.slaPct)[0];
  const worsening = [...suppliers]
    .map((s) => ({ ...s, delta: supplierRecentSla(s.supplier.id).recent - s.slaAnterior }))
    .sort((a, b) => a.delta - b.delta)[0];
  const overBudget = [...ranking].sort((a, b) => b.desvio - a.desvio).slice(0, 3);
  return { k, rising, worstSla, worsening, overBudget };
}
