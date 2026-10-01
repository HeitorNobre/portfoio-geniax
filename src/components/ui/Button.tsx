import Link from "next/link";
import { cn } from "@/lib/cn";

type Variant = "primary" | "secondary" | "ghost" | "dark" | "light";
type Size = "md" | "lg" | "sm";

const variants: Record<Variant, string> = {
  primary: "bg-brand-700 text-white shadow-sm hover:bg-brand-800 active:bg-brand-900",
  secondary: "bg-white text-ink-900 ring-1 ring-inset ring-ink-200 hover:bg-ink-50 hover:ring-ink-300",
  ghost: "text-ink-700 hover:bg-ink-100 hover:text-ink-950",
  dark: "bg-ink-950 text-white hover:bg-ink-800",
  light: "bg-white text-ink-950 hover:bg-brand-50",
};

const sizes: Record<Size, string> = {
  sm: "h-9 px-3.5 text-sm gap-1.5",
  md: "h-11 px-5 text-[0.9375rem] gap-2",
  lg: "min-h-12 px-6 py-3 text-base gap-2.5",
};

type Props = {
  href: string;
  external?: boolean;
  variant?: Variant;
  size?: Size;
  className?: string;
  children: React.ReactNode;
  ariaLabel?: string;
};

export function Button({ href, external, variant = "primary", size = "md", className, children, ariaLabel }: Props) {
  const classes = cn(
    "group inline-flex select-none items-center justify-center rounded-xl text-center font-semibold leading-tight transition-all duration-200 motion-safe:hover:-translate-y-px",
    variants[variant],
    sizes[size],
    className,
  );
  if (external) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer" className={classes} aria-label={ariaLabel}>
        {children}
      </a>
    );
  }
  return (
    <Link href={href} className={classes} aria-label={ariaLabel}>
      {children}
    </Link>
  );
}
