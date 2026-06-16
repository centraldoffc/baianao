import { cn } from "@/lib/utils";

type BadgeProps = {
  children: React.ReactNode;
  variant?: "coral" | "turquoise" | "gold" | "neutral";
  className?: string;
};

const variants: Record<string, string> = {
  coral: "bg-coral/15 text-coral border-coral/30",
  turquoise: "bg-turquoise/15 text-turquoise border-turquoise/30",
  gold: "bg-gold/15 text-gold border-gold/30",
  neutral: "bg-ink-light text-slate-light border-ink-border",
};

export default function Badge({ children, variant = "neutral", className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium",
        variants[variant],
        className
      )}
    >
      {children}
    </span>
  );
}
