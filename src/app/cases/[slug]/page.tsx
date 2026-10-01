import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, CheckCircle2, HelpCircle, PackageCheck } from "lucide-react";
import { CASES, getCase } from "@/data/cases";
import { Container } from "@/components/ui/Container";
import { DemoBadge } from "@/components/ui/DemoBadge";
import { FlowDiagram } from "@/components/diagrams/FlowDiagram";
import { ArchitectureDiagram } from "@/components/diagrams/ArchitectureDiagram";
import { DashboardLoader } from "@/components/dashboards/DashboardLoader";
import { AutomationArtifact } from "@/components/case/AutomationArtifact";
import {
  AutomationTimeline,
  Callout,
  CaseHero,
  CaseSection,
  CaseSectionNav,
  InsightsGrid,
  ManualTasksTable,
  Prose,
} from "@/components/case/CaseBlocks";
import { FinalCta } from "@/components/home/FinalCta";

type Params = { slug: string };

export const dynamicParams = false;

export function generateStaticParams(): Params[] {
  return CASES.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { slug } = await params;
  const study = getCase(slug);
  if (!study) return {};
  return {
    title: study.seoTitle,
    description: study.seoDescription,
    alternates: { canonical: `/cases/${study.slug}` },
    openGraph: {
      type: "article",
      title: study.seoTitle,
      description: study.seoDescription,
      url: `/cases/${study.slug}`,
    },
  };
}

