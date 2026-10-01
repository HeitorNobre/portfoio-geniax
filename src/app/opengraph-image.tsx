import { OG_SIZE, renderOgImage } from "@/lib/og";

export const alt = "Automação de processos e dashboards para empresas";
export const size = OG_SIZE;
export const contentType = "image/png";

export default function Image() {
  return renderOgImage({
    eyebrow: "Automação de processos e dashboards",
    title: "Menos trabalho manual. Mais controle da operação.",
    subtitle: "Rotinas automatizadas e indicadores confiáveis para PMEs.",
  });
}
