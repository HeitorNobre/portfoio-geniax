import { cn } from "@/lib/cn";

type Props = {
  eyebrow?: string;
  title: React.ReactNode;
  lead?: React.ReactNode;
  align?: "left" | "center";
  className?: string;
  id?: string;
  as?: "h2" | "h3";
};

export function SectionHeading({ eyebrow, title, lead, align = "left", className, id, as: Tag = "h2" }: Props) {
  return (
    <div className={cn("max-w-3xl", align === "center" && "mx-auto text-center", className)}>
      {eyebrow && <p className="eyebrow">{eyebrow}</p>}
      <Tag id={id} className="mt-3 text-balance text-3xl font-bold leading-[1.12] sm:text-4xl lg:text-[2.625rem]">
        {title}
      </Tag>
      {lead && <p className="mt-5 text-pretty text-lg leading-relaxed text-ink-600">{lead}</p>}
    </div>
  );
}
