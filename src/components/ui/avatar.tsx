"use client";

import { type HTMLAttributes, forwardRef } from "react";
import { cn, getInitials } from "@/lib/utils";
import { ShieldCheck } from "lucide-react";

interface AvatarProps extends HTMLAttributes<HTMLDivElement> {
  src?: string;
  name: string;
  size?: "sm" | "md" | "lg";
  verified?: boolean;
  online?: boolean;
}

const sizesMap = {
  sm: "h-8 w-8 text-xs",
  md: "h-10 w-10 text-sm",
  lg: "h-14 w-14 text-lg",
};

const badgeSizes = {
  sm: "h-3 w-3 -bottom-0.5 -right-0.5",
  md: "h-4 w-4 -bottom-0.5 -right-0.5",
  lg: "h-5 w-5 -bottom-0.5 -right-0.5",
};

const Avatar = forwardRef<HTMLDivElement, AvatarProps>(
  ({ className, src, name, size = "md", verified, online, ...props }, ref) => {
    return (
      <div className="relative inline-flex shrink-0" ref={ref} {...props}>
        {src ? (
          <img
            src={src}
            alt={name}
            className={cn("rounded-full object-cover", sizesMap[size])}
          />
        ) : (
          <div
            className={cn(
              "rounded-full bg-gradient-to-br from-brand-gold-400 to-brand-gold-600 flex items-center justify-center font-heading font-bold text-white",
              sizesMap[size]
            )}
          >
            {getInitials(name)}
          </div>
        )}

        {verified && (
          <div
            className={cn(
              "absolute bg-brand-gold-400 rounded-full flex items-center justify-center text-white",
              badgeSizes[size]
            )}
          >
            <ShieldCheck className="h-full w-full p-0.5" />
          </div>
        )}

        {online && (
          <span
            className={cn(
              "absolute bg-green-500 rounded-full ring-2 ring-white dark:ring-surface-dark",
              size === "sm" ? "h-2 w-2 bottom-0 right-0" : "h-2.5 w-2.5 bottom-0 right-0"
            )}
          />
        )}
      </div>
    );
  }
);

Avatar.displayName = "Avatar";

export { Avatar };
