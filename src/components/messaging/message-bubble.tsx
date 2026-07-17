"use client";

import { cn } from "@/lib/utils";
import { formatDate } from "@/lib/utils";

interface MessageBubbleProps {
  content: string;
  timestamp: number;
  isOwn: boolean;
}

function MessageBubble({ content, timestamp, isOwn }: MessageBubbleProps) {
  return (
    <div className={cn("flex", isOwn ? "justify-end" : "justify-start")}>
      <div
        className={cn(
          "max-w-[75%] rounded-2xl px-4 py-2.5",
          isOwn
            ? "bg-gradient-to-r from-brand-gold-400 to-brand-gold-500 text-white"
            : "glass text-charcoal dark:text-cream"
        )}
      >
        <p className="text-sm">{content}</p>
        <p
          className={cn(
            "text-[10px] mt-1",
            isOwn ? "text-white/70" : "text-charcoal/50 dark:text-cream/50"
          )}
        >
          {formatDate(timestamp, "relative")}
        </p>
      </div>
    </div>
  );
}

export { MessageBubble };
