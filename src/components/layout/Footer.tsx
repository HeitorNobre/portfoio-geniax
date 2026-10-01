import Link from "next/link";
import { Mail, MapPin } from "lucide-react";
import { portfolioConfig } from "@/config/portfolio";
import { emailHref, hasEmail, hasGitHub, hasLinkedIn, hasWhatsApp, whatsappHref } from "@/lib/contact";
import { CASES } from "@/data/cases";
import { Container } from "@/components/ui/Container";
import { GitHubIcon, LinkedInIcon, WhatsAppIcon } from "@/components/ui/BrandIcons";
import { Logo } from "./Logo";
import { NAV_LINKS } from "./nav";

export function Footer() {
  const year = new Date().getFullYear();
  const socials = [
    hasWhatsApp() && { href: whatsappHref(), label: "WhatsApp", Icon: WhatsAppIcon },
    hasEmail() && { href: emailHref(), label: "E-mail", Icon: Mail },
    hasLinkedIn() && { href: portfolioConfig.linkedin, label: "LinkedIn", Icon: LinkedInIcon },
    hasGitHub() && { href: portfolioConfig.github, label: "GitHub", Icon: GitHubIcon },
  ].filter(Boolean) as { href: string; label: string; Icon: React.ComponentType<{ className?: string }> }[];

  return (
    <footer className="border-t border-ink-800 bg-ink-950 text-ink-300">
      <Container className="grid gap-12 py-16 md:grid-cols-[1.4fr_1fr_1fr]">
        <div className="max-w-sm">
          <Logo inverted />
          <p className="mt-5 text-sm leading-relaxed text-ink-400">
            Automação de processos, dashboards gerenciais e integração de dados para empresas que querem menos trabalho
            manual e mais visibilidade da operação.
          </p>
          <p className="mt-4 inline-flex items-center gap-1.5 text-sm text-ink-400">
            <MapPin aria-hidden className="h-4 w-4" /> {portfolioConfig.location} · atendimento remoto em todo o Brasil
          </p>
          {socials.length > 0 && (
            <ul className="mt-6 flex gap-2">
              {socials.map(({ href, label, Icon }) => (
                <li key={label}>
                  <a
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={label}
                    className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 text-ink-300 ring-1 ring-inset ring-white/10 transition-colors hover:bg-white/10 hover:text-white"
                  >
                    <Icon className="h-[18px] w-[18px]" />
                  </a>
                </li>
              ))}
            </ul>
          )}
        </div>

        <nav aria-label="Seções">
          <p className="text-sm font-semibold text-white">Navegação</p>
          <ul className="mt-4 space-y-2.5 text-sm">
            {NAV_LINKS.map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="transition-colors hover:text-white">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <nav aria-label="Cases">
          <p className="text-sm font-semibold text-white">Cases demonstrativos</p>
          <ul className="mt-4 space-y-2.5 text-sm">
            {CASES.map((c) => (
              <li key={c.slug}>
                <Link href={`/cases/${c.slug}`} className="transition-colors hover:text-white">
                  {c.cardTitle}
                </Link>
              </li>
            ))}
          </ul>
          <p className="mt-6 text-xs leading-relaxed text-ink-500">
            Os cases usam empresas fictícias e dados simulados para demonstrar o tipo de solução entregue. Nenhum deles
            representa um cliente real.
          </p>
        </nav>
      </Container>
      <div className="border-t border-white/10">
        <Container className="flex flex-col gap-2 py-6 text-xs text-ink-500 sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {year} {portfolioConfig.fullName}. Todos os direitos reservados.
          </p>
          <p>Automação de processos · Dashboards · Integração de dados</p>
        </Container>
      </div>
    </footer>
  );
}
