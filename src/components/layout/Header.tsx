"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { primaryContact } from "@/lib/contact";
import { cn } from "@/lib/cn";
import { Container } from "@/components/ui/Container";
import { Logo } from "./Logo";
import { NAV_LINKS } from "./nav";

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const contact = primaryContact();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  const ctaProps = contact.external ? { target: "_blank", rel: "noopener noreferrer" } : {};

  return (
    <header
      className={cn(
        "sticky top-0 z-50 h-[var(--header-h)] border-b transition-all duration-300",
        scrolled || open ? "border-ink-200/80 bg-white/90 backdrop-blur-md" : "border-transparent bg-white/0",
      )}
    >
      <Container className="flex h-full items-center justify-between gap-6">
        <Logo />

        <nav aria-label="Navegação principal" className="hidden lg:block">
          <ul className="flex items-center gap-1">
            {NAV_LINKS.map((l) => (
              <li key={l.href}>
                <Link
                  href={l.href}
                  className="rounded-lg px-3 py-2 text-sm font-medium text-ink-600 transition-colors hover:bg-ink-100 hover:text-ink-950"
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="flex items-center gap-2">
          <a
            href={contact.href}
            {...ctaProps}
            className="hidden h-10 items-center rounded-xl bg-ink-950 px-4 text-sm font-semibold text-white transition-colors hover:bg-ink-800 sm:inline-flex"
          >
            Vamos conversar
          </a>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls="menu-mobile"
            aria-label={open ? "Fechar menu" : "Abrir menu"}
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl text-ink-800 ring-1 ring-inset ring-ink-200 transition-colors hover:bg-ink-100 lg:hidden"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </Container>

      <div
        id="menu-mobile"
        className={cn(
          "fixed inset-x-0 bottom-0 top-[var(--header-h)] z-40 origin-top bg-white transition-all duration-300 lg:hidden",
          open ? "visible opacity-100" : "invisible -translate-y-2 opacity-0",
        )}
      >
        <Container className="flex h-full flex-col pb-8 pt-4">
          <nav aria-label="Navegação mobile">
            <ul className="divide-y divide-ink-100">
              {NAV_LINKS.map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    onClick={() => setOpen(false)}
                    className="flex items-center justify-between py-4 font-display text-xl font-semibold text-ink-900"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <a
            href={contact.href}
            {...ctaProps}
            onClick={() => setOpen(false)}
            className="mt-auto inline-flex h-12 items-center justify-center rounded-xl bg-brand-700 px-6 font-semibold text-white"
          >
            Quero entender o que posso automatizar
          </a>
        </Container>
      </div>
    </header>
  );
}
