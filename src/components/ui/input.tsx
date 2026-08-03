"use client";

import { type InputHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  success?: string;
  icon?: React.ReactNode;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, success, icon, id, ...props }, ref) => {
    const hasError = Boolean(error);
    const hasSuccess = Boolean(success);

    return (
      <div className="w-full">
        {label && (
          <label
            htmlFor={id}
            className="block text-sm font-medium text-charcoal/70 dark:text-cream/70 mb-1.5"
          >
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-charcoal/40 dark:text-cream/40">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            id={id}
            aria-invalid={hasError ? true : undefined}
            aria-describedby={hasError ? `${id}-error` : hasSuccess ? `${id}-success` : undefined}
            className={cn(
              "w-full rounded-premium border border-charcoal/10 dark:border-white/10 bg-white dark:bg-surface-dark-muted px-4 py-2.5 text-sm text-charcoal dark:text-cream placeholder:text-charcoal/40 dark:placeholder:text-cream/40 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-brand-gold-400/50 focus:border-brand-gold-400/50 focus:scale-[1.01]",
              icon && "pl-10",
              hasError && "border-red-500/50 focus:ring-red-500/50 focus:border-red-500/50",
              hasSuccess && "border-green-500/50 focus:ring-green-500/50 focus:border-green-500/50",
              className
            )}
            {...props}
          />
        </div>
        {hasError && (
          <p id={`${id}-error`} className="mt-1 text-xs text-red-500" role="alert">
            {error}
          </p>
        )}
        {hasSuccess && (
          <p id={`${id}-success`} className="mt-1 text-xs text-green-500">
            {success}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";

export { Input };
