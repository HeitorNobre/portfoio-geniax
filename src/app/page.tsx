import { Hero } from "@/components/home/Hero";
import { Audience } from "@/components/home/Audience";
import { Problems } from "@/components/home/Problems";
import { Services } from "@/components/home/Services";
import { BeforeAfter } from "@/components/home/BeforeAfter";
import { CasesGrid } from "@/components/home/CasesGrid";
import { Benefits } from "@/components/home/Benefits";
import { Process, Engagement } from "@/components/home/Process";
import { Stack } from "@/components/home/Stack";
import { About } from "@/components/home/About";
import { Faq } from "@/components/home/Faq";
import { FinalCta } from "@/components/home/FinalCta";
import { faq } from "@/data/content";
import { portfolioConfig } from "@/config/portfolio";
import { getSiteUrl, siteDescription } from "@/lib/site";

export default function HomePage() {
  const siteUrl = getSiteUrl();
  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "ProfessionalService",
      name: `${portfolioConfig.fullName} — Automação de processos e dashboards`,
      description: siteDescription,
      url: siteUrl,
      areaServed: "BR",
      address: { "@type": "PostalAddress", addressLocality: portfolioConfig.location, addressCountry: "BR" },
      serviceType: ["Automação de processos", "Dashboards gerenciais", "Integração de dados", "Automatização de relatórios"],
      ...(portfolioConfig.email ? { email: portfolioConfig.email } : {}),
      ...(portfolioConfig.linkedin ? { sameAs: [portfolioConfig.linkedin, portfolioConfig.github].filter(Boolean) } : {}),
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: faq.map((f) => ({ "@type": "Question", name: f.q, acceptedAnswer: { "@type": "Answer", text: f.a } })),
    },
  ];

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <Hero />
      <Audience />
      <Problems />
      <Services />
      <BeforeAfter />
      <CasesGrid />
      <Benefits />
      <Process />
      <Engagement />
      <Stack />
      <About />
      <Faq />
      <FinalCta />
    </>
  );
}
