"use client";

import { type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Inbox } from "lucide-react";

interface EmptyStateProps {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}

function EmptyState({ icon, title, description, action, className }: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center py-16 px-4 text-center animate-fade-in",
        className
      )}
    >
      <div className="h-16 w-16 rounded-full bg-brand-gold-400/10 border border-brand-gold-400/20 flex items-center justify-center mb-4">
        {icon || <Inbox className="h-8 w-8 text-brand-gold-400/50" />}
      </div>
      <h3 className="text-lg font-heading font-semibold text-charcoal dark:text-cream mb-1">
        {title}
      </h3>
      {description && (
        <p className="text-sm text-charcoal/60 dark:text-cream/60 max-w-sm mb-6">
          {description}
        </p>
      )}
      {action && <div>{action}</div>}
    </div>
  );
}

export { EmptyState };
