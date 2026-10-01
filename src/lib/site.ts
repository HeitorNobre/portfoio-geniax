import { portfolioConfig } from "@/config/portfolio";

/** URL base do site: config > variável da Vercel > localhost */
export function getSiteUrl() {
  const configured = portfolioConfig.siteUrl.trim().replace(/\/$/, "");
  if (configured) return configured;
  if (process.env.NEXT_PUBLIC_SITE_URL) return process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, "");
  if (process.env.VERCEL_PROJECT_PRODUCTION_URL) return `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`;
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return "http://localhost:3000";
}

export const siteTitle = `${portfolioConfig.fullName} — Automação de processos e dashboards para empresas`;
export const siteDescription =
  "Automação de processos, automatização de relatórios e dashboards gerenciais para PMEs, administradoras de condomínios e empresas de serviços. Menos trabalho manual e mais visibilidade da operação.";
