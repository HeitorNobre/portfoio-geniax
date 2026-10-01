/**
 * ============================================================
 *  CONFIGURAÇÃO PESSOAL — edite apenas este arquivo
 * ============================================================
 *
 * Campos vazios ("") escondem automaticamente o botão/link
 * correspondente em todo o site.
 *
 * whatsapp: apenas números, com DDI + DDD. Ex.: "5511999998888"
 * linkedin / github: URL completa. Ex.: "https://www.linkedin.com/in/seu-perfil"
 * siteUrl: domínio final, sem barra no fim. Ex.: "https://heitor.com.br"
 *          (usado no SEO, sitemap e imagens de compartilhamento)
 */
export const portfolioConfig = {
  name: "Geniax",
  /** Nome exibido no título das páginas e no rodapé. Ex.: "Heitor Silva" */
  fullName: "Geniax",
  role: "Automação de processos e dashboards",
  location: "São Paulo - SP",

  whatsapp: "5511920090580",
  email: "",
  linkedin: "",
  github: "",

  siteUrl: "",

  /** Mensagem pré-preenchida ao abrir o WhatsApp */
  whatsappMessage:
    "Olá, Geniax! Conheci o trabalho de vocês pelo site e gostaria de conversar sobre uma possível automação/dashboard.",

  /** Assunto padrão do e-mail */
  emailSubject: "Conversa sobre automação / dashboard",
} as const;

export type PortfolioConfig = typeof portfolioConfig;
