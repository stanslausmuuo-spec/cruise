"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eye, Check, X } from "lucide-react";
import type { KycDocument, User } from "@/lib/types";

interface VerificationCardProps {
  document: KycDocument;
  user?: User;
  onApprove: (documentId: string) => void;
  onReject: (documentId: string) => void;
}

function VerificationCard({ document, user, onApprove, onReject }: VerificationCardProps) {
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
    <div className="glass rounded-premium p-4">
      <div className="flex items-center justify-between mb-3">
        <div>
          <p className="font-medium text-sm text-charcoal dark:text-cream">
            {user?.name || "User"}
          </p>
          <p className="text-xs text-charcoal/60 dark:text-cream/60">
            {documentTypeLabel(document.documentType)}
          </p>
        </div>
        <Badge variant="status">Pending</Badge>
      </div>

      <div className="flex items-center gap-2 mb-4">
        <Button variant="ghost" size="sm" icon={<Eye className="h-4 w-4" />}>
          View
        </Button>
      </div>

      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          className="flex-1"
          onClick={() => onApprove(document._id)}
        >
          <Check className="h-4 w-4" />
          Approve
        </Button>
        <Button
          variant="danger"
          size="sm"
          className="flex-1"
          onClick={() => onReject(document._id)}
        >
          <X className="h-4 w-4" />
          Reject
        </Button>
      </div>
    </div>
  );
}

export { VerificationCard };
