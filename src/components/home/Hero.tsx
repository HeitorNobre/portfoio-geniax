import { ArrowDown, Check } from "lucide-react";
import { hero } from "@/data/content";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { ContactButton } from "@/components/ui/ContactButton";
import { HeroVisual } from "./HeroVisual";

export function Hero() {
  return (
    <section className="relative overflow-hidden pb-20 pt-10 sm:pb-48 sm:pt-16 lg:pb-44 lg:pt-20" aria-labelledby="hero-title">
      <div
        aria-hidden
        className="grid-bg pointer-events-none absolute inset-0 [mask-image:radial-gradient(ellipse_70%_60%_at_70%_20%,black,transparent)]"
      />
      <div aria-hidden className="pointer-events-none absolute -right-40 -top-40 h-[520px] w-[520px] rounded-full bg-brand-100/50 blur-3xl" />

      <Container className="relative grid items-center gap-16 lg:grid-cols-[1.1fr_1fr] lg:gap-12">
        <div className="motion-safe:animate-fade-up">
          <p className="eyebrow">
            <span className="h-1.5 w-1.5 rounded-full bg-brand-600" aria-hidden />
            {hero.eyebrow}
          </p>
          <h1 id="hero-title" className="mt-5 text-[2.5rem] font-extrabold leading-[1.04] sm:text-5xl xl:text-[3.5rem]">
            <span className="block">{hero.title}</span> <span className="block text-brand-700">{hero.titleAccent}</span>
          </h1>
          <p className="mt-6 max-w-xl text-pretty text-lg leading-relaxed text-ink-600">{hero.subtitle}</p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <ContactButton label={hero.primaryCta} />
            <Button href="#cases" variant="secondary" size="lg">
              {hero.secondaryCta}
              <ArrowDown aria-hidden className="h-4 w-4 transition-transform group-hover:translate-y-0.5" />
            </Button>
          </div>

          <ul className="mt-8 flex flex-col gap-2.5 text-sm text-ink-600 sm:flex-row sm:flex-wrap sm:gap-x-6">
            {hero.proof.map((p) => (
              <li key={p} className="flex items-center gap-2">
                <Check aria-hidden className="h-4 w-4 text-brand-600" />
                {p}
              </li>
            ))}
          </ul>
        </div>

        <div className="motion-safe:animate-fade-up [animation-delay:150ms]">
          <HeroVisual />
        </div>
      </Container>
    </section>
  );
}
