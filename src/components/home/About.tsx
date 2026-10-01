import { BarChart3, Cog, GitBranch, MapPin, MonitorSmartphone } from "lucide-react";
import { about } from "@/data/content";
import { portfolioConfig } from "@/config/portfolio";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";

const ICONS = [BarChart3, Cog, GitBranch];

export function About() {
  const initial = portfolioConfig.name.charAt(0).toUpperCase();
  return (
    <section id="sobre" className="scroll-mt-20 bg-ink-50 py-20 sm:py-28" aria-labelledby="sobre-title">
      <Container className="grid gap-12 lg:grid-cols-[1.15fr_0.85fr] lg:gap-16">
        <div>
          <p className="eyebrow">{about.eyebrow}</p>
          <h2 id="sobre-title" className="mt-3 text-balance text-3xl font-bold leading-[1.12] sm:text-4xl">
            {about.title}
          </h2>
          <div className="mt-6 space-y-4 text-[1.0625rem] leading-relaxed text-ink-700">
            {about.paragraphs.map((p) => (
              <p key={p.slice(0, 24)}>{p}</p>
            ))}
          </div>
        </div>

        <Reveal className="self-start">
          <div className="card overflow-hidden">
            <div className="flex items-center gap-4 border-b border-ink-100 p-6">
              <span className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-ink-950 font-display text-2xl font-bold text-white" aria-hidden>
                {initial}
              </span>
              <div>
                <p className="font-display text-lg font-bold text-ink-950">{portfolioConfig.fullName}</p>
                <p className="text-sm text-ink-600">{portfolioConfig.role}</p>
              </div>
            </div>
            <ul className="divide-y divide-ink-100">
              {about.highlights.map((h, i) => {
                const Icon = ICONS[i % ICONS.length];
                return (
                  <li key={h.label} className="flex gap-3.5 p-5">
                    <Icon aria-hidden className="mt-0.5 h-5 w-5 shrink-0 text-brand-600" />
                    <div>
                      <p className="text-sm font-semibold text-ink-950">{h.label}</p>
                      <p className="mt-0.5 text-sm text-ink-600">{h.detail}</p>
                    </div>
                  </li>
                );
              })}
            </ul>
            <div className="flex flex-wrap gap-x-5 gap-y-2 bg-ink-50 px-6 py-4 text-xs text-ink-600">
              <span className="inline-flex items-center gap-1.5">
                <MapPin aria-hidden className="h-3.5 w-3.5" /> {portfolioConfig.location}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <MonitorSmartphone aria-hidden className="h-3.5 w-3.5" /> Atendimento remoto em todo o Brasil
              </span>
            </div>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
