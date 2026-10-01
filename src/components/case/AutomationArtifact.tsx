import { BellRing, Mail, MessageSquareText, Send } from "lucide-react";
import { condoHeadline, openTicketsLate, DEFAULT_CONDO_FILTERS } from "@/data/mock/condominios";
import { dailyBriefing } from "@/data/mock/distribuidora";
import { collectionQueue, DEFAULT_FIN_FILTERS } from "@/data/mock/financeiro";
import { formatFullDateBR } from "@/data/mock/common";
import { formatBRL, formatBRLCompact, formatHours, formatPct, formatPP, formatSignedPct } from "@/lib/format";

/**
 * O "produto" visível de cada automação: o alerta, o resumo diário ou a régua de cobrança.
 * Todos os números vêm dos mesmos dados simulados do dashboard.
 */
export function AutomationArtifact({ id }: { id: "condominios" | "distribuidora" | "financeiro" }) {
  if (id === "condominios") return <CondoAlert />;
  if (id === "distribuidora") return <DailySummary />;
  return <CollectionRuler />;
}

function MessageFrame({
  icon: Icon,
  channel,
  meta,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  channel: string;
  meta: string;
  children: React.ReactNode;
}) {
  return (
    <figure className="overflow-hidden rounded-2xl border border-ink-200 bg-white shadow-lift">
      <figcaption className="flex items-center gap-3 border-b border-ink-100 bg-ink-50 px-5 py-3">
        <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-ink-950 text-white">
          <Icon className="h-4 w-4" />
        </span>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-ink-950">{channel}</p>
          <p className="truncate text-xs text-ink-500">{meta}</p>
        </div>
      </figcaption>
      <div className="p-5 text-sm leading-relaxed text-ink-800">{children}</div>
      <p className="border-t border-ink-100 px-5 py-2.5 text-[0.6875rem] text-ink-500">Exemplo gerado a partir dos dados simulados do case.</p>
    </figure>
  );
}

function CondoAlert() {
  const h = condoHeadline();
  const late = openTicketsLate(DEFAULT_CONDO_FILTERS, 3);
  return (
    <MessageFrame icon={BellRing} channel="Alerta automático · e-mail para a diretoria" meta="Disparado quando uma regra de exceção é atingida">
      <p className="font-semibold text-ink-950">Atenção: inadimplência em alta em {h.rising.length} condomínios</p>
      <p className="mt-2 text-ink-600">Condomínios com 3 ou mais meses seguidos de aumento:</p>
      <ul className="mt-2 space-y-1">
        {h.rising.map((r) => (
          <li key={r.condo.id} className="flex justify-between gap-3 border-b border-dashed border-ink-100 pb-1">
            <span>{r.condo.name}</span>
            <span className="tabular shrink-0 font-semibold">
              {formatPct(r.inadAtual)} <span className="font-normal text-bad-text">({formatPP(r.inadAtual - r.inadAnterior)})</span>
            </span>
          </li>
        ))}
      </ul>
      <p className="mt-4 font-semibold text-ink-950">Chamados parados há mais tempo</p>
      <ul className="mt-2 space-y-1">
        {late.map((t) => (
          <li key={t.id} className="flex justify-between gap-3 border-b border-dashed border-ink-100 pb-1">
            <span className="min-w-0 truncate">
              #{t.id} {t.categoryLabel} · {t.supplier.name}
            </span>
            <span className="tabular shrink-0 font-semibold text-bad-text">{formatHours(t.hours)}</span>
          </li>
        ))}
      </ul>
      <p className="mt-4 text-xs text-ink-500">Abrir o painel para ver o detalhe por condomínio →</p>
    </MessageFrame>
  );
}

