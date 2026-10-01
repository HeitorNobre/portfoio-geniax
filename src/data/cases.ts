/**
 * Conteúdo dos cases demonstrativos.
 * IMPORTANTE: todas as empresas são fictícias e os dados são simulados.
 * Números citados nos textos são calculados a partir dos datasets em /data/mock,
 * para que texto e dashboard nunca se contradigam.
 */
import { formatBRLCompact, formatNumber, formatPct } from "@/lib/format";
import { REFERENCE_LABEL } from "./mock/common";
import * as condo from "./mock/condominios";
import * as dist from "./mock/distribuidora";
import * as fin from "./mock/financeiro";

export type FlowStep = { label: string; detail: string; manual?: boolean };
export type ManualTask = { task: string; frequency: string; time: string; risk: string };
export type Insight = { title: string; text: string; tone: "bad" | "warn" | "good" | "info" };

export type CaseStudy = {
  slug: string;
  dashboard: "condominios" | "distribuidora" | "financeiro";
  segment: string;
  company: string;
  title: string;
  cardTitle: string;
  tagline: string;
  cardSummary: string;
  seoTitle: string;
  seoDescription: string;
  facts: { label: string; value: string }[];
  sources: string[];
  questions: string[];
  context: string[];
  problem: string[];
  before: FlowStep[];
  manualTasks: ManualTask[];
  manualTotal: string;
  bottleneck: string[];
  solution: string[];
  after: FlowStep[];
  automation: { title: string; text: string; when: string }[];
  architecture: { sources: string[]; processing: string[]; storage: string[]; outputs: string[] };
  insights: Insight[];
  benefits: { title: string; text: string }[];
  deliverables: string[];
};

/* ------------------------------------------------------------------ */
/* Case 1 — Administradora de condomínios                              */
/* ------------------------------------------------------------------ */

