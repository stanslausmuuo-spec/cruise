"use client";

import { useQuery } from "convex/react";
import { api } from "convex/_generated/api";
import { motion } from "framer-motion";
import { BackLink } from "@/components/ui/back-link";
import { Badge } from "@/components/ui/badge";
import { SkeletonScreen } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { staggerContainer, fadeUp } from "@/lib/animations";
import { formatDate } from "@/lib/utils";
import { AlertTriangle } from "lucide-react";

export default function DisputesPage() {
  const disputes = useQuery(api.disputes.getOpenDisputes);

  if (disputes === undefined) {
    return (
      <div className="min-h-screen pt-20 pb-16 px-4">
        <SkeletonScreen type="search" />
      </div>
    );
  }

  const statusVariant = (status: string) => {
    switch (status) {
      case "open": return "featured";
      case "investigating": return "status";
      case "resolved": return "verified";
      case "dismissed": return "status";
      default: return "status";
    }
  };

  return (
    <div className="min-h-screen pt-20 pb-16 px-4">
      <div className="max-w-3xl mx-auto">
        <BackLink href="/admin" />
        <h1 className="font-heading text-3xl font-bold bg-gradient-to-r from-brand-gold-400 to-brand-gold-600 bg-clip-text text-transparent mb-8">
          Disputes
        </h1>

        {disputes.length === 0 ? (
          <EmptyState
            icon={<AlertTriangle className="h-8 w-8 text-charcoal/30 dark:text-cream/30" />}
            title="No open disputes"
            description="All disputes have been resolved."
          />
        ) : (
          <motion.div
            variants={staggerContainer}
            initial="initial"
            animate="animate"
            className="space-y-3"
          >
            {disputes.map((dispute) => (
              <motion.div key={dispute._id} variants={fadeUp}>
                <div className="glass rounded-premium p-4">
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-medium text-sm text-charcoal dark:text-cream">
                      Booking #{dispute.bookingId.slice(-6)}
                    </p>
                    <Badge variant={statusVariant(dispute.status) as "verified" | "featured" | "status"}>
                      {dispute.status}
                    </Badge>
                  </div>
                  <p className="text-xs text-charcoal/60 dark:text-cream/60 mb-2">
                    {dispute.reason}
                  </p>
                  <div className="flex items-center justify-between">
                    <p className="text-xs text-charcoal/40 dark:text-cream/40">
                      {formatDate(dispute.createdAt, "short")}
                    </p>
                    <button className="text-xs text-brand-gold-400 hover:underline">
                      Review →
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
}
