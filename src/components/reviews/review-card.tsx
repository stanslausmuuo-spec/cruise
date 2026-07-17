"use client";

import { Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDate } from "@/lib/utils";

interface ReviewCardProps {
  rating: number;
  comment: string;
  createdAt: number;
  reviewerName?: string;
  className?: string;
}

function ReviewCard({ rating, comment, createdAt, reviewerName, className }: ReviewCardProps) {
  return (
    <div className={cn("glass rounded-premium p-4", className)}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star
              key={star}
              className={`h-4 w-4 ${
                star <= rating
                  ? "fill-brand-gold-400 text-brand-gold-400"
                  : "text-charcoal/20 dark:text-cream/20"
              }`}
            />
          ))}
        </div>
        <p className="text-xs text-charcoal/50 dark:text-cream/50">
          {formatDate(createdAt, "short")}
        </p>
      </div>
      <p className="text-sm text-charcoal/70 dark:text-cream/70 mb-2">{comment}</p>
      {reviewerName && (
        <p className="text-xs font-medium text-charcoal/60 dark:text-cream/60">
          — {reviewerName}
        </p>
      )}
    </div>
  );
}

function RatingDisplay({ rating, count }: { rating: number; count: number }) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`h-4 w-4 ${
              star <= Math.round(rating)
                ? "fill-brand-gold-400 text-brand-gold-400"
                : "text-charcoal/20 dark:text-cream/20"
            }`}
          />
        ))}
      </div>
      <span className="text-sm font-medium text-charcoal dark:text-cream">
        {rating.toFixed(1)}
      </span>
      <span className="text-xs text-charcoal/50 dark:text-cream/50">
        ({count} {count === 1 ? "review" : "reviews"})
      </span>
    </div>
  );
}

export { ReviewCard, RatingDisplay };
