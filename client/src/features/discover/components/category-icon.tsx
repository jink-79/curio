import { Brain, Briefcase, Code, Cpu, FlaskConical, Landmark, type LucideProps, Scale, Sigma, Sparkles, TrendingUp } from "lucide-react";
import type { Category } from "@/features/reading/types";

const ICONS: Record<Category["icon"], React.ComponentType<LucideProps>> = {
  landmark: Landmark,
  cpu: Cpu,
  sparkles: Sparkles,
  flask: FlaskConical,
  briefcase: Briefcase,
  "trending-up": TrendingUp,
  scale: Scale,
  brain: Brain,
  sigma: Sigma,
  code: Code,
};

export function CategoryIcon({ icon, className }: { icon: Category["icon"]; className?: string }) {
  const Icon = ICONS[icon];
  return <Icon className={className} strokeWidth={1.8} aria-hidden />;
}
