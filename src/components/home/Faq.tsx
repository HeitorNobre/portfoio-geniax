import { Plus } from "lucide-react";
import { faq } from "@/data/content";
import { Container } from "@/components/ui/Container";
import { SectionHeading } from "@/components/ui/SectionHeading";

export function Faq() {
  return (
    <section id="faq" className="scroll-mt-20 py-20 sm:py-28" aria-labelledby="faq-title">
      <Container className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
        <SectionHeading
          id="faq-title"
          eyebrow="Perguntas frequentes"
          title="O que costumam me perguntar antes de começar."
          lead="Se sua dúvida não estiver aqui, pergunte direto — respondo sem compromisso."
        />
        <div className="divide-y divide-ink-200 border-y border-ink-200">
          {faq.map((item) => (
            <details key={item.q} className="group">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-6 py-5 text-left">
                <h3 className="font-sans text-base font-semibold tracking-normal text-ink-950 sm:text-[1.0625rem]">{item.q}</h3>
                <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-ink-100 text-ink-700 transition-all duration-200 group-open:rotate-45 group-open:bg-ink-950 group-open:text-white">
                  <Plus aria-hidden className="h-4 w-4" />
                </span>
              </summary>
              <p className="-mt-1 pb-6 pr-12 text-[0.9375rem] leading-relaxed text-ink-600">{item.a}</p>
            </details>
          ))}
        </div>
      </Container>
    </section>
  );
}
