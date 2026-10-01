import { Mail } from "lucide-react";
import { finalCta } from "@/data/content";
import { portfolioConfig } from "@/config/portfolio";
import { emailHref, hasAnyContact, hasEmail, hasGitHub, hasLinkedIn, hasWhatsApp, primaryContact } from "@/lib/contact";
import { Container } from "@/components/ui/Container";
import { ContactButton } from "@/components/ui/ContactButton";
import { GitHubIcon, LinkedInIcon } from "@/components/ui/BrandIcons";

type Props = { title?: string; text?: string; id?: string };

/** CTA final — reutilizado na home (id="contato") e nas páginas de case */
export function FinalCta({ title = finalCta.title, text = finalCta.text, id = "contato" }: Props) {
  const primary = primaryContact();
  const secondary = [
    hasEmail() && primary.channel !== "email" && { href: emailHref(), label: portfolioConfig.email, Icon: Mail },
    hasLinkedIn() && primary.channel !== "linkedin" && { href: portfolioConfig.linkedin, label: "LinkedIn", Icon: LinkedInIcon },
    hasGitHub() && { href: portfolioConfig.github, label: "GitHub", Icon: GitHubIcon },
  ].filter(Boolean) as { href: string; label: string; Icon: React.ComponentType<{ className?: string }> }[];

  const showSetupNotice = !hasAnyContact() && process.env.NODE_ENV !== "production";

  return (
    <section id={id} className="scroll-mt-20 px-4 pb-20 sm:px-6 sm:pb-28 lg:px-8" aria-labelledby={`${id}-title`}>
      <Container className="relative overflow-hidden rounded-3xl bg-ink-950 px-6 py-14 text-center sm:px-12 sm:py-20">
        <div aria-hidden className="grid-bg pointer-events-none absolute inset-0 opacity-[0.35] invert [mask-image:radial-gradient(ellipse_60%_70%_at_50%_0%,black,transparent)]" />
        <div aria-hidden className="pointer-events-none absolute -top-32 left-1/2 h-64 w-[560px] -translate-x-1/2 rounded-full bg-brand-600/30 blur-3xl" />
        <div className="relative mx-auto max-w-2xl">
          <h2 id={`${id}-title`} className="text-balance text-3xl font-bold leading-tight text-white sm:text-4xl">
            {title}
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-pretty text-lg leading-relaxed text-ink-300">{text}</p>

          {(hasWhatsApp() || hasEmail() || hasLinkedIn()) && (
            <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <ContactButton label={finalCta.primary} variant="light" />
            </div>
          )}

          {secondary.length > 0 && (
            <ul className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-ink-300">
              {secondary.map(({ href, label, Icon }) => (
                <li key={label}>
                  <a href={href} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 transition-colors hover:text-white">
                    <Icon className="h-4 w-4" />
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          )}

          {showSetupNotice && (
            <p className="mx-auto mt-8 max-w-md rounded-xl border border-warn/40 bg-warn/10 px-4 py-3 text-xs text-warn">
              Aviso visível só em desenvolvimento: preencha WhatsApp, e-mail ou LinkedIn em <code>src/config/portfolio.ts</code> para exibir
              os botões de contato.
            </p>
          )}

          <p className="mt-8 text-xs text-ink-500">Conversa inicial sem custo e sem compromisso</p>
        </div>
      </Container>
    </section>
  );
}
