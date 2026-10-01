import { stack } from "@/data/content";
import { Container } from "@/components/ui/Container";

/** Tecnologias: propositalmente discreta — a ferramenta é meio, não produto */
export function Stack() {
  return (
    <section aria-labelledby="stack-title" className="py-16 sm:py-20">
      <Container>
        <div className="grid gap-8 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16">
          <div>
            <p className="eyebrow">Tecnologias</p>
            <h2 id="stack-title" className="mt-3 text-2xl font-bold leading-tight sm:text-3xl">
              Ferramentas escolhidas pelo problema, não o contrário.
            </h2>
            <p className="mt-4 text-[0.9375rem] leading-relaxed text-ink-600">
              Sempre que possível, uso o que sua empresa já tem — especialmente o ecossistema Microsoft. O que importa é a solução ser
              estável e fácil de manter.
            </p>
          </div>
          <ul className="flex flex-wrap content-start gap-2">
            {stack.map((s) => (
              <li key={s.name} className="group rounded-xl border border-ink-200 bg-white px-3.5 py-2 transition-colors hover:border-brand-300">
                <span className="text-sm font-semibold text-ink-900">{s.name}</span>
                <span className="ml-2 text-xs text-ink-500">{s.note}</span>
              </li>
            ))}
          </ul>
        </div>
      </Container>
    </section>
  );
}