export default async function CasePage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const study = getCase(slug);
  if (!study) notFound();

  const others = CASES.filter((c) => c.slug !== study.slug);

  return (
    <article>
      <CaseHero study={study} />
      <CaseSectionNav />

      <CaseSection id="contexto" index={1} title="O cenário e o problema">
        <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
          <div>
            <h3 className="text-lg font-semibold">Contexto</h3>
            <div className="mt-3">
              <Prose paragraphs={study.context} />
            </div>
            <p className="mt-6 text-sm font-semibold text-ink-900">Fontes de dados envolvidas</p>
            <ul className="mt-3 flex flex-wrap gap-2">
              {study.sources.map((s) => (
                <li key={s} className="rounded-full border border-ink-200 bg-white px-3 py-1.5 text-sm text-ink-700">
                  {s}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold">Problema</h3>
            <div className="mt-3">
              <Prose paragraphs={study.problem} />
            </div>
          </div>
        </div>
      </CaseSection>

      <CaseSection id="processo" index={2} title="Como o processo funcionava" tone="muted">
        <div className="rounded-3xl border border-ink-200 bg-white p-4 sm:p-6">
          <p className="mb-5 text-sm font-semibold text-ink-900">Fluxo atual — etapas manuais em destaque</p>
          <FlowDiagram steps={study.before} variant="before" />
        </div>
        <div className="mt-8">
          <ManualTasksTable study={study} />
          <p className="mt-3 text-xs text-ink-500">Tempos são premissas do cenário simulado, usados para dimensionar a oportunidade.</p>
        </div>
        <div className="mt-8">
          <Callout title="O gargalo" paragraphs={study.bottleneck} />
        </div>
      </CaseSection>

      <CaseSection id="solucao" index={3} title="Solução proposta">
        <div className="max-w-3xl">
          <Prose paragraphs={study.solution} />
        </div>
        <div className="mt-10 rounded-3xl border border-brand-100 bg-white p-4 shadow-card sm:p-6">
          <p className="mb-5 text-sm font-semibold text-ink-900">Processo proposto — sem etapas manuais</p>
          <FlowDiagram steps={study.after} variant="after" />
        </div>
        <h3 className="mt-14 text-lg font-semibold">Arquitetura</h3>
        <p className="mt-1 text-sm text-ink-600">Os sistemas atuais continuam onde estão. A automação lê, trata e entrega.</p>
        <div className="mt-5">
          <ArchitectureDiagram {...study.architecture} />
        </div>
      </CaseSection>

      <CaseSection id="automacao" index={4} title="O que a automação faz, e quando" tone="muted">
        <div className="grid gap-8 lg:grid-cols-2 lg:gap-10">
          <AutomationTimeline steps={study.automation} />
          <div className="lg:sticky lg:top-36 lg:self-start">
            <AutomationArtifact id={study.dashboard} />
          </div>
        </div>
      </CaseSection>

      <CaseSection id="dashboard" index={5} title="Dashboard interativo" wide>
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <p className="text-[1.0625rem] leading-relaxed text-ink-700">
              Use os filtros e as abas. Cada painel foi desenhado para responder uma pergunta concreta da gestão:
            </p>
            <ul className="mt-4 grid gap-2 sm:grid-cols-2">
              {study.questions.map((q) => (
                <li key={q} className="flex gap-2 text-sm text-ink-700">
                  <HelpCircle aria-hidden className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" />
                  {q}
                </li>
              ))}
            </ul>
          </div>
          <DemoBadge className="self-start lg:self-end" />
        </div>
        <div className="mt-8">
          <DashboardLoader id={study.dashboard} />
        </div>
      </CaseSection>

      <CaseSection id="insights" index={6} title="O que os dados mostram" tone="muted">
        <p className="-mt-2 mb-8 max-w-3xl text-[1.0625rem] leading-relaxed text-ink-700">
          Exemplos de leituras que o dashboard permite fazer em minutos — e que no processo manual dependeriam de alguém cruzar várias
          planilhas.
        </p>
        <InsightsGrid insights={study.insights} />
      </CaseSection>

      <CaseSection id="beneficios" index={7} title="Benefícios esperados">
        <div className="grid gap-10 lg:grid-cols-[1.3fr_0.7fr] lg:gap-14">
          <ul className="grid gap-4 sm:grid-cols-2">
            {study.benefits.map((b) => (
              <li key={b.title} className="card p-6">
                <CheckCircle2 aria-hidden className="h-5 w-5 text-brand-600" />
                <h3 className="mt-4 text-base font-semibold">{b.title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-ink-600">{b.text}</p>
              </li>
            ))}
          </ul>
          <div className="self-start rounded-2xl bg-ink-950 p-6 text-white">
            <p className="flex items-center gap-2 font-display text-lg font-semibold">
              <PackageCheck aria-hidden className="h-5 w-5 text-brand-300" /> Entregáveis
            </p>
            <ul className="mt-4 space-y-2.5">
              {study.deliverables.map((d) => (
                <li key={d} className="flex gap-2.5 text-sm text-ink-300">
                  <CheckCircle2 aria-hidden className="mt-0.5 h-4 w-4 shrink-0 text-brand-300" />
                  {d}
                </li>
              ))}
            </ul>
            <p className="mt-6 border-t border-white/10 pt-4 text-xs leading-relaxed text-ink-400">
              Ganhos descritos como impacto esperado, com base nas premissas do cenário. Em um projeto real, os números são medidos no
              diagnóstico e acompanhados após a implantação.
            </p>
          </div>
        </div>
      </CaseSection>

      <FinalCta
        id="contato-case"
        title="Sua operação tem um processo parecido?"
        text="Se hoje sua equipe gasta horas montando relatórios ou cruzando planilhas, vale uma conversa de 30 minutos para ver o que dá para automatizar."
      />

      <nav aria-label="Outros cases" className="border-t border-ink-200 bg-ink-50 py-14">
        <Container>
          <p className="eyebrow">Outros cases demonstrativos</p>
          <ul className="mt-6 grid gap-4 md:grid-cols-2">
            {others.map((c) => (
              <li key={c.slug}>
                <Link
                  href={`/cases/${c.slug}`}
                  className="group flex h-full items-center justify-between gap-6 rounded-2xl border border-ink-200 bg-white p-6 transition-all hover:border-ink-300 hover:shadow-lift"
                >
                  <div>
                    <p className="text-xs font-medium text-ink-500">{c.segment}</p>
                    <p className="mt-1 font-display text-lg font-semibold text-ink-950 group-hover:text-brand-800">{c.cardTitle}</p>
                    <p className="mt-1 text-sm text-ink-600">{c.cardSummary}</p>
                  </div>
                  <ArrowRight aria-hidden className="h-5 w-5 shrink-0 text-ink-400 transition-transform group-hover:translate-x-1 group-hover:text-brand-700" />
                </Link>
              </li>
            ))}
          </ul>
        </Container>
      </nav>
    </article>
  );
}