function DailySummary() {
  const b = dailyBriefing();
  return (
    <MessageFrame icon={MessageSquareText} channel="Resumo diário · mensagem para os gestores" meta={`Fechamento de ${formatFullDateBR(b.date)} · enviado automaticamente às 18:30`}>
      <p className="font-semibold text-ink-950">📊 Fechamento do dia — {formatFullDateBR(b.date)}</p>
      <ul className="mt-3 space-y-1.5">
        <li>
          <strong>Faturamento:</strong> {formatBRL(b.faturamento)} ({formatSignedPct(b.vsMedia)} vs. média do dia da semana)
        </li>
        <li>
          <strong>Pedidos:</strong> {b.pedidos} · ticket médio {formatBRL(b.ticket)}
        </li>
        <li>
          <strong>Acumulado do mês:</strong> {formatBRLCompact(b.mesAcumulado)}
        </li>
        <li>
          <strong>Entregas de ontem:</strong> {b.entregasOntem} · {b.atrasadasOntem} com atraso ({b.atrasadasLeste} na Zona Leste)
        </li>
      </ul>
      <p className="mt-4 font-semibold text-ink-950">⚠️ Pontos de atenção</p>
      <ul className="mt-1.5 list-disc space-y-1 pl-5">
        <li>
          {b.worstSeller.seller.name}: {formatSignedPct(b.worstSeller.variacao)} nos últimos 30 dias ({formatPct(b.worstSeller.atingimento, 0)} da meta)
        </li>
        {b.stockAlerts.slice(0, 3).map((s) => (
          <li key={s.sku}>
            {s.name.split(" (")[0]}: estoque para {Math.round(s.coverage)} dias
          </li>
        ))}
      </ul>
    </MessageFrame>
  );
}

function CollectionRuler() {
  const queue = collectionQueue(DEFAULT_FIN_FILTERS);
  const steps = [
    { when: "D-5", channel: "E-mail", text: "Lembrete com boleto atualizado — só para clientes com histórico de atraso.", q: queue[0] },
    { when: "D+1", channel: "E-mail + WhatsApp", text: "Aviso cordial de vencimento com link de pagamento.", q: queue[1] },
    { when: "D+7", channel: "WhatsApp", text: "Segunda cobrança, com pedido de previsão de pagamento.", q: queue[2] },
    { when: "D+15", channel: "Telefone (tarefa para a equipe)", text: "Contato direto registrado no histórico do cliente.", q: queue[3] },
    { when: "D+30", channel: "Negociação", text: "Título sai da régua e entra na fila de negociação/acordo.", q: queue[4] },
  ];
  return (
    <figure className="overflow-hidden rounded-2xl border border-ink-200 bg-white shadow-lift">
      <figcaption className="flex items-center gap-3 border-b border-ink-100 bg-ink-50 px-5 py-3">
        <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-ink-950 text-white">
          <Send className="h-4 w-4" />
        </span>
        <div>
          <p className="text-sm font-semibold text-ink-950">Régua de cobrança automatizada</p>
          <p className="text-xs text-ink-500">Fila calculada para hoje a partir da carteira simulada</p>
        </div>
      </figcaption>
      <ol className="divide-y divide-ink-100">
        {steps.map((s) => (
          <li key={s.when} className="flex gap-4 px-5 py-4">
            <span className="tabular inline-flex h-9 w-14 shrink-0 items-center justify-center rounded-lg bg-brand-50 font-display text-sm font-bold text-brand-800">{s.when}</span>
            <div className="min-w-0 flex-1">
              <p className="flex items-center gap-1.5 text-sm font-semibold text-ink-950">
                <Mail aria-hidden className="h-3.5 w-3.5 text-ink-400" />
                {s.channel}
              </p>
              <p className="mt-0.5 text-sm text-ink-600">{s.text}</p>
            </div>
            <div className="shrink-0 text-right">
              <p className="tabular text-sm font-semibold text-ink-900">{s.q.titulos}</p>
              <p className="text-[0.6875rem] text-ink-500">títulos hoje</p>
            </div>
          </li>
        ))}
      </ol>
      <p className="border-t border-ink-100 px-5 py-2.5 text-[0.6875rem] text-ink-500">Exemplo gerado a partir dos dados simulados do case.</p>
    </figure>
  );
}
