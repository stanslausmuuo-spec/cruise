"use client";

import { type HTMLAttributes, forwardRef } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  hover?: boolean;
  glass?: boolean;
}

type MotionDivProps = Parameters<typeof motion.div>[0];

const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, hover = true, glass = true, children, ...props }, ref) => {
    if (!hover) {
      return (
        <div
          ref={ref}
          className={cn(
            "rounded-premium overflow-hidden transition-shadow duration-300",
            glass && "glass",
            !glass && "bg-white dark:bg-surface-dark-muted border border-charcoal/5 dark:border-white/5",
            className
          )}
          {...props}
        >
          {children}
        </div>
      );
    }

    return (
      <motion.div
        ref={ref as never}
        whileHover={{ y: -6, scale: 1.01, transition: { duration: 0.3, ease: "easeOut" } }}
        className={cn(
          "rounded-premium overflow-hidden transition-shadow duration-300 hover:shadow-premium-hover cursor-pointer",
          glass && "glass",
          !glass && "bg-white dark:bg-surface-dark-muted border border-charcoal/5 dark:border-white/5",
          className
        )}
        {...(props as Omit<MotionDivProps, "ref" | "className" | "whileHover">)}
      >
        {children}
      </motion.div>
    );
  }
);

Card.displayName = "Card";

export { Card };
