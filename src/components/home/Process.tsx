import { SearchCheck } from "lucide-react";
import { engagement, processSteps } from "@/data/content";
import { cn } from "@/lib/cn";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";

export function Process() {
  return (
    <section id="como-trabalho" className="scroll-mt-20 py-20 sm:py-28" aria-labelledby="como-trabalho-title">
      <Container>
        <div className="grid gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16">
          <div className="lg:sticky lg:top-28 lg:self-start">
            <SectionHeading
              id="como-trabalho-title"
              eyebrow="Como trabalho"
              title="Primeiro entendo o processo. Depois automatizo."
              lead="Automatizar um processo confuso só produz um processo confuso mais rápido. Por isso, cada projeto começa com diagnóstico e mapeamento — e só vai para desenvolvimento depois de você validar um protótipo com seus próprios dados."
            />
            <div className="mt-8 flex gap-3 rounded-2xl border border-brand-100 bg-brand-50/70 p-5">
              <SearchCheck aria-hidden className="mt-0.5 h-5 w-5 shrink-0 text-brand-700" />
              <p className="text-sm leading-relaxed text-ink-700">
                <strong className="text-ink-950">Não começo programando sem entender o problema.</strong> Se no diagnóstico ficar claro que
                automação não é a melhor resposta, eu digo isso.
              </p>
            </div>
          </div>

          <ol className="relative">
            <span aria-hidden className="absolute bottom-6 left-[1.1875rem] top-6 w-px bg-ink-200" />
            {processSteps.map((s, i) => (
              <li key={s.title} className="pb-8 last:pb-0">
                <Reveal delay={Math.min(i, 4) * 50} className="relative flex gap-5">
                  <span
                    className={cn(
                      "relative z-10 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full font-display text-sm font-bold",
                      s.optional ? "border border-dashed border-ink-300 bg-white text-ink-500" : "bg-ink-950 text-white",
                    )}
                  >
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div className="pt-1.5">
                    <h3 className="flex flex-wrap items-center gap-2 text-lg font-semibold">
                      {s.title}
                      {s.optional && <span className="rounded-full bg-ink-100 px-2 py-0.5 text-[0.6875rem] font-semibold text-ink-600">se contratada</span>}
                    </h3>
                    <p className="mt-1.5 text-[0.9375rem] leading-relaxed text-ink-600">{s.text}</p>
                  </div>
                </Reveal>
              </li>
            ))}
          </ol>
        </div>
      </Container>
    </section>
  );
}

export function Engagement() {
  return (
    <section id="contratacao" className="scroll-mt-20 bg-ink-50 py-20 sm:py-28" aria-labelledby="contratacao-title">
      <Container>
        <SectionHeading
          id="contratacao-title"
          eyebrow="Formatos de contratação"
          title="Comece pequeno. Amplie quando o ganho estiver claro."
          lead="Cada proposta tem escopo, prazo e valor fechados antes de começar. Sem mensalidade obrigatória."
        />
        <ol className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {engagement.map((e, i) => (
            <li key={e.title}>
              <Reveal delay={i * 80} className="card flex h-full flex-col p-6">
                <div className="flex items-center justify-between">
                  <span className="font-display text-sm font-bold text-ink-400">{String(i + 1).padStart(2, "0")}</span>
                  <span className="rounded-full bg-brand-50 px-2.5 py-1 text-[0.6875rem] font-semibold text-brand-800">{e.tag}</span>
                </div>
                <h3 className="mt-5 text-lg font-semibold">{e.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-600">{e.text}</p>
              </Reveal>
            </li>
          ))}
        </ol>
      </Container>
    </section>
  );
}
