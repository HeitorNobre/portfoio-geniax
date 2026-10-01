import { readFileSync } from "node:fs";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { portfolioConfig } from "@/config/portfolio";

const LOGO_DATA_URI = `data:image/svg+xml;base64,${readFileSync(join(process.cwd(), "public", "logo-mark.svg")).toString("base64")}`;

export const OG_SIZE = { width: 1200, height: 630 };

/** Imagem de compartilhamento (OpenGraph) gerada no build */
export function renderOgImage({ eyebrow, title, subtitle, demo }: { eyebrow: string; title: string; subtitle: string; demo?: boolean }) {
  const bars = [38, 52, 46, 64, 58, 76, 70, 88];
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", background: "#0B1220", color: "#fff", padding: "72px", fontFamily: "sans-serif" }}>
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", width: "68%" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{ display: "flex", width: 64, height: 64, background: "#fff", borderRadius: 16, padding: 6 }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={LOGO_DATA_URI} width={52} height={52} alt="" />
            </div>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <span style={{ fontSize: 28, fontWeight: 700 }}>{portfolioConfig.name}</span>
              <span style={{ fontSize: 18, color: "#94A3B8" }}>Automação & Dados</span>
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, fontSize: 22, color: "#86B6EF", fontWeight: 600, letterSpacing: 2, textTransform: "uppercase" }}>
              {eyebrow}
              {demo && (
                <span style={{ fontSize: 16, color: "#FAB219", border: "1px solid #FAB219", borderRadius: 999, padding: "4px 12px", letterSpacing: 0, textTransform: "none" }}>
                  Case demonstrativo · dados simulados
                </span>
              )}
            </div>
            <div style={{ fontSize: 60, fontWeight: 800, lineHeight: 1.08, marginTop: 18, letterSpacing: -1.5 }}>{title}</div>
            <div style={{ fontSize: 26, color: "#CBD5E1", marginTop: 22, lineHeight: 1.4 }}>{subtitle}</div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "flex-end", width: "32%", gap: 14, paddingBottom: 8 }}>
          {bars.map((h, i) => (
            <div key={i} style={{ width: 26, height: h * 4.2, borderRadius: 6, background: i === bars.length - 1 ? "#fff" : i > 4 ? "#2A78D6" : "#1E3A63" }} />
          ))}
        </div>
      </div>
    ),
    OG_SIZE,
  );
}
