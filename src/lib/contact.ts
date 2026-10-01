import { portfolioConfig } from "@/config/portfolio";

const clean = (v: string) => v.trim();

export const hasWhatsApp = () => clean(portfolioConfig.whatsapp).replace(/\D/g, "").length >= 10;
export const hasEmail = () => clean(portfolioConfig.email).includes("@");
export const hasLinkedIn = () => clean(portfolioConfig.linkedin).startsWith("http");
export const hasGitHub = () => clean(portfolioConfig.github).startsWith("http");

export function whatsappHref(message: string = portfolioConfig.whatsappMessage) {
  const number = portfolioConfig.whatsapp.replace(/\D/g, "");
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}

export function emailHref(body?: string) {
  const params = new URLSearchParams();
  params.set("subject", portfolioConfig.emailSubject);
  if (body) params.set("body", body);
  return `mailto:${clean(portfolioConfig.email)}?${params.toString().replace(/\+/g, "%20")}`;
}

export type ContactTarget = { href: string; external: boolean; channel: "whatsapp" | "email" | "linkedin" | "anchor" };

/**
 * Canal principal para os CTAs: WhatsApp > e-mail > LinkedIn > seção de contato.
 * Garante que nenhum botão aponte para um canal não configurado.
 */
export function primaryContact(message?: string): ContactTarget {
  if (hasWhatsApp()) return { href: whatsappHref(message), external: true, channel: "whatsapp" };
  if (hasEmail()) return { href: emailHref(message), external: true, channel: "email" };
  if (hasLinkedIn()) return { href: portfolioConfig.linkedin, external: true, channel: "linkedin" };
  return { href: "/#contato", external: false, channel: "anchor" };
}

export const hasAnyContact = () => hasWhatsApp() || hasEmail() || hasLinkedIn() || hasGitHub();
