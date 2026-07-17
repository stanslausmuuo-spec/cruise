"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "convex/_generated/api";
import { motion } from "framer-motion";
import { BackLink } from "@/components/ui/back-link";
import { Button } from "@/components/ui/button";
import { SkeletonScreen } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { staggerContainer, fadeUp } from "@/lib/animations";
import { formatDate } from "@/lib/utils";
import { Check, X, AlertTriangle } from "lucide-react";

export default function VerificationsPage() {
  const currentUser = useQuery(api.auth.getMe);
  const documents = useQuery(api.verification.getPendingVerifications);
  const approveDocument = useMutation(api.verification.approveDocument);
  const rejectDocument = useMutation(api.verification.rejectDocument);

  if (documents === undefined || currentUser === undefined) {
    return (
      <div className="min-h-screen pt-20 pb-16 px-4">
        <SkeletonScreen type="search" />
      </div>
    );
  }

  const handleApprove = async (documentId: string) => {
    if (!currentUser) return;
    try {
      await approveDocument({ documentId: documentId as never, reviewerId: currentUser._id });
    } catch (error) {
      console.error("Failed to approve document:", error);
    }
  };

  const handleReject = async (documentId: string) => {
    if (!currentUser) return;
    try {
      await rejectDocument({
        documentId: documentId as never,
        reviewerId: currentUser._id,
        reason: "Document does not meet requirements",
      });
    } catch (error) {
      console.error("Failed to reject document:", error);
    }
  };

  const documentTypeLabel = (type: string) => {
    switch (type) {
      case "national_id": return "National ID";
      case "passport": return "Passport";
      case "drivers_license": return "Driver's License";
      case "vehicle_logbook": return "Vehicle Logbook";
      default: return type;
    }
  };

  return (
    <div className="min-h-screen pt-20 pb-16 px-4">
      <div className="max-w-3xl mx-auto">
        <BackLink href="/admin" />
        <h1 className="font-heading text-3xl font-bold bg-gradient-to-r from-brand-gold-400 to-brand-gold-600 bg-clip-text text-transparent mb-8">
          Verification Queue
        </h1>

        {documents.length === 0 ? (
          <EmptyState
            icon={<Check className="h-8 w-8 text-charcoal/30 dark:text-cream/30" />}
            title="No pending verifications"
            description="All documents have been reviewed."
          />
        ) : (
          <motion.div
            variants={staggerContainer}
            initial="initial"
            animate="animate"
            className="space-y-3"
          >
            {documents.map((doc) => (
              <motion.div key={doc._id} variants={fadeUp}>
                <div className="glass rounded-premium p-4 flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-full glass flex items-center justify-center">
                      <AlertTriangle className="h-4 w-4 text-brand-gold-400" />
                    </div>
                    <div>
                      <p className="font-medium text-sm text-charcoal dark:text-cream">
                        {documentTypeLabel(doc.documentType)}
                      </p>
                      <p className="text-xs text-charcoal/50 dark:text-cream/50">
                        {formatDate(doc.createdAt, "short")}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      icon={<Check className="h-4 w-4" />}
                      onClick={() => handleApprove(doc._id)}
                    >
                      Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="danger"
                      icon={<X className="h-4 w-4" />}
                      onClick={() => handleReject(doc._id)}
                    >
                      Reject
                    </Button>
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
