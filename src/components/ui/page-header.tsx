"use client";

import { forwardRef } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { fadeUp } from "@/lib/animations";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  className?: string;
}

const PageHeader = forwardRef<HTMLDivElement, PageHeaderProps>(
  ({ className, title, subtitle, action }, ref) => {
    return (
      <motion.div
        ref={ref}
        variants={fadeUp}
        initial="initial"
        animate="animate"
        className={cn("flex items-center justify-between mb-8", className)}
      >
        <div>
          <h1 className="text-3xl font-heading font-bold bg-gradient-to-r from-brand-gold-400 to-brand-gold-600 bg-clip-text text-transparent">
            {title}
          </h1>
          {subtitle && (
            <p className="mt-1 text-charcoal/60 dark:text-cream/60 text-sm">
              {subtitle}
            </p>
          )}
        </div>
        {action && <div>{action}</div>}
      </motion.div>
    );
  }
);

PageHeader.displayName = "PageHeader";

export { PageHeader };
