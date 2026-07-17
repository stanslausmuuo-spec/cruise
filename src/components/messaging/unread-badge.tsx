"use client";

import { cn } from "@/lib/utils";

interface UnreadBadgeProps {
  count: number;
  className?: string;
}

function UnreadBadge({ count, className }: UnreadBadgeProps) {
  if (count <= 0) return null;

  return (
    <div
      className={cn(
        "h-5 min-w-[20px] rounded-full bg-brand-gold-400 flex items-center justify-center px-1",
        className
      )}
    >
      <span className="text-[10px] font-bold text-white">
        {count > 99 ? "99+" : count}
      </span>
    </div>
  );
}

export { UnreadBadge };
