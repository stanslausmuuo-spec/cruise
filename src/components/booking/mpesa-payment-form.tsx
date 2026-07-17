"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Smartphone, Shield } from "lucide-react";

interface MPesaPaymentFormProps {
  amount: number;
  onPaymentInitiated: (phoneNumber: string) => void;
  loading?: boolean;
}

function MPesaPaymentForm({ amount, onPaymentInitiated, loading }: MPesaPaymentFormProps) {
  const [phoneNumber, setPhoneNumber] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (phoneNumber.length >= 10) {
      onPaymentInitiated(phoneNumber);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="text-center mb-6">
        <div className="h-16 w-16 rounded-full bg-green-500/10 flex items-center justify-center mx-auto mb-4">
          <Smartphone className="h-8 w-8 text-green-500" />
        </div>
        <h3 className="font-heading text-lg font-bold text-charcoal dark:text-cream">
          M-Pesa Payment
        </h3>
        <p className="text-sm text-charcoal/60 dark:text-cream/60 mt-1">
          Pay {new Intl.NumberFormat("en-KE", { style: "currency", currency: "KES", minimumFractionDigits: 0 }).format(amount)} via Safaricom M-Pesa
        </p>
      </div>

      <Input
        label="M-Pesa Phone Number"
        type="tel"
        placeholder="0712 345 678"
        value={phoneNumber}
        onChange={(e) => setPhoneNumber(e.target.value)}
        icon={<Smartphone className="h-4 w-4" />}
      />

      <div className="glass rounded-premium p-3">
        <p className="text-xs text-charcoal/60 dark:text-cream/60 text-center">
          You will receive an STK Push prompt on your phone to complete the payment.
        </p>
      </div>

      <Button
        type="submit"
        className="w-full"
        size="lg"
        loading={loading}
        disabled={phoneNumber.length < 10}
      >
        <Shield className="h-4 w-4" />
        Pay Securely
      </Button>
    </form>
  );
}

export { MPesaPaymentForm };
