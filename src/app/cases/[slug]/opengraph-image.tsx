import { CASES, getCase } from "@/data/cases";
import { OG_SIZE, renderOgImage } from "@/lib/og";

export const alt = "Case demonstrativo — automação e dashboard";
export const size = OG_SIZE;
export const contentType = "image/png";

export function generateStaticParams() {
  return CASES.map((c) => ({ slug: c.slug }));
}

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const study = getCase(slug);
  return renderOgImage({
    eyebrow: study?.segment ?? "Case",
    title: study?.cardTitle ?? "Case demonstrativo",
    subtitle: study?.cardSummary ?? "",
    demo: true,
  });
}
