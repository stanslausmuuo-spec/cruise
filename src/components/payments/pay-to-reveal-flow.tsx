"use client";

import { useState, useEffect } from "react";
import { useMutation } from "convex/react";
import { api } from "convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Lock, Eye, Star, Zap, Loader2, CheckCircle } from "lucide-react";

interface PayToRevealFlowProps {
  vehicleId: string;
  onSuccess?: () => void;
}

type Step = "input" | "polling" | "success" | "error";

function PayToRevealFlow({ vehicleId, onSuccess }: PayToRevealFlowProps) {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [step, setStep] = useState<Step>("input");
  const [checkoutRequestId, setCheckoutRequestId] = useState("");
  const [error, setError] = useState("");
  const [revealedPhone, setRevealedPhone] = useState("");
  const [pollCount, setPollCount] = useState(0);

  const createPayToReveal = useMutation(api.payments.createPayToReveal);

  // Poll for payment status
  useEffect(() => {
    if (step !== "polling") return;

    const pollInterval = setInterval(async () => {
      setPollCount((c) => c + 1);
      if (pollCount > 30) {
        clearInterval(pollInterval);
        setStep("error");
        setError("Payment timed out. Please try again.");
        return;
      }

      try {
        const response = await fetch(`/api/payments/reveal/status?checkoutRequestId=${checkoutRequestId}`);
        const data = await response.json();
        if (data.revealed) {
          clearInterval(pollInterval);
          setStep("success");
          setRevealedPhone(data.phone);
          onSuccess?.();
        }
      } catch {
        // Keep polling
      }
    }, 5000);

    return () => clearInterval(pollInterval);
  }, [step, checkoutRequestId, pollCount, onSuccess]);

  const handleReveal = async () => {
    if (!phoneNumber || phoneNumber.length < 10) return;
    setError("");
    setStep("polling");
    setPollCount(0);

    try {
      const response = await fetch("/api/mpesa/stkpush", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          phoneNumber,
          amount: 100, // KES 100 for reveal
          accountReference: `REVEAL-${vehicleId.slice(0, 8)}`,
          transactionDesc: "Reveal host contact",
          type: "reveal",
          metadata: { vehicleId },
        }),
      });

      const data = await response.json();

      if (data.success && data.checkoutRequestId) {
        setCheckoutRequestId(data.checkoutRequestId);

        // Create the reveal record with checkoutRequestId
        await createPayToReveal({
          vehicleId: vehicleId as never,
          amount: 100,
          phoneNumber,
          checkoutRequestId: data.checkoutRequestId,
        });
      } else {
        throw new Error(data.error || "Failed to initiate payment");
      }
    } catch (err) {
      setStep("error");
      setError(err instanceof Error ? err.message : "Failed to initiate payment");
    }
  };

  if (step === "success") {
    return (
      <div className="glass rounded-premium p-6 text-center">
        <div className="h-16 w-16 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="h-8 w-8 text-green-500" />
        </div>
        <h3 className="font-heading text-xl font-bold text-charcoal dark:text-cream mb-2">
          Contact Revealed!
        </h3>
        <p className="text-sm text-charcoal/60 dark:text-cream/60 mb-4">
          You can now contact the host directly
        </p>
        <div className="glass rounded-premium p-4 mb-4">
          <p className="text-2xl font-heading font-bold text-charcoal dark:text-cream">{revealedPhone}</p>
        </div>
        <Button variant="outline" onClick={() => onSuccess?.()}>
          Continue to Vehicle
        </Button>
      </div>
    );
  }

  return (
    <div className="glass rounded-premium p-6 text-center">
      <div className="h-16 w-16 rounded-full bg-brand-gold-400/10 flex items-center justify-center mx-auto mb-4">
        <Lock className="h-8 w-8 text-brand-gold-400" />
      </div>
      <h3 className="font-heading text-xl font-bold text-charcoal dark:text-cream mb-2">
        Reveal Owner Details
      </h3>
      <p className="text-sm text-charcoal/60 dark:text-cream/60 mb-4">
        Pay KES 100 to view the owner&apos;s contact information
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

      {step === "polling" && (
        <div className="space-y-4">
          <div className="flex items-center justify-center gap-3">
            <Loader2 className="h-6 w-6 text-brand-gold-400 animate-spin" />
            <p className="text-sm text-charcoal/60 dark:text-cream/60">
              Waiting for payment... Check your phone for M-Pesa prompt
            </p>
          </div>
          <div className="h-2 bg-charcoal/10 dark:bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-brand-gold-400 animate-pulse"
              style={{ width: `${Math.min((pollCount / 30) * 100, 100)}%` }}
            />
          </div>
          <p className="text-xs text-charcoal/40 dark:text-cream/40">
            {30 - pollCount} seconds remaining...
          </p>
        </div>
      )}

      {step === "input" || step === "error" ? (
        <>
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
              disabled={phoneNumber.length < 10}
              icon={<Zap className="h-4 w-4" />}
            >
              Pay KES 100
            </Button>
          </div>

          {error && (
            <div className="text-sm text-red-500 mb-4 flex items-center justify-center gap-1">
              <span>{error}</span>
              <Button variant="ghost" size="sm" onClick={() => setStep("input")}>
                Try Again
              </Button>
            </div>
          )}

          <p className="text-xs text-charcoal/40 dark:text-cream/40">
            M-Pesa STK Push will be sent to your phone
          </p>
        </>
      ) : null}
    </div>
  );
}

export { PayToRevealFlow };