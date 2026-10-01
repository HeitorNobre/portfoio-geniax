"use client";

import { useMemo, useState } from "react";
import { Check, Clock, Copy, Files, Layers, MessageCircleQuestion, Repeat, ScatterChart, UserRound } from "lucide-react";
import { problems, problemsIntro } from "@/data/content";
import { portfolioConfig } from "@/config/portfolio";
import { primaryContact } from "@/lib/contact";
import { cn } from "@/lib/cn";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";

const ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  layers: Layers,
  user: UserRound,
  copy: Copy,
  message: MessageCircleQuestion,
  clock: Clock,
  files: Files,
  scatter: ScatterChart,
  repeat: Repeat,
};

export function Problems() {
  const [selected, setSelected] = useState<string[]>([]);
  const toggle = (id: string) => setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));

  const contact = useMemo(() => {
    const items = problems.filter((p) => selected.includes(p.id)).map((p) => `• ${p.quote}`);
    const message = items.length
      ? `Olá, ${portfolioConfig.name}! Conheci o trabalho de vocês pelo site. Na minha empresa acontece o seguinte:\n${items.join("\n")}\nGostaria de conversar sobre uma possível automação/dashboard.`
      : portfolioConfig.whatsappMessage;
    return primaryContact(message);
  }, [selected]);

  const count = selected.length;

  return (
    <section id="problemas" className="scroll-mt-20 bg-ink-50 py-20 sm:py-28" aria-labelledby="problemas-title">
      <Container>
        <SectionHeading id="problemas-title" eyebrow={problemsIntro.eyebrow} title={problemsIntro.title} lead={problemsIntro.lead} />

        <p className="mt-10 text-sm font-medium text-ink-600">Marque o que acontece na sua empresa:</p>
        <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {problems.map((p) => {
            const Icon = ICONS[p.icon];
            const on = selected.includes(p.id);
            return (
              <li key={p.id}>
                <button
                  type="button"
                  aria-pressed={on}
                  onClick={() => toggle(p.id)}
                  className={cn(
                    "group flex h-full w-full flex-col rounded-2xl border bg-white p-5 text-left transition-all duration-200 motion-safe:hover:-translate-y-0.5",
                    on ? "border-brand-500 shadow-lift ring-1 ring-brand-500" : "border-ink-200 shadow-card hover:border-ink-300 hover:shadow-lift",
                  )}
                >
                  <span className="flex items-center justify-between">
                    <span
                      className={cn(
                        "inline-flex h-9 w-9 items-center justify-center rounded-xl transition-colors",
                        on ? "bg-brand-700 text-white" : "bg-ink-100 text-ink-700 group-hover:bg-brand-50 group-hover:text-brand-700",
                      )}
                    >
                      <Icon aria-hidden className="h-[18px] w-[18px]" />
                    </span>
                    <span
                      aria-hidden
                      className={cn(
                        "inline-flex h-5 w-5 items-center justify-center rounded-md border transition-all",
                        on ? "border-brand-600 bg-brand-600 text-white" : "border-ink-300 bg-white text-transparent",
                      )}
                    >
                      <Check className="h-3.5 w-3.5" />
                    </span>
                  </span>
                  <span className="mt-4 font-display text-[1.0625rem] font-semibold leading-snug text-ink-950">&ldquo;{p.quote}&rdquo;</span>
                  <span className="mt-2 text-sm leading-relaxed text-ink-600">{p.cost}</span>
                </button>
              </li>
            );
          })}
        </ul>

        <div
          aria-live="polite"
          className={cn(
            "mt-6 flex flex-col items-start justify-between gap-4 rounded-2xl border p-5 transition-all duration-300 sm:flex-row sm:items-center",
            count ? "border-brand-200 bg-white shadow-lift" : "border-dashed border-ink-300 bg-transparent",
          )}
        >
          <p className="text-[0.9375rem] text-ink-700">
            {count === 0 && "Selecione as situações que você reconhece — levo isso em conta na nossa conversa."}
            {count > 0 && count < 3 && (
              <>
                <strong className="text-ink-950">
                  {count} {count === 1 ? "situação marcada." : "situações marcadas."}
                </strong>{" "}
                Já é um bom ponto de partida para um projeto piloto.
              </>
            )}
            {count >= 3 && (
              <>
                <strong className="text-ink-950">{count} situações marcadas.</strong> Há bastante trabalho manual que provavelmente pode ser
                automatizado.
              </>
            )}
          </p>
          <a
            href={contact.href}
            {...(contact.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
            className={cn(
              "inline-flex h-11 shrink-0 items-center justify-center rounded-xl px-5 text-[0.9375rem] font-semibold transition-all",
              count ? "bg-brand-700 text-white hover:bg-brand-800" : "bg-white text-ink-900 ring-1 ring-inset ring-ink-200 hover:bg-ink-50",
            )}
          >
            {count ? "Quero conversar sobre isso" : "Tenho um processo que quero automatizar"}
          </a>
        </div>
      </Container>
    </section>
  );
}
