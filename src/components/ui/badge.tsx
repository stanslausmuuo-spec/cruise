"use client";

import { type HTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";
import { ShieldCheck, Star, Crown, CheckCircle } from "lucide-react";

interface BadgeProps extends HTMLAttributes<HTMLDivElement> {
  variant?: "verified" | "featured" | "premium" | "status";
  size?: "sm" | "md";
}

const variants = {
  verified:
    "bg-brand-gold-400/10 text-brand-gold-400 border-brand-gold-400/30",
  featured:
    "bg-gradient-to-r from-brand-gold-400/20 to-brand-burgundy-400/20 text-brand-gold-400 border-brand-gold-400/30",
  premium:
    "bg-brand-burgundy-500/10 text-brand-burgundy-400 border-brand-burgundy-400/30",
  status:
    "bg-green-500/10 text-green-500 border-green-500/30",
};

const icons = {
  verified: ShieldCheck,
  featured: Star,
  premium: Crown,
  status: CheckCircle,
};

const sizes = {
  sm: "text-[10px] px-2 py-0.5 gap-1",
  md: "text-xs px-2.5 py-1 gap-1.5",
};

const Badge = forwardRef<HTMLDivElement, BadgeProps>(
  ({ className, variant = "status", size = "sm", children, ...props }, ref) => {
    const Icon = icons[variant];

    return (
      <div
        ref={ref}
        className={cn(
          "inline-flex items-center rounded-pill border font-medium",
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      >
        {Icon && <Icon className="h-3 w-3" />}
        {children && <span>{children}</span>}
      </div>
    );
  }
);

Badge.displayName = "Badge";

export { Badge };
