"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Star } from "lucide-react";

interface ReviewFormProps {
  bookingId: string;
  revieweeId: string;
  type: "guest_to_host" | "host_to_guest";
  onSuccess?: () => void;
}

function ReviewForm({ bookingId, revieweeId, type, onSuccess }: ReviewFormProps) {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [hoverRating, setHoverRating] = useState(0);
  const createReview = useMutation(api.reviews.createReview);

  const handleSubmit = async () => {
    if (rating === 0 || comment.trim() === "") return;
    try {
      await createReview({
        bookingId: bookingId as never,
        revieweeId: revieweeId as never,
        rating,
        comment: comment.trim(),
        type,
      });
      setRating(0);
      setComment("");
      onSuccess?.();
    } catch (error) {
      console.error("Failed to submit review:", error);
    }
  };

  return (
    <div className="glass rounded-premium p-4">
      <h3 className="font-heading font-bold text-charcoal dark:text-cream mb-4">
        Leave a Review
      </h3>
      <div className="flex items-center gap-1 mb-4">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            className="focus:outline-none"
            onMouseEnter={() => setHoverRating(star)}
            onMouseLeave={() => setHoverRating(0)}
            onClick={() => setRating(star)}
          >
            <Star
              className={`h-6 w-6 transition-colors ${
                star <= (hoverRating || rating)
                  ? "fill-brand-gold-400 text-brand-gold-400"
                  : "text-charcoal/20 dark:text-cream/20"
              }`}
            />
          </button>
        ))}
      </div>
      <Textarea
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="Share your experience..."
        className="mb-4"
      />
      <Button
        onClick={handleSubmit}
        disabled={rating === 0 || comment.trim() === ""}
        className="w-full"
      >
        Submit Review
      </Button>
    </div>
  );
}

export { ReviewForm };