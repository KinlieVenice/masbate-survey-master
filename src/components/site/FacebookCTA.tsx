import { Facebook, ArrowUpRight } from "lucide-react";
import { FACEBOOK_URL } from "@/lib/services";
import { cn } from "@/lib/utils";

export const FacebookCTA = ({
  variant = "primary",
  label = "Message us on Facebook",
  className,
}: {
  variant?: "primary" | "ghost" | "light";
  label?: string;
  className?: string;
}) => {
  const styles = {
    primary:
      "bg-primary text-primary-foreground hover:bg-primary/90",
    ghost:
      "bg-transparent border border-primary/30 text-primary hover:bg-primary/5",
    light:
      "bg-background text-foreground hover:bg-background/90",
  }[variant];

  return (
    <a
      href={FACEBOOK_URL}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "group inline-flex items-center gap-3 px-6 py-3.5 rounded-sm text-sm font-medium tracking-wide transition-all duration-300 ease-natural shadow-soft hover:shadow-elevated",
        styles,
        className
      )}
    >
      <Facebook className="h-4 w-4" />
      <span>{label}</span>
      <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
    </a>
  );
};
