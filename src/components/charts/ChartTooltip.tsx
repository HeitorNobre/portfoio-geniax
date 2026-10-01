"use client";

type Entry = { name?: string | number; value?: number | string; color?: string; dataKey?: string | number; payload?: Record<string, unknown> };

type Props = {
  active?: boolean;
  payload?: Entry[];
  label?: string | number;
  formatter?: (value: number, key: string) => string;
  labelFormatter?: (label: string | number, payload?: Record<string, unknown>) => string;
  names?: Record<string, string>;
};

/** Tooltip padrão: texto em tinta neutra, cor apenas no marcador da série */
export function ChartTooltip({ active, payload, label, formatter, labelFormatter, names }: Props) {
  if (!active || !payload?.length) return null;
  return (
    <div className="min-w-[10rem] rounded-xl border border-ink-200 bg-white/95 px-3 py-2.5 text-xs shadow-lift backdrop-blur">
      <p className="mb-1.5 font-semibold text-ink-900">
        {labelFormatter ? labelFormatter(label ?? "", payload[0]?.payload) : label}
      </p>
      <ul className="space-y-1">
        {payload.map((p) => {
          const key = String(p.dataKey ?? p.name);
          const value = typeof p.value === "number" ? p.value : Number(p.value);
          return (
            <li key={key} className="flex items-center justify-between gap-4">
              <span className="flex items-center gap-1.5 text-ink-600">
                <span className="h-2 w-2 rounded-full" style={{ background: p.color }} aria-hidden />
                {names?.[key] ?? p.name}
              </span>
              <span className="tabular font-semibold text-ink-900">{formatter ? formatter(value, key) : value}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