function buildCondoCase(): CaseStudy {
  const h = condo.condoHeadline();
  const k = h.k;
  const suppliersCount = condo.SUPPLIERS.length;
  const rising = h.rising;
  const worst = h.worstSla;
  const worsening = h.worsening;
  const worseningRecent = condo.supplierRecentSla(worsening.supplier.id).recent;
  const topOver = h.overBudget.slice(0, 2).map((o) => ({ ...o, work: condo.WORKS_INFO.find((w) => w.condo.id === o.condo.id) }));
  const hidraulica = condo.ticketsByCategory(condo.DEFAULT_CONDO_FILTERS).find((c) => c.id === "hidraulica")!;

  return {
    slug: "administradora-condominios",
    dashboard: "condominios",
    segment: "Administradora de condomínios",
    company: condo.COMPANY_NAME,
    title: "Gestão consolidada de 40 condomínios: financeiro, chamados e fornecedores em um só lugar",
    cardTitle: "Administradora de condomínios",
    tagline:
      "Da exportação manual de relatórios por condomínio para uma base consolidada que mostra inadimplência, orçamento, SLA e fornecedores automaticamente.",
    cardSummary: "Inadimplência, orçado x realizado, chamados e SLA de fornecedores de 40 condomínios.",
    seoTitle: "Case demonstrativo: dashboard e automação para administradora de condomínios",
    seoDescription:
      "Projeto conceitual com dados simulados: automação da consolidação de relatórios e dashboard de inadimplência, orçamento, chamados e SLA de fornecedores para uma administradora de condomínios.",
    facts: [
      { label: "Condomínios", value: formatNumber(k.condos) },
      { label: "Unidades", value: formatNumber(k.units) },
      { label: "Fornecedores", value: formatNumber(suppliersCount) },
      { label: "Chamados em 12 meses", value: formatNumber(k.abertosNoPeriodo) },
    ],
    sources: ["Sistema administrativo", "Relatórios financeiros", "Planilhas de orçamento", "Sistema de chamados", "Cadastro de fornecedores"],
    questions: [
      "Quais condomínios estão aumentando a inadimplência?",
      "Quais fornecedores estão quebrando o SLA?",
      "Onde a despesa está passando do orçamento aprovado?",
      "Quantos chamados estão abertos e quais já passaram do prazo?",
      "Quanto cada condomínio gasta com cada fornecedor?",
    ],
    context: [
      `A ${condo.COMPANY_NAME} (empresa fictícia) administra ${k.condos} condomínios residenciais em São Paulo, somando ${formatNumber(k.units)} unidades. A equipe cuida de cobrança, pagamento de fornecedores, prestação de contas mensal aos síndicos e atendimento de chamados de manutenção.`,
      "Cada condomínio tem orçamento anual próprio, aprovado em assembleia, e contratos com fornecedores de limpeza, portaria, elevadores, manutenção e jardinagem.",
    ],
    problem: [
      "As informações existem, mas estão em lugares diferentes: o financeiro no sistema administrativo, o orçamento em planilhas por condomínio, os chamados em outra ferramenta e o controle de fornecedores em mais uma planilha.",
      "Para saber como está a carteira, a diretoria depende de um relatório mensal montado à mão. Quando ele fica pronto, o mês já virou — e os problemas só aparecem quando o síndico reclama.",
    ],
    before: [
      { label: "Sistema administrativo", detail: "Relatórios gerados um a um, por condomínio" },
      { label: "Exportação manual", detail: "40 exportações de receitas, despesas e inadimplência", manual: true },
      { label: "Planilhas Excel", detail: "Uma planilha por condomínio, mais orçamento e chamados", manual: true },
      { label: "Tratamento manual", detail: "Ajuste de colunas, datas e nomes de fornecedores", manual: true },
      { label: "Consolidação", detail: "Copiar e colar tudo em uma planilha-mestre", manual: true },
      { label: "Relatório", detail: "Montado no fim do mês, em PDF" },
      { label: "Gestor", detail: "Recebe números de semanas atrás" },
    ],
    manualTasks: [
      { task: "Exportar relatórios financeiros de cada condomínio", frequency: "Mensal", time: "6 h", risk: "Esquecer um condomínio ou exportar o período errado" },
      { task: "Atualizar planilhas de orçado x realizado", frequency: "Mensal", time: "8 h", risk: "Fórmulas quebradas e categorias lançadas no lugar errado" },
      { task: "Levantar inadimplência por condomínio", frequency: "Semanal", time: "2 h", risk: "Tendência de alta só percebida meses depois" },
      { task: "Consolidar chamados e calcular prazos", frequency: "Semanal", time: "3 h", risk: "SLA de fornecedor sem acompanhamento objetivo" },
      { task: "Montar relatório para diretoria e síndicos", frequency: "Mensal", time: "6 h", risk: "Relatório depende de uma pessoa específica" },
    ],
    manualTotal: "≈ 40 horas por mês",
    bottleneck: [
      "O gargalo não é falta de dados — é o tempo entre o dado existir e alguém conseguir olhar para ele. Uma tendência de inadimplência leva meses para ser notada porque ninguém compara os condomínios lado a lado todo mês.",
      "Fornecedores são cobrados com base em percepção, não em números: não há registro consolidado de quantos chamados cada um atendeu dentro do prazo.",
    ],
    solution: [
      "Uma rotina automatizada coleta os dados de todas as fontes, padroniza nomes, datas e categorias, e grava tudo em uma base única e histórica.",
      "Sobre essa base, um dashboard mostra a carteira inteira em uma tela, com filtros por região e condomínio, e destaca automaticamente o que está fora do padrão: inadimplência subindo, despesa acima do orçado e fornecedores fora do SLA.",
    ],
    after: [
      { label: "Sistema + planilhas + chamados", detail: "Fontes continuam as mesmas" },
      { label: "Pipeline automatizado", detail: "Coleta diária, sem intervenção" },
      { label: "Base consolidada", detail: "Dados tratados, históricos e padronizados" },
      { label: "Dashboard", detail: "Carteira inteira em uma tela, com filtros" },
      { label: "Alertas e relatórios", detail: "Exceções avisadas e prestação de contas gerada" },
      { label: "Gestor", detail: "Acompanha a operação no dia a dia" },
    ],
    automation: [
      { when: "Diariamente, 6h", title: "Coleta das fontes", text: "Exportações do sistema administrativo e do sistema de chamados são buscadas automaticamente; planilhas de orçamento são lidas de uma pasta compartilhada." },
      { when: "Na sequência", title: "Tratamento e padronização", text: "Nomes de condomínios e fornecedores são unificados, categorias de despesa mapeadas para o plano de contas e datas normalizadas. Registros com problema vão para uma lista de conferência." },
      { when: "Na sequência", title: "Cálculo dos indicadores", text: "Inadimplência por condomínio, execução do orçamento, prazo de cada chamado contra o SLA da categoria e gasto por fornecedor." },
      { when: "Quando há exceção", title: "Alertas", text: "Aviso quando um condomínio tem 3 meses seguidos de alta na inadimplência, quando a despesa passa 10% do orçado ou quando um chamado estoura o SLA." },
      { when: "Mensal, dia 5", title: "Prestação de contas", text: "Relatório de cada condomínio gerado automaticamente a partir da mesma base, pronto para revisão e envio ao síndico." },
    ],
    architecture: {
      sources: ["Sistema administrativo (exportação agendada)", "Sistema de chamados (API)", "Planilhas de orçamento (pasta compartilhada)", "Cadastro de fornecedores"],
      processing: ["Python + Pandas", "Regras de padronização", "Validação e log de erros"],
      storage: ["Base consolidada (SQL)", "Histórico mensal por condomínio"],
      outputs: ["Dashboard gerencial", "Alertas por e-mail/Teams", "Relatório de prestação de contas"],
    },
    insights: [
      {
        tone: "bad",
        title: `${rising.length} condomínios com inadimplência em alta há meses`,
        text: `${rising
          .slice(0, 2)
          .map((r) => `${r.condo.name} (${formatPct(r.inadAnterior)} → ${formatPct(r.inadAtual)})`)
          .join(" e ")} lideram. A média da carteira fica estável em ${formatPct(k.inadAtual)} e esconde o problema — só a visão por condomínio mostra.`,
      },
      {
        tone: "bad",
        title: `${worst.supplier.name}: ${formatPct(worst.slaPct, 0)} dos chamados no prazo`,
        text: `Hidráulica é a categoria com mais chamados (${formatNumber(hidraulica.total)} em 12 meses) e a que mais estoura prazo. O fornecedor concentra ${worst.abertosAtrasados} dos ${k.abertosAtrasados} chamados abertos já fora do SLA.`,
      },
      {
        tone: "warn",
        title: `${worsening.supplier.name} vem piorando`,
        text: `O atendimento dentro do SLA caiu de ${formatPct(worsening.slaAnterior, 0)} para ${formatPct(worseningRecent, 0)} no último trimestre. Sem o histórico consolidado, a queda passaria despercebida até virar reclamação.`,
      },
      {
        tone: "warn",
        title: "Obras extraordinárias explicam o estouro de orçamento",
        text: `${topOver
          .map((o) => `${o.condo.name} (${formatPct(o.desvio)} acima do orçado${o.work ? `, ${o.work.description}` : ""})`)
          .join(" e ")} concentram o desvio. Os demais condomínios executam o orçamento dentro da margem.`,
      },
    ],
    benefits: [
      { title: "Oportunidade de redução de trabalho manual", text: "As cerca de 40 horas mensais de exportação, consolidação e montagem de relatório passam a ser executadas pela rotina automática." },
      { title: "Inadimplência acompanhada por condomínio", text: "Tendências de alta identificadas no primeiro mês, não no fechamento do trimestre." },
      { title: "Gestão de fornecedores com números", text: "SLA medido por fornecedor e categoria, base objetiva para renegociar ou substituir contratos." },
      { title: "Prestação de contas mais rápida", text: "Relatório por condomínio gerado da mesma base, com menos risco de erro de digitação." },
    ],
    deliverables: ["Rotina de coleta e tratamento agendada", "Base consolidada e histórica", "Dashboard com 4 visões", "Alertas automáticos", "Documentação e treinamento"],
  };
}

