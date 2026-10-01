import Link from "next/link";
import { portfolioConfig } from "@/config/portfolio";
import { cn } from "@/lib/cn";

/** Marca Geniax: lâmpada com chama em circuito (public/logo-mark.svg) */
export function LogoMark({ className, onDark }: { className?: string; onDark?: boolean }) {
  return (
    <span
      aria-hidden
      className={cn("inline-flex h-10 w-10 shrink-0 items-center justify-center", onDark && "rounded-xl bg-white p-1", className)}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/logo-mark.svg" alt="" width={40} height={40} className="h-full w-full" />
    </span>
  );
}

export function Logo({ className, inverted }: { className?: string; inverted?: boolean }) {
  return (
    <Link href="/" className={cn("group inline-flex items-center gap-2.5 rounded-lg", className)} aria-label={`${portfolioConfig.name} — página inicial`}>
      <LogoMark onDark={inverted} className="transition-transform duration-300 group-hover:-rotate-3" />
      <span className="flex flex-col leading-none">
        <span className={cn("font-display text-[1.05rem] font-bold tracking-tight", inverted ? "text-white" : "text-ink-950")}>
          {portfolioConfig.name}
        </span>
        <span className={cn("mt-1 text-[0.6875rem] font-medium tracking-wide", inverted ? "text-ink-400" : "text-ink-500")}>
          Automação & Dados
        </span>
      </span>
    </Link>
  );
}
