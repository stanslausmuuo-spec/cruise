"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

interface AdminStatCardProps {
  icon: ReactNode;
  label: string;
  value: string | number;
  href?: string;
  className?: string;
}

function AdminStatCard({ icon, label, value, href, className }: AdminStatCardProps) {
  const content = (
    <div
      className={cn(
        "glass rounded-premium p-4 flex items-center gap-4",
        href && "hover:shadow-premium-hover transition-shadow cursor-pointer",
        className
      )}
    >
      <div className="h-12 w-12 rounded-full bg-brand-gold-400/10 flex items-center justify-center shrink-0">
        {icon}
      </div>
      <div>
        <p className="text-2xl font-heading font-bold text-charcoal dark:text-cream">
          {value}
        </p>
        <p className="text-xs text-charcoal/60 dark:text-cream/60">{label}</p>
      </div>
    </div>
  );

  if (href) {
    return <Link href={href}>{content}</Link>;
  }

  return content;
}

export { AdminStatCard };
