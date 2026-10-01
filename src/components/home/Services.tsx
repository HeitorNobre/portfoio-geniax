import { ArrowRight, Check, Database, LayoutDashboard, Workflow } from "lucide-react";
import { services } from "@/data/content";
import { primaryContact } from "@/lib/contact";
import { portfolioConfig } from "@/config/portfolio";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";

const ICONS = { automacao: Workflow, dashboards: LayoutDashboard, dados: Database } as const;

export function Services() {
  return (
    <section id="servicos" className="scroll-mt-20 py-20 sm:py-28" aria-labelledby="servicos-title">
      <Container>
        <SectionHeading
          id="servicos-title"
          eyebrow="Serviços"
          title="Três frentes, um objetivo: sua equipe gastar menos tempo com o operacional."
          lead="Na maioria dos projetos as três andam juntas: organizar os dados, automatizar o que é repetitivo e dar ao gestor uma forma simples de acompanhar."
        />

        <div className="mt-14 grid gap-5 lg:grid-cols-3">
          {services.map((s, i) => {
            const Icon = ICONS[s.id as keyof typeof ICONS];
            const contact = primaryContact(`Olá, ${portfolioConfig.name}! Vi o site de vocês e gostaria de conversar sobre ${s.title.toLowerCase()}.`);
            return (
              <Reveal key={s.id} delay={i * 90} className="h-full">
                <article className="card flex h-full flex-col p-6 transition-shadow duration-300 hover:shadow-lift sm:p-7">
                  <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-ink-950 text-white">
                    <Icon aria-hidden className="h-5 w-5" />
                  </span>
                  <h3 className="mt-5 text-xl font-bold">{s.title}</h3>
                  <p className="mt-2 text-[0.9375rem] font-medium leading-relaxed text-ink-800">{s.summary}</p>
                  <p className="mt-3 text-sm leading-relaxed text-ink-600">{s.inPractice}</p>

                  <ul className="mt-6 space-y-2.5 border-t border-ink-100 pt-6">
                    {s.examples.map((e) => (
                      <li key={e} className="flex gap-2.5 text-sm text-ink-700">
                        <Check aria-hidden className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" />
                        {e}
                      </li>
                    ))}
                  </ul>

                  <div className="mt-auto pt-7">
                    <p className="rounded-xl bg-ink-50 px-4 py-3 text-xs leading-relaxed text-ink-600">
                      <span className="font-semibold text-ink-900">Você recebe: </span>
                      {s.deliverable}
                    </p>
                    <a
                      href={contact.href}
                      {...(contact.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                      className="group mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-brand-700 hover:text-brand-900"
                    >
                      {s.cta}
                      <ArrowRight aria-hidden className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                    </a>
                  </div>
                </article>
              </Reveal>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
