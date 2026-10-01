/**
 * CASE 3 — Contas a receber de uma empresa de serviços (empresa fictícia)
 *
 * Regras de negócio usadas na simulação:
 *  - ~360 clientes com contratos mensais de facilities (limpeza, portaria, manutenção)
 *  - títulos mensais com vencimento no dia escolhido pelo cliente (5, 10, 15, 20 ou 25)
 *  - perfis de pagamento recorrentes: pontual, eventual, atrasa com frequência, crítico
 *  - escolas atrasam mais em janeiro/fevereiro e julho (caixa sazonal)
 *  - alguns clientes críticos param de pagar a partir de um mês e acumulam títulos
 *  - títulos já emitidos para os próximos 3 meses (contratos recorrentes)
 */
import { createRng } from "@/lib/random";
import { buildMonths, DAY_MS, REFERENCE_DATE, sum, type MonthRef } from "./common";

export const COMPANY_NAME = "Serrano Facilities";

/** 12 meses de histórico + 3 meses à frente */
const HISTORY = buildMonths(12);
const FUTURE: MonthRef[] = [1, 2, 3].map((i) => {
  const d = new Date(REFERENCE_DATE.getFullYear(), REFERENCE_DATE.getMonth() + i, 1);
  const short = ["jan", "fev", "mar", "abr", "mai", "jun", "jul", "ago", "set", "out", "nov", "dez"];
  return {
    index: 11 + i,
    year: d.getFullYear(),
    month: d.getMonth(),
    key: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`,
    label: `${short[d.getMonth()]}/${String(d.getFullYear()).slice(2)}`,
    longLabel: "",
  };
});
export const MONTHS = HISTORY;
export const ALL_MONTHS = [...HISTORY, ...FUTURE];

export const SEGMENTS = ["Condomínios", "Comércio e varejo", "Educação", "Indústria", "Saúde"] as const;
export type Segment = (typeof SEGMENTS)[number];

export type PayProfile = "pontual" | "eventual" | "atrasa" | "critico";
export const PROFILE_LABEL: Record<PayProfile, string> = {
  pontual: "Pontual",
  eventual: "Atraso eventual",
  atrasa: "Atraso recorrente",
  critico: "Crítico",
};

export type Client = {
  id: number;
  name: string;
  segment: Segment;
  contract: number;
  dueDay: number;
  profile: PayProfile;
  /** mês (índice) em que o cliente crítico deixa de pagar */
  defaultFrom: number | null;
};

export type Title = {
  id: string;
  clientId: number;
  m: number;
  issuedAt: number;
  dueAt: number;
  value: number;
  paidAt: number | null;
};

const NAMES: Record<Segment, [string[], string[]]> = {
  Condomínios: [
    ["Condomínio", "Residencial", "Edifício"],
    ["Parque das Flores", "Vila Real", "Alto da Serra", "Jardim Europa", "Bela Vista", "Monte Carlo", "Solar", "Mirante", "Portal do Sol", "Villa Toscana", "Ilhas Gregas", "Vale Verde", "Terra Nova", "Maison Blanche", "Porto Seguro", "Recanto", "Belvedere", "Aquarela", "Horizonte", "Primavera"],
  ],
  "Comércio e varejo": [
    ["Lojas", "Supermercado", "Atacado", "Magazine", "Rede"],
    ["Paulistão", "Bom Preço", "Central", "Nova Era", "Popular", "Estrela", "Real", "Vitória", "Cidade", "União", "Ponto Certo", "Mais Econômico", "Família", "Brasil", "Aliança"],
  ],
  Educação: [
    ["Colégio", "Escola", "Instituto", "Centro Educacional"],
    ["Santa Clara", "Monteiro Lobato", "Aprender", "Novo Saber", "Pequeno Príncipe", "São Francisco", "Horizonte", "Crescer", "Integração", "Vértice", "Dom Bosco", "Arco-Íris"],
  ],
  Indústria: [
    ["Metalúrgica", "Indústria", "Plásticos", "Têxtil", "Embalagens"],
    ["Ferrari & Filhos", "Paulista", "Andrade", "Guarani", "Itapeva", "Tamoio", "Santa Fé", "Moreira", "Anhanguera", "Sorocabana", "Tietê"],
  ],
  Saúde: [
    ["Clínica", "Laboratório", "Centro Médico", "Hospital Dia"],
    ["Vida Plena", "São Lucas", "Bem Estar", "Santa Mônica", "Saúde Total", "Life", "Esperança", "Cuidar", "Nova Vida", "Integral"],
  ],
};

function generate() {
  const rng = createRng(7310);
  const refTs = REFERENCE_DATE.getTime();
  const clients: Client[] = [];
  const used = new Set<string>();

  for (let i = 0; i < 362; i++) {
    const segment = rng.weighted(SEGMENTS, [0.4, 0.2, 0.15, 0.13, 0.12]);
    const [prefixes, suffixes] = NAMES[segment];
    let name = `${rng.pick(prefixes)} ${rng.pick(suffixes)}`;
    let n = 2;
    while (used.has(name)) name = `${rng.pick(prefixes)} ${rng.pick(suffixes)} ${n++ > 2 ? "Unidade " + n : "II"}`;
    used.add(name);

    const base = segment === "Indústria" ? 14000 : segment === "Saúde" ? 9500 : segment === "Comércio e varejo" ? 7800 : segment === "Educação" ? 8500 : 5200;
    let profile = rng.weighted<PayProfile>(["pontual", "eventual", "atrasa", "critico"], [0.62, 0.22, 0.11, 0.05]);
    if (segment === "Educação" && profile === "pontual" && rng.chance(0.3)) profile = "eventual";
    clients.push({
      id: i + 1,
      name,
      segment,
      contract: Math.round(rng.lognormal(base, 0.55) / 10) * 10,
      dueDay: rng.weighted([5, 10, 15, 20, 25], [0.3, 0.3, 0.15, 0.15, 0.1]),
      profile,
      defaultFrom: profile === "critico" ? rng.int(4, 10) : null,
    });
  }

  // Histórias: dois clientes grandes entram em atraso relevante nos últimos meses
  const big = [...clients].filter((c) => c.segment === "Indústria" || c.segment === "Comércio e varejo").sort((a, b) => b.contract - a.contract);
  big[1].profile = "critico";
  big[1].defaultFrom = 9;
  big[4].profile = "atrasa";

  const titles: Title[] = [];
  clients.forEach((c) => {
    ALL_MONTHS.forEach((month) => {
      const dueAt = new Date(month.year, month.month, c.dueDay).getTime();
      // contratos recorrentes: parcelas futuras já ficam programadas no contas a receber
      const issuedAt = dueAt - 20 * DAY_MS;
      // reajuste anual em janeiro e serviços extras eventuais
      const reajuste = month.year >= 2026 ? 1.048 : 1;
      const extra = rng.chance(0.08) ? c.contract * rng.range(0.1, 0.45) : 0;
      const value = Math.round((c.contract * reajuste + extra) * 100) / 100;

      let delayDays: number | null;
      const schoolSeason = c.segment === "Educação" && [0, 1, 6].includes(month.month);
      switch (c.profile) {
        case "pontual":
          delayDays = Math.min(2, Math.round(rng.normal(-1.5, 1.5)));
          if (schoolSeason && rng.chance(0.25)) delayDays = rng.int(5, 25);
          break;
        case "eventual":
          delayDays = rng.chance(schoolSeason ? 0.55 : 0.22) ? rng.int(3, 24) : Math.round(rng.normal(-0.5, 1.5));
          break;
        case "atrasa":
          delayDays = Math.round(Math.max(3, rng.lognormal(19, 0.55)));
          break;
        case "critico":
          delayDays =
            c.defaultFrom !== null && month.index >= c.defaultFrom
              ? rng.chance(0.12)
                ? rng.int(40, 90)
                : null
              : Math.round(rng.range(12, 45));
          break;
      }
      const paidAt = delayDays === null ? null : dueAt + delayDays * DAY_MS;

      titles.push({
        id: `NF-${month.key.replace("-", "")}-${String(c.id).padStart(4, "0")}`,
        clientId: c.id,
        m: month.index,
        issuedAt,
        dueAt,
        value,
        paidAt: paidAt !== null && paidAt <= refTs ? paidAt : null,
      });
    });
  });

  return { clients, titles };
}

export const finData = generate();
export const finClientById = Object.fromEntries(finData.clients.map((c) => [c.id, c])) as Record<number, Client>;

/* ------------------------------------------------------------------ */
/* Consultas                                                           */
/* ------------------------------------------------------------------ */

const REF = REFERENCE_DATE.getTime();
const daysBetween = (a: number, b: number) => Math.floor((b - a) / DAY_MS);

export type FinFilters = { segment: Segment | "all"; profile: PayProfile | "all" };
export const DEFAULT_FIN_FILTERS: FinFilters = { segment: "all", profile: "all" };

function clientMatch(clientId: number, f: FinFilters) {
  const c = finClientById[clientId];
  return (f.segment === "all" || c.segment === f.segment) && (f.profile === "all" || c.profile === f.profile);
}

export const openTitles = (f: FinFilters) => finData.titles.filter((t) => t.paidAt === null && clientMatch(t.clientId, f));

export const AGING_BUCKETS = [
  { id: "av60", label: "A vencer 31–90 d", kind: "a_vencer" },
  { id: "av30", label: "A vencer 0–30 d", kind: "a_vencer" },
  { id: "v15", label: "1–15 d", kind: "vencido" },
  { id: "v30", label: "16–30 d", kind: "vencido" },
  { id: "v60", label: "31–60 d", kind: "vencido" },
  { id: "v90", label: "61–90 d", kind: "vencido" },
  { id: "v90p", label: "+90 d", kind: "vencido" },
] as const;
export type AgingBucketId = (typeof AGING_BUCKETS)[number]["id"];

export function bucketOf(t: Title): AgingBucketId {
  const late = daysBetween(t.dueAt, REF);
  if (late <= 0) return -late <= 30 ? "av30" : "av60";
  if (late <= 15) return "v15";
  if (late <= 30) return "v30";
  if (late <= 60) return "v60";
  if (late <= 90) return "v90";
  return "v90p";
}

export function finKpis(f: FinFilters) {
  const open = openTitles(f);
  const overdue = open.filter((t) => t.dueAt < REF);
  const upcoming = open.filter((t) => t.dueAt >= REF);
  const next30 = upcoming.filter((t) => t.dueAt - REF <= 30 * DAY_MS);
  const over30 = overdue.filter((t) => daysBetween(t.dueAt, REF) > 30);

  // Carteira dos últimos 12 meses vencidos (base para inadimplência)
  const yearAgo = REF - 365 * DAY_MS;
  const dueLastYear = finData.titles.filter((t) => t.dueAt >= yearAgo && t.dueAt < REF - 30 * DAY_MS && clientMatch(t.clientId, f));
  const unpaidOver30 = dueLastYear.filter((t) => t.paidAt === null);

  // Prazo médio de recebimento: média ponderada dos dias entre emissão e pagamento (últimos 90 dias)
  const paidRecent = finData.titles.filter((t) => t.paidAt !== null && t.paidAt >= REF - 90 * DAY_MS && clientMatch(t.clientId, f));
  const pmr = sum(paidRecent.map((t) => ((t.paidAt as number) - t.issuedAt) / DAY_MS * t.value)) / Math.max(1, sum(paidRecent.map((t) => t.value)));
  const atrasoMedio = sum(paidRecent.map((t) => Math.max(0, ((t.paidAt as number) - t.dueAt) / DAY_MS) * t.value)) / Math.max(1, sum(paidRecent.map((t) => t.value)));

  return {
    totalAberto: sum(open.map((t) => t.value)),
    vencido: sum(overdue.map((t) => t.value)),
    vencidoTitulos: overdue.length,
    vencidoClientes: new Set(overdue.map((t) => t.clientId)).size,
    aVencer: sum(upcoming.map((t) => t.value)),
    aVencer30: sum(next30.map((t) => t.value)),
    aVencer30Titulos: next30.length,
    vencidoMais30: sum(over30.map((t) => t.value)),
    inadimplencia: sum(unpaidOver30.map((t) => t.value)) / Math.max(1, sum(dueLastYear.map((t) => t.value))),
    pmr,
    atrasoMedio,
    clientes: finData.clients.filter((c) => clientMatch(c.id, f)).length,
  };
}

export function aging(f: FinFilters) {
  const open = openTitles(f);
  return AGING_BUCKETS.map((b) => {
    const rows = open.filter((t) => bucketOf(t) === b.id);
    return { ...b, value: sum(rows.map((t) => t.value)), titles: rows.length };
  });
}

/** Evolução mensal por mês de vencimento: pago no prazo, pago com atraso, em aberto */
export function monthlyEvolution(f: FinFilters) {
  return MONTHS.map((m) => {
    const rows = finData.titles.filter((t) => t.m === m.index && clientMatch(t.clientId, f));
    const due = sum(rows.map((t) => t.value));
    const onTime = sum(rows.filter((t) => t.paidAt !== null && t.paidAt <= t.dueAt + DAY_MS).map((t) => t.value));
    const late = sum(rows.filter((t) => t.paidAt !== null && t.paidAt > t.dueAt + DAY_MS).map((t) => t.value));
    const open = sum(rows.filter((t) => t.paidAt === null && t.dueAt < REF).map((t) => t.value));
    const notDue = sum(rows.filter((t) => t.paidAt === null && t.dueAt >= REF).map((t) => t.value));
    const received = sum(
      finData.titles
        .filter((t) => t.paidAt !== null && clientMatch(t.clientId, f))
        .filter((t) => {
          const d = new Date(t.paidAt as number);
          return d.getFullYear() === m.year && d.getMonth() === m.month;
        })
        .map((t) => t.value),
    );
    return {
      label: m.label,
      faturado: due,
      noPrazo: onTime,
      comAtraso: late,
      emAberto: open,
      aVencer: notDue,
      recebido: received,
      pontualidade: due ? onTime / due : 0,
    };
  });
}

export type DebtorRow = {
  client: Client;
  vencido: number;
  titulos: number;
  maiorAtraso: number;
  historicoAtraso: number;
  acao: "Lembrete" | "Cobrança ativa" | "Negociação" | "Suspensão / jurídico";
};

export function topDebtors(f: FinFilters, limit = 10): DebtorRow[] {
  const overdue = openTitles(f).filter((t) => t.dueAt < REF);
  const byClient = new Map<number, Title[]>();
  overdue.forEach((t) => byClient.set(t.clientId, [...(byClient.get(t.clientId) ?? []), t]));
  return [...byClient.entries()]
    .map(([clientId, list]) => {
      const client = finClientById[clientId];
      const maiorAtraso = Math.max(...list.map((t) => daysBetween(t.dueAt, REF)));
      const paid = finData.titles.filter((t) => t.clientId === clientId && t.paidAt !== null);
      const historicoAtraso = paid.length ? paid.filter((t) => (t.paidAt as number) > t.dueAt + DAY_MS).length / paid.length : 1;
      const acao: DebtorRow["acao"] =
        maiorAtraso > 90 ? "Suspensão / jurídico" : maiorAtraso > 30 ? "Negociação" : maiorAtraso > 7 ? "Cobrança ativa" : "Lembrete";
      return { client, vencido: sum(list.map((t) => t.value)), titulos: list.length, maiorAtraso, historicoAtraso, acao };
    })
    .sort((a, b) => b.vencido - a.vencido)
    .slice(0, limit);
}

/**
 * Previsão de recebimento para as próximas 8 semanas.
 * Nominal = títulos a vencer na semana. Esperado = ajustado pelo histórico
 * de pontualidade de cada cliente + recuperação estimada de vencidos.
 */
export function forecast(f: FinFilters) {
  const open = openTitles(f);
  const onTimeRate = new Map<number, number>();
  finData.clients.forEach((c) => {
    const paid = finData.titles.filter((t) => t.clientId === c.id && t.paidAt !== null && t.m >= 3);
    const all = finData.titles.filter((t) => t.clientId === c.id && t.dueAt < REF - 7 * DAY_MS && t.m >= 3);
    const ontime = paid.filter((t) => (t.paidAt as number) <= t.dueAt + 7 * DAY_MS).length;
    onTimeRate.set(c.id, all.length ? ontime / all.length : 0.8);
  });
  const overdue = open.filter((t) => t.dueAt < REF);
  const weeks = [];
  for (let w = 0; w < 8; w++) {
    const start = REF + w * 7 * DAY_MS;
    const end = start + 7 * DAY_MS;
    const due = open.filter((t) => t.dueAt >= start && t.dueAt < end);
    const nominal = sum(due.map((t) => t.value));
    const expectedDue = sum(due.map((t) => t.value * (onTimeRate.get(t.clientId) ?? 0.8)));
    // parte dos títulos vencidos há até 60 dias costuma ser recuperada ao longo das semanas
    const recovery = sum(overdue.filter((t) => daysBetween(t.dueAt, REF) <= 60).map((t) => t.value)) * 0.07 * Math.pow(0.85, w);
    const d = new Date(start);
    weeks.push({
      label: `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}`,
      nominal,
      esperado: expectedDue + recovery,
    });
  }
  return weeks;
}

export function segmentExposure(f: FinFilters) {
  return SEGMENTS.filter((s) => f.segment === "all" || s === f.segment).map((segment) => {
    const sf = { ...f, segment };
    const k = finKpis(sf);
    return { segment, vencido: k.vencido, aberto: k.totalAberto, inad: k.inadimplencia, clientes: k.clientes };
  });
}

/** Resumo dos títulos que vencem em 7 dias (total e de clientes com histórico de atraso) */
export function upcomingRisk(f: FinFilters) {
  const open = openTitles(f).filter((t) => t.dueAt >= REF && t.dueAt - REF <= 7 * DAY_MS);
  const risky = upcomingRiskyTitles(f, 7);
  return {
    total: open.length,
    totalValue: sum(open.map((t) => t.value)),
    risky: risky.length,
    riskyValue: sum(risky.map((t) => t.value)),
  };
}

/** Fila da régua de cobrança na data de referência */
export function collectionQueue(f: FinFilters) {
  const open = openTitles(f);
  const late = (t: Title) => daysBetween(t.dueAt, REF);
  const stage = (label: string, rule: string, list: Title[]) => ({ label, rule, titulos: list.length, valor: sum(list.map((t) => t.value)) });
  return [
    stage("Lembrete preventivo", "vence em até 5 dias · clientes com histórico de atraso", open.filter((t) => late(t) <= 0 && late(t) >= -5 && ["atrasa", "critico"].includes(finClientById[t.clientId].profile))),
    stage("1ª cobrança", "1 a 6 dias de atraso", open.filter((t) => late(t) >= 1 && late(t) <= 6)),
    stage("2ª cobrança", "7 a 14 dias", open.filter((t) => late(t) >= 7 && late(t) <= 14)),
    stage("3ª cobrança", "15 a 30 dias", open.filter((t) => late(t) >= 15 && late(t) <= 30)),
    stage("Negociação", "mais de 30 dias", open.filter((t) => late(t) > 30)),
  ];
}

/** Títulos que vencem nos próximos dias, de clientes que costumam atrasar */
export function upcomingRiskyTitles(f: FinFilters, days = 7) {
  return openTitles(f)
    .filter((t) => t.dueAt >= REF && t.dueAt - REF <= days * DAY_MS)
    .map((t) => {
      const client = finClientById[t.clientId];
      const paid = finData.titles.filter((x) => x.clientId === t.clientId && x.paidAt !== null);
      const lateShare = paid.length ? paid.filter((x) => (x.paidAt as number) > x.dueAt + DAY_MS).length / paid.length : 1;
      return { ...t, client, lateShare };
    })
    .filter((t) => t.lateShare >= 0.4)
    .sort((a, b) => b.value * b.lateShare - a.value * a.lateShare);
}

export function finHeadline() {
  const k = finKpis(DEFAULT_FIN_FILTERS);
  const debtors = topDebtors(DEFAULT_FIN_FILTERS, 10);
  const top5 = sum(debtors.slice(0, 5).map((d) => d.vencido));
  const evo = monthlyEvolution(DEFAULT_FIN_FILTERS);
  const edu = segmentExposure(DEFAULT_FIN_FILTERS).find((s) => s.segment === "Educação")!;
  return {
    k,
    debtors,
    top5Share: k.vencido ? top5 / k.vencido : 0,
    evo,
    edu,
    risk: upcomingRisk(DEFAULT_FIN_FILTERS),
    clients: finData.clients.length,
    titles: finData.titles.length,
    fc: forecast(DEFAULT_FIN_FILTERS),
  };
}
