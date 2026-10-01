import { hasWhatsApp, whatsappHref } from "@/lib/contact";
import { WhatsAppIcon } from "@/components/ui/BrandIcons";

/** Botão flutuante — só aparece se o número estiver configurado */
export function WhatsAppFloat() {
  if (!hasWhatsApp()) return null;
  return (
    <a
      href={whatsappHref()}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Conversar pelo WhatsApp"
      className="group fixed bottom-5 right-5 z-40 inline-flex h-14 w-14 items-center justify-center rounded-full bg-[#1FA855] text-white shadow-float transition-transform duration-200 hover:scale-105 sm:bottom-6 sm:right-6"
    >
      <WhatsAppIcon className="h-7 w-7" />
      <span className="pointer-events-none absolute right-full mr-3 hidden whitespace-nowrap rounded-lg bg-ink-950 px-3 py-1.5 text-sm font-medium text-white opacity-0 shadow-lift transition-opacity group-hover:opacity-100 sm:block">
        Conversar no WhatsApp
      </span>
    </a>
  );
}
