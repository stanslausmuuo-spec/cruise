"use client";

import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import type { Dispute, User } from "@/lib/types";

interface DisputeCardProps {
  dispute: Dispute;
  raisedBy?: User;
}

function DisputeCard({ dispute, raisedBy }: DisputeCardProps) {
  const statusVariant = (status: string) => {
    switch (status) {
      case "open": return "status";
      case "investigating": return "featured";
      case "resolved": return "verified";
      case "dismissed": return "status";
      default: return "status";
    }
  };

  return (
    <div className="glass rounded-premium p-4">
      <div className="flex items-center justify-between mb-3">
        <div>
          <p className="font-medium text-sm text-charcoal dark:text-cream">
            Booking #{dispute.bookingId.slice(-6)}
          </p>
          <p className="text-xs text-charcoal/60 dark:text-cream/60">
            {formatDate(dispute.createdAt, "short")}
          </p>
        </div>
        <Badge variant={statusVariant(dispute.status) as "verified" | "featured" | "status"}>
          {dispute.status}
        </Badge>
      </div>

      <p className="text-sm text-charcoal/70 dark:text-cream/70 mb-3">
        {dispute.reason}
      </p>

      <div className="flex items-center gap-2 text-xs text-charcoal/60 dark:text-cream/60">
        <span>Raised by: {raisedBy?.name || "User"}</span>
      </div>
    </div>
  );
}

export { DisputeCard };