/* ------------------------------------------------------------------ */
/* Case 2 — Distribuidora                                              */
/* ------------------------------------------------------------------ */

function buildDistCase(): CaseStudy {
  const h = dist.distHeadline();
  const cur = h.k.current;
  const juliana = dist.sellerPerformance({ period: "12m", sellerId: "juliana", route: "all" })[0];
  const julianaGrowth = juliana.trend[11] / ((juliana.trend[3] + juliana.trend[4] + juliana.trend[5]) / 3) - 1;
  const othersLate = h.others.reduce((s, r) => s + r.atrasadas, 0) / Math.max(1, h.others.reduce((s, r) => s + r.entregas, 0));
  const pedidosDia = h.k12.current.pedidos / h.k12.businessDays;

  return {
    slug: "distribuidora",
    dashboard: "distribuidora",
    segment: "Distribuidora / PME operacional",
    company: dist.COMPANY_NAME,
    title: "Operação diária de uma distribuidora sem planilha manual: vendas, entregas e estoque atualizados todo dia",
    cardTitle: "Distribuidora de alimentos e bebidas",
    tagline:
      "Da planilha atualizada à mão toda manhã para um resumo automático diário e um dashboard com vendas, vendedores, entregas e estoque.",
    cardSummary: "Faturamento, desempenho por vendedor, entregas atrasadas e cobertura de estoque — atualizados diariamente.",
    seoTitle: "Case demonstrativo: automação de relatórios e dashboard para distribuidora",
    seoDescription:
      "Projeto conceitual com dados simulados: automatização do relatório diário de vendas e dashboard de faturamento, vendedores, entregas atrasadas e estoque para uma distribuidora.",
    facts: [
      { label: "Clientes na carteira", value: formatNumber(h.clients) },
      { label: "Pedidos por dia útil", value: formatNumber(pedidosDia) },
      { label: "Faturamento em 12 meses", value: formatBRLCompact(h.k12.current.faturamento) },
      { label: "Vendedores", value: formatNumber(dist.SELLERS.length) },
    ],
    sources: ["ERP (pedidos e faturamento)", "Planilha de entregas", "Posição de estoque", "Metas comerciais"],
    questions: [
      "Qual vendedor teve queda recente?",
      "Quais rotas estão atrasando mais entregas?",
      "Como está o faturamento do mês em relação ao anterior?",
      "Quais produtos correm risco de ruptura nos próximos dias?",
      "Quantos clientes compraram no período e qual o ticket médio?",
    ],
    context: [
      `A ${dist.COMPANY_NAME} (empresa fictícia) distribui alimentos, bebidas e descartáveis para ${formatNumber(h.clients)} clientes — restaurantes, bares, mercados, padarias e hotéis — em cinco rotas na Grande São Paulo.`,
      `São cerca de ${formatNumber(pedidosDia)} pedidos por dia útil, oito vendedores externos e uma equipe de separação e entrega que trabalha com prazo de entrega no dia seguinte.`,
    ],
    problem: [
      "Toda manhã, alguém do administrativo exporta os pedidos do ERP, atualiza a planilha de acompanhamento, cruza com a planilha de entregas, recalcula os indicadores e envia um resumo por WhatsApp para os sócios e para o gerente comercial.",
      "O processo leva boa parte da manhã, depende de uma pessoa e só mostra o dia anterior. Tendências — um vendedor perdendo clientes, uma rota atrasando mais — não aparecem no resumo do dia.",
    ],
    before: [
      { label: "ERP", detail: "Pedidos e faturamento do dia anterior" },
      { label: "Exportação manual", detail: "Relatórios baixados um a um toda manhã", manual: true },
      { label: "Planilhas", detail: "Vendas, entregas e estoque em arquivos separados", manual: true },
      { label: "Tratamento", detail: "Ajustes de datas, códigos de cliente e vendedor", manual: true },
      { label: "Consolidação", detail: "Fórmulas e tabelas dinâmicas refeitas", manual: true },
      { label: "Resumo", detail: "Texto montado à mão e enviado por mensagem", manual: true },
      { label: "Gestores", detail: "Recebem no meio da manhã" },
    ],
    manualTasks: [
      { task: "Exportar pedidos e faturamento do ERP", frequency: "Diária", time: "20 min", risk: "Exportar o dia errado ou com filtro incompleto" },
      { task: "Atualizar planilha de vendas por vendedor", frequency: "Diária", time: "40 min", risk: "Fórmulas arrastadas errado, linhas duplicadas" },
      { task: "Cruzar pedidos com a planilha de entregas", frequency: "Diária", time: "30 min", risk: "Atrasos não registrados ou registrados em dobro" },
      { task: "Montar e enviar o resumo para gestores", frequency: "Diária", time: "20 min", risk: "Sem resumo quando a pessoa falta" },
      { task: "Fechamento mensal por vendedor e metas", frequency: "Mensal", time: "5 h", risk: "Discussão sobre qual número vale para comissão" },
    ],
    manualTotal: "≈ 2 horas por dia + fechamento mensal",
    bottleneck: [
      "O esforço está no dia a dia: quase duas horas de trabalho manual toda manhã só para saber o que aconteceu ontem.",
      "E o resumo diário não mostra tendência. Uma queda de um vendedor ou uma rota que passou a atrasar mais só é percebida quando o problema já é grande.",
    ],
    solution: [
      "Um pipeline roda automaticamente ao fim do dia: busca pedidos, faturamento, entregas e estoque, trata e grava em uma base histórica.",
      "Os gestores recebem um resumo automático com os números do dia e as exceções que merecem atenção, e têm um dashboard para investigar vendas, vendedores, entregas e estoque com filtros por período, vendedor e rota.",
    ],
    after: [
      { label: "ERP + planilhas", detail: "Mesmas fontes de hoje" },
      { label: "Pipeline automatizado", detail: "Roda todo dia às 18h" },
      { label: "Base tratada", detail: "Histórico diário de pedidos e entregas" },
      { label: "Dashboard", detail: "Vendas, entregas e estoque com filtros" },
      { label: "Resumo e alertas", detail: "Mensagem automática com exceções" },
      { label: "Gestores", detail: "Informação no fim do dia, sem esforço" },
    ],
    automation: [
      { when: "Diariamente, 18h", title: "Coleta do ERP", text: "Pedidos, itens e faturamento do dia são exportados automaticamente do ERP (API ou relatório agendado)." },
      { when: "Na sequência", title: "Entregas e estoque", text: "Status de entrega e posição de estoque são lidos das planilhas operacionais e cruzados com os pedidos." },
      { when: "Na sequência", title: "Indicadores e metas", text: "Faturamento, ticket médio, clientes ativos, atingimento de meta por vendedor, % de atraso por rota e cobertura de estoque em dias." },
      { when: "18h30", title: "Resumo automático", text: "Mensagem para os gestores com os números do dia, comparação com a média e as exceções: vendedor em queda, rota atrasando, produto com risco de ruptura." },
      { when: "Mensal, dia 1", title: "Fechamento", text: "Relatório de fechamento por vendedor gerado da mesma base usada no dia a dia — um número só para meta e comissão." },
    ],
    architecture: {
      sources: ["ERP (pedidos, clientes, faturamento)", "Planilha de entregas", "Posição de estoque", "Metas por vendedor"],
      processing: ["Python + Pandas", "Agendamento diário", "Regras de validação"],
      storage: ["Base histórica (SQL)", "Visões por dia, vendedor e rota"],
      outputs: ["Dashboard comercial e operacional", "Resumo diário por e-mail/WhatsApp", "Relatório de fechamento mensal"],
    },
    insights: [
      {
        tone: "bad",
        title: `${h.worstSeller.seller.name}: ${formatPct(h.worstSeller.variacao)} nos últimos 30 dias`,
        text: `A queda coincide com a saída de três clientes de alto volume no fim de agosto. Setembro fechou em ${formatPct(h.worstSeller.atingimento, 0)} da meta. No resumo diário, a queda aparece diluída entre os dias; na comparação por período, fica evidente.`,
      },
      {
        tone: "bad",
        title: `Zona Leste: ${formatPct(h.leste.pct)} das entregas atrasadas`,
        text: `Até maio, a rota atrasava ${formatPct(h.leste.pctAntesJunho)} das entregas, em linha com as demais. Desde junho, o índice ${h.leste.pct / Math.max(h.leste.pctAntesJunho, 0.001) >= 2.5 ? "quase triplicou" : "mais que dobrou"}, enquanto as outras rotas seguem em ${formatPct(othersLate)}. O dashboard mostra exatamente quando a mudança começou.`,
      },
      {
        tone: "good",
        title: `Juliana: ${formatPct(julianaGrowth, 0)} acima do 1º trimestre`,
        text: "O crescimento vem de novas contas abertas a partir de abril nas zonas Norte e Leste — um padrão que vale replicar para outros vendedores.",
      },
      {
        tone: "warn",
        title: `${h.stockRisk.length} produtos com menos de 7 dias de estoque`,
        text: `${h.stockRisk
          .slice(0, 2)
          .map((s) => s.name.split(" (")[0])
          .join(" e ")} estão entre os itens com cobertura crítica, calculada pela venda média dos últimos 30 dias.`,
      },
    ],
    benefits: [
      { title: "Ganho potencial de ~2 horas por dia", text: "Exportação, consolidação e montagem do resumo deixam de ser feitas manualmente." },
      { title: "Resumo diário sem depender de ninguém", text: "A mensagem sai todo dia no mesmo horário, com os mesmos critérios." },
      { title: "Tendências visíveis, não só o dia anterior", text: "Quedas de vendedor e aumento de atraso por rota identificados em dias, não em meses." },
      { title: "Menos ruptura de estoque", text: "Cobertura em dias calculada automaticamente para antecipar a compra." },
    ],
    deliverables: ["Pipeline diário agendado", "Base histórica de pedidos e entregas", "Dashboard com 3 visões", "Resumo automático diário", "Relatório de fechamento mensal"],
  };
}

