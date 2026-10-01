import type { Config } from "tailwindcss";

/**
 * Paleta do portfólio
 * - ink: neutros frios para texto, bordas e superfícies
 * - brand: azul cobalto (ação, destaque, série principal dos gráficos)
 * - series: cores categóricas validadas para daltonismo (ordem fixa)
 * - status: reservadas para bom / atenção / crítico — nunca usadas como série
 */
const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    container: { center: true },
    extend: {
      colors: {
        ink: {
          950: "#0B1220",
          900: "#111A2C",
          800: "#1E293B",
          700: "#334155",
          600: "#475569",
          500: "#64748B",
          400: "#94A3B8",
          300: "#CBD5E1",
          200: "#E2E8F0",
          150: "#EBEFF4",
          100: "#F1F4F8",
          50: "#F7F9FB",
        },
        brand: {
          50: "#EEF5FD",
          100: "#D8E8FB",
          200: "#B7D3F6",
          300: "#86B6EF",
          400: "#5598E7",
          500: "#2A78D6",
          600: "#256ABF",
          700: "#1C5CAB",
          800: "#184F95",
          900: "#0D366B",
        },
        series: {
          1: "#2A78D6",
          2: "#EB6834",
          3: "#1BAF7A",
          4: "#EDA100",
        },
        good: { DEFAULT: "#0CA30C", text: "#0A7A0A", soft: "#E8F6E8" },
        warn: { DEFAULT: "#FAB219", text: "#8A5A00", soft: "#FEF5E0" },
        bad: { DEFAULT: "#D03B3B", text: "#B42F2F", soft: "#FBEAEA" },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "-apple-system", "Segoe UI", "sans-serif"],
        display: ["var(--font-display)", "var(--font-sans)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        card: "0 1px 2px rgba(11,18,32,0.04), 0 1px 1px rgba(11,18,32,0.03)",
        lift: "0 12px 32px -12px rgba(11,18,32,0.18), 0 2px 6px rgba(11,18,32,0.05)",
        float: "0 24px 60px -20px rgba(13,54,107,0.28), 0 4px 12px rgba(11,18,32,0.06)",
      },
      maxWidth: {
        content: "72rem",
      },
      keyframes: {
        "fade-up": {
          from: { opacity: "0", transform: "translateY(12px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        "pulse-dot": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.35" },
        },
        "flow-dash": {
          to: { strokeDashoffset: "-20" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.6s cubic-bezier(0.2, 0.7, 0.2, 1) both",
        "pulse-dot": "pulse-dot 2s ease-in-out infinite",
        "flow-dash": "flow-dash 1.2s linear infinite",
      },
    },
  },
  plugins: [],
};

export default config;
