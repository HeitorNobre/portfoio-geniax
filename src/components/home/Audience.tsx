import { audience } from "@/data/content";
import { Container } from "@/components/ui/Container";

export function Audience() {
  return (
    <section aria-label="Para quem" className="border-y border-ink-200/70 bg-white py-7">
      <Container className="flex flex-col gap-4 lg:flex-row lg:items-center lg:gap-10">
        <p className="shrink-0 text-xs font-semibold uppercase tracking-[0.14em] text-ink-500">Para quem trabalho</p>
        <ul className="flex flex-wrap gap-x-2 gap-y-2">
          {audience.map((a) => (
            <li key={a} className="rounded-full bg-ink-100 px-3.5 py-1.5 text-sm font-medium text-ink-700">
              {a}
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