/* ------------------------------------------------------------------ */
/* Case 3 — Financeiro / contas a receber                              */
/* ------------------------------------------------------------------ */

function buildFinCase(): CaseStudy {
  const h = fin.finHeadline();
  const k = h.k;
  const fc = h.fc.slice(0, 4);
  const fcNominal = fc.reduce((s, w) => s + w.nominal, 0);
  const fcExpected = fc.reduce((s, w) => s + w.esperado, 0);
  const guarani = h.debtors.find((d) => d.maiorAtraso < 100 && d.client.segment === "Indústria");

  return {
    slug: "financeiro-cobranca",
    dashboard: "financeiro",
    segment: "Financeiro / contas a receber",
    company: fin.COMPANY_NAME,
    title: "Contas a receber sob controle: vencimentos, atrasos e cobrança organizados automaticamente",
    cardTitle: "Contas a receber e cobrança",
    tagline:
      "Das planilhas de vencimento atualizadas à mão para uma carteira classificada automaticamente, com aging, alertas de vencimento e previsão de recebimento.",
    cardSummary: "Aging, vencidos, a vencer, principais devedores e previsão de recebimento para as próximas semanas.",
    seoTitle: "Case demonstrativo: automação de contas a receber e dashboard de inadimplência",
    seoDescription:
      "Projeto conceitual com dados simulados: consolidação automática de títulos, classificação por aging, alertas de vencimento, régua de cobrança e dashboard de contas a receber.",
    facts: [
      { label: "Clientes com contrato", value: formatNumber(h.clients) },
      { label: "Títulos analisados", value: formatNumber(h.titles) },
      { label: "Vencido em aberto", value: formatBRLCompact(k.vencido) },
      { label: "A vencer em 30 dias", value: formatBRLCompact(k.aVencer30) },
    ],
    sources: ["ERP financeiro (títulos)", "Extratos bancários / retorno de boletos", "Planilhas de cobrança", "Cadastro de clientes"],
    questions: [
      "Quanto do contas a receber vence nos próximos 30 dias?",
      "Quanto está vencido e há quanto tempo?",
      "Quais clientes concentram a dívida?",
      "Quanto devemos receber de fato nas próximas semanas?",
      "Quais títulos a vencer são de clientes que costumam atrasar?",
    ],
    context: [
      `A ${fin.COMPANY_NAME} (empresa fictícia) presta serviços de limpeza, portaria e manutenção para ${formatNumber(h.clients)} clientes com contrato mensal: condomínios, comércio, escolas, indústrias e clínicas.`,
      "São centenas de títulos por mês, com vencimentos concentrados em poucos dias e clientes com comportamentos de pagamento muito diferentes.",
    ],
    problem: [
      "O controle de vencimentos e cobrança é feito em planilhas. Todo dia, a equipe baixa o retorno do banco, dá baixa manualmente nos títulos pagos e atualiza a lista de atrasados.",
      "Não existe visão consolidada de quanto está vencido por faixa de atraso, quem são os devedores recorrentes ou quanto deve entrar no caixa nas próximas semanas. A cobrança acontece quando alguém lembra.",
    ],
    before: [
      { label: "ERP financeiro", detail: "Títulos emitidos no mês" },
      { label: "Retorno bancário", detail: "Arquivos baixados do internet banking", manual: true },
      { label: "Planilha de controle", detail: "Baixa manual de cada título pago", manual: true },
      { label: "Classificação", detail: "Atrasos separados por filtro, à mão", manual: true },
      { label: "Lista de cobrança", detail: "Montada quando dá tempo", manual: true },
      { label: "Relatório", detail: "Posição de carteira no fechamento" },
      { label: "Gestor", detail: "Sem previsão confiável de caixa" },
    ],
    manualTasks: [
      { task: "Baixar retorno bancário e dar baixa nos títulos", frequency: "Diária", time: "45 min", risk: "Título pago cobrado por engano" },
      { task: "Atualizar lista de títulos vencidos", frequency: "Diária", time: "30 min", risk: "Cliente em atraso esquecido na lista" },
      { task: "Enviar lembretes e cobranças", frequency: "Diária", time: "1 h", risk: "Cobrança sem critério e sem histórico" },
      { task: "Montar aging e posição de carteira", frequency: "Semanal", time: "2 h", risk: "Números diferentes a cada versão da planilha" },
      { task: "Projetar recebimentos para o fluxo de caixa", frequency: "Semanal", time: "2 h", risk: "Previsão otimista, sem histórico de pagamento" },
    ],
    manualTotal: "≈ 2 horas por dia + 4 horas semanais",
    bottleneck: [
      "O trabalho de conciliação consome a equipe e sobra pouco tempo para cobrar. Sem classificação automática, todos os atrasados parecem iguais — um atraso de 3 dias de um cliente pontual recebe o mesmo tratamento que 90 dias de um devedor recorrente.",
      "A previsão de caixa considera que todos vão pagar em dia, o que raramente acontece.",
    ],
    solution: [
      "Uma rotina diária lê os títulos do ERP e o retorno bancário, faz a conciliação automaticamente e classifica cada título por faixa de atraso e pelo histórico de pagamento do cliente.",
      "Um dashboard mostra a carteira completa — vencidos, a vencer, aging, devedores — e uma previsão de recebimento ajustada pelo comportamento real de cada cliente. Uma régua de cobrança automática envia lembretes e cobranças no momento certo.",
    ],
    after: [
      { label: "ERP + retorno bancário", detail: "Lidos automaticamente todo dia" },
      { label: "Pipeline automatizado", detail: "Conciliação e classificação" },
      { label: "Base tratada", detail: "Títulos com status, aging e perfil do cliente" },
      { label: "Dashboard", detail: "Carteira, aging, devedores e previsão" },
      { label: "Alertas e régua", detail: "Lembretes e cobranças automáticos" },
      { label: "Gestor", detail: "Previsão de caixa confiável" },
    ],
    automation: [
      { when: "Diariamente, 7h", title: "Leitura e conciliação", text: "Títulos do ERP e arquivos de retorno do banco são lidos; pagamentos identificados dão baixa automaticamente. Divergências vão para conferência." },
      { when: "Na sequência", title: "Classificação", text: "Cada título recebe faixa de aging e cada cliente um perfil de pagamento (pontual, eventual, recorrente, crítico) com base no histórico." },
      { when: "D-5 do vencimento", title: "Lembrete preventivo", text: "E-mail automático para clientes com histórico de atraso, com boleto atualizado." },
      { when: "D+1, D+7, D+15", title: "Régua de cobrança", text: "Mensagens escalonadas conforme o atraso; a partir de D+30, o título entra na fila de negociação do time." },
      { when: "Segunda-feira, 8h", title: "Relatório semanal", text: "Posição da carteira, aging, maiores devedores e previsão de recebimento das próximas semanas para a diretoria." },
    ],
    architecture: {
      sources: ["ERP financeiro (títulos e clientes)", "Arquivos de retorno bancário (CNAB)", "Histórico de cobrança"],
      processing: ["Python + Pandas", "Regras de conciliação", "Classificação por aging e perfil"],
      storage: ["Base de títulos (SQL)", "Histórico de pagamentos por cliente"],
      outputs: ["Dashboard de contas a receber", "Régua de cobrança automática", "Relatório semanal e alertas"],
    },
    insights: [
      {
        tone: "info",
        title: `${formatBRLCompact(k.aVencer30)} vencem nos próximos 30 dias`,
        text: `Mas o histórico de pagamento indica que o recebimento efetivo das próximas 4 semanas deve ficar em torno de ${formatBRLCompact(fcExpected)}, contra ${formatBRLCompact(fcNominal)} nominais. A diferença é o que a previsão ingênua superestima.`,
      },
      {
        tone: "bad",
        title: `5 clientes concentram ${formatPct(h.top5Share, 0)} do vencido`,
        text: `Do total de ${formatBRLCompact(k.vencido)} vencidos, espalhados em ${k.vencidoClientes} clientes, uma parcela grande está em poucos contratos com mais de 90 dias de atraso — casos para negociação ou medida formal, não para lembrete.`,
      },
      {
        tone: "warn",
        title: guarani ? `${guarani.client.name} parou de pagar há ${guarani.maiorAtraso} dias` : "Cliente relevante entrou em atraso",
        text: guarani
          ? `Cliente de alto valor, com ${guarani.titulos} títulos em aberto (${formatBRLCompact(guarani.vencido)}). Um alerta automático no primeiro atraso teria antecipado a negociação.`
          : "Um alerta automático no primeiro atraso antecipa a negociação.",
      },
      {
        tone: "warn",
        title: `${h.risk.risky} títulos a vencer em 7 dias são de clientes que costumam atrasar`,
        text: `Somam ${formatBRLCompact(h.risk.riskyValue)}. Com a classificação automática, o lembrete preventivo vai só para quem precisa — sem incomodar os clientes pontuais.`,
      },
    ],
    benefits: [
      { title: "Oportunidade de redução de trabalho manual", text: "Conciliação, baixa de títulos e montagem do aging deixam de ser feitas à mão." },
      { title: "Cobrança com prioridade", text: "A equipe cobra primeiro quem tem mais valor e mais risco, com histórico de cada cliente." },
      { title: "Previsão de caixa mais realista", text: "Recebimentos projetados com base no comportamento real de pagamento, não no vencimento." },
      { title: "Impacto esperado na inadimplência", text: "Lembretes preventivos e régua consistente tendem a reduzir atrasos curtos antes que virem inadimplência." },
    ],
    deliverables: ["Conciliação automática diária", "Classificação por aging e perfil", "Dashboard com 3 visões", "Régua de cobrança automatizada", "Relatório semanal para diretoria"],
  };
}

export const CASES: CaseStudy[] = [buildCondoCase(), buildDistCase(), buildFinCase()];
export const getCase = (slug: string) => CASES.find((c) => c.slug === slug);
export const DATA_REFERENCE = REFERENCE_LABEL;
