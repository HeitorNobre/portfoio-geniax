import { BellRing, ClipboardCheck, Hash, SunMedium, UsersRound, UserCheck } from "lucide-react";
import { benefits } from "@/data/content";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";

const ICONS = [SunMedium, UserCheck, Hash, BellRing, ClipboardCheck, UsersRound];

export function Benefits() {
  return (
    <section className="bg-ink-950 py-20 text-white sm:py-28" aria-labelledby="beneficios-title">
      <Container>
        <div className="max-w-3xl">
          <p className="eyebrow text-brand-300">Benefícios</p>
          <h2 id="beneficios-title" className="mt-3 text-balance text-3xl font-bold leading-[1.12] text-white sm:text-4xl lg:text-[2.625rem]">
            O que muda no dia a dia da empresa.
          </h2>
          <p className="mt-5 text-lg leading-relaxed text-ink-300">Não é sobre ter um dashboard bonito. É sobre a operação funcionar com menos esforço e menos surpresa.</p>
        </div>
        <ul className="mt-14 grid gap-px overflow-hidden rounded-2xl bg-white/10 sm:grid-cols-2 lg:grid-cols-3">
          {benefits.map((b, i) => {
            const Icon = ICONS[i % ICONS.length];
            return (
              <li key={b.title} className="bg-ink-950">
                <Reveal delay={(i % 3) * 80} className="h-full p-7">
                  <Icon aria-hidden className="h-6 w-6 text-brand-300" />
                  <h3 className="mt-5 text-lg font-semibold text-white">{b.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-ink-400">{b.text}</p>
                </Reveal>
              </li>
            );
          })}
        </ul>
      </Container>
    </section>
  );
}
