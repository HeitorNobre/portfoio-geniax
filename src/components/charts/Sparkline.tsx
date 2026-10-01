import { cn } from "@/lib/cn";

type Props = {
  values: number[];
  className?: string;
  color?: string;
  /** preenche a área abaixo da linha */
  area?: boolean;
  /** destaca o último ponto */
  endDot?: boolean;
  strokeWidth?: number;
  ariaLabel?: string;
};

/** Sparkline em SVG puro — leve, usada em tabelas, KPIs e na home */
export function Sparkline({ values, className, color = "#2A78D6", area, endDot = true, strokeWidth = 1.75, ariaLabel }: Props) {
  if (values.length < 2) return null;
  const w = 100;
  const h = 32;
  const pad = 3;
  const min = Math.min(...values);
  const max = Math.max(...values);
  const span = max - min || 1;
  const pts = values.map((v, i) => [pad + (i / (values.length - 1)) * (w - pad * 2), pad + (1 - (v - min) / span) * (h - pad * 2)]);
  const d = pts.map(([x, y], i) => `${i ? "L" : "M"}${x.toFixed(2)},${y.toFixed(2)}`).join(" ");
  const last = pts[pts.length - 1];
  const gradientId = `spark-${Math.round(values[0] * 1000)}-${values.length}-${color.replace("#", "")}`;

  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      preserveAspectRatio="none"
      className={cn("h-8 w-24 overflow-visible", className)}
      role={ariaLabel ? "img" : undefined}
      aria-label={ariaLabel}
      aria-hidden={ariaLabel ? undefined : true}
    >
      {area && (
        <>
          <defs>
            <linearGradient id={gradientId} x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity="0.22" />
              <stop offset="100%" stopColor={color} stopOpacity="0" />
            </linearGradient>
          </defs>
          <path d={`${d} L${last[0]},${h} L${pts[0][0]},${h} Z`} fill={`url(#${gradientId})`} />
        </>
      )}
      <path d={d} fill="none" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
      {endDot && <circle cx={last[0]} cy={last[1]} r="2.6" fill={color} stroke="#fff" strokeWidth="1.2" vectorEffect="non-scaling-stroke" />}
    </svg>
  );
}
