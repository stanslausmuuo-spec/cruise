"use client";

import { useState } from "react";
import { useMutation } from "convex/react";
import { api } from "convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Lock, Eye, Star, Zap } from "lucide-react";

interface PayToRevealFlowProps {
  vehicleId: string;
  userId: string;
  onSuccess?: () => void;
}

function PayToRevealFlow({ vehicleId, userId, onSuccess }: PayToRevealFlowProps) {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const createPayToReveal = useMutation(api.payments.createPayToReveal);

  const handleReveal = async () => {
    if (!phoneNumber || phoneNumber.length < 10) return;
    setLoading(true);
    try {
      await createPayToReveal({
        userId: userId as never,
        vehicleId: vehicleId as never,
        amount: 50,
        phoneNumber,
      });
      onSuccess?.();
    } catch (error) {
      console.error("Failed to create pay-to-reveal:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass rounded-premium p-6 text-center">
      <div className="h-16 w-16 rounded-full bg-brand-gold-400/10 flex items-center justify-center mx-auto mb-4">
        <Lock className="h-8 w-8 text-brand-gold-400" />
      </div>
      <h3 className="font-heading text-xl font-bold text-charcoal dark:text-cream mb-2">
        Reveal Owner Details
      </h3>
      <p className="text-sm text-charcoal/60 dark:text-cream/60 mb-4">
        Pay KES 50 to view the owner&apos;s contact information
      </p>
      <div className="flex items-center gap-2 justify-center mb-6">
        <Badge variant="verified">
          <Eye className="h-3 w-3 mr-1" />
          Full Details
        </Badge>
        <Badge variant="verified">
          <Star className="h-3 w-3 mr-1" />
          Reviews
        </Badge>
      </div>
      <div className="flex gap-2 mb-4">
        <Input
          type="tel"
          placeholder="0712345678"
          value={phoneNumber}
          onChange={(e) => setPhoneNumber(e.target.value)}
          className="flex-1"
        />
        <Button
          onClick={handleReveal}
          disabled={phoneNumber.length < 10 || loading}
          icon={loading ? undefined : <Zap className="h-4 w-4" />}
        >
          {loading ? "Processing..." : "Pay KES 50"}
        </Button>
      </div>
      <p className="text-xs text-charcoal/40 dark:text-cream/40">
        M-Pesa STK Push will be sent to your phone
      </p>
    </div>
  );
}

export { PayToRevealFlow };
