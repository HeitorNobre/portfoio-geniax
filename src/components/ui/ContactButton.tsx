import { ArrowRight, Mail } from "lucide-react";
import { primaryContact } from "@/lib/contact";
import { Button } from "./Button";
import { LinkedInIcon, WhatsAppIcon } from "./BrandIcons";

type Props = {
  label: string;
  message?: string;
  variant?: "primary" | "secondary" | "dark" | "light";
  size?: "md" | "lg" | "sm";
  className?: string;
};

/** CTA principal: abre o canal configurado (WhatsApp > e-mail > LinkedIn > seção de contato) */
export function ContactButton({ label, message, variant = "primary", size = "lg", className }: Props) {
  const target = primaryContact(message);
  const Icon =
    target.channel === "whatsapp"
      ? WhatsAppIcon
      : target.channel === "email"
        ? Mail
        : target.channel === "linkedin"
          ? LinkedInIcon
          : null;
  return (
    <Button href={target.href} external={target.external} variant={variant} size={size} className={className}>
      {Icon && <Icon className="h-[1.1em] w-[1.1em] shrink-0" />}
      <span>{label}</span>
      {!Icon && <ArrowRight aria-hidden className="h-4 w-4 shrink-0 transition-transform group-hover:translate-x-0.5" />}
    </Button>
  );
}
