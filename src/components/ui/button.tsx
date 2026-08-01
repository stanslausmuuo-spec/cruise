"use client";

import { type ButtonHTMLAttributes, forwardRef } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
  loading?: boolean;
  icon?: React.ReactNode;
}

const variantStyles = {
  primary:
    "bg-brand-gold-500 text-white hover:brightness-110 shadow-premium",
  secondary:
    "bg-charcoal dark:bg-white text-white dark:text-charcoal hover:opacity-90",
  outline:
    "border border-brand-gold-400/40 text-brand-gold-400 hover:bg-brand-gold-400/10",
  ghost:
    "text-charcoal dark:text-cream hover:bg-black/5 dark:hover:bg-white/10",
  danger:
    "bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500/20",
};

const sizeStyles = {
  sm: "px-3 py-1.5 text-sm gap-1.5",
  md: "px-5 py-2.5 text-sm gap-2",
  lg: "px-7 py-3.5 text-base gap-2.5",
};

type MotionButtonProps = Parameters<typeof motion.button>[0];

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", loading, icon, children, disabled, type = "button", ...props }, ref) => {
    return (
      <motion.button
        ref={ref as never}
        type={type}
        whileHover={disabled ? undefined : { scale: 1.03 }}
        whileTap={disabled ? undefined : { scale: 0.97 }}
        className={cn(
          "inline-flex items-center justify-center rounded-pill font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-brand-gold-400/50 focus:ring-offset-2 dark:focus:ring-offset-surface-dark disabled:opacity-50 disabled:cursor-not-allowed",
          variantStyles[variant],
          sizeStyles[size],
          className
        )}
        disabled={disabled || loading}
        {...(props as Omit<MotionButtonProps, "ref" | "type" | "className" | "disabled">)}
      >
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : icon ? (
          icon
        ) : null}
        {children && <span>{children}</span>}
      </motion.button>
    );
  }
);

Button.displayName = "Button";

export { Button };
