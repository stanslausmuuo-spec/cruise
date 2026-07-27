"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Upload, ShieldCheck, ArrowLeft, CheckCircle } from "lucide-react";

const documents = [
  { id: "national_id", label: "National ID", description: "Front and back" },
  { id: "passport", label: "Passport", description: "Photo page" },
  { id: "drivers_license", label: "Driver's License", description: "Both sides" },
  { id: "vehicle_logbook", label: "Vehicle Logbook", description: "For vehicle verification" },
];

export default function VerifyPage() {
  const [uploaded, setUploaded] = useState<string[]>([]);

  const toggle = (id: string) => {
    setUploaded((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 pt-20">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-lg">
        <Link href="/dashboard" className="inline-flex items-center gap-2 text-sm text-charcoal/60 dark:text-cream/60 hover:text-charcoal dark:hover:text-cream transition-colors mb-6">
          <ArrowLeft className="h-4 w-4" /> Back
        </Link>

        <Card glass className="p-8">
          <div className="text-center mb-6">
            <div className="h-16 w-16 rounded-full bg-brand-gold-400/10 flex items-center justify-center mx-auto mb-4">
              <ShieldCheck className="h-8 w-8 text-brand-gold-400" />
            </div>
            <h1 className="font-heading text-2xl font-bold text-charcoal dark:text-cream">Verify Your Identity</h1>
            <p className="text-sm text-charcoal/60 dark:text-cream/60 mt-1">
              Upload your documents to get verified. All documents are encrypted.
            </p>
          </div>

          <div className="space-y-3 mb-6">
            {documents.map((doc) => (
              <button
                key={doc.id}
                onClick={() => toggle(doc.id)}
                className={`w-full flex items-center gap-4 p-4 rounded-premium border transition-all ${
                  uploaded.includes(doc.id)
                    ? "border-green-500/50 bg-green-500/5"
                    : "border-charcoal/10 dark:border-white/10 hover:border-brand-gold-400/30"
                }`}
              >
                <div className={`h-10 w-10 rounded-full flex items-center justify-center ${
                  uploaded.includes(doc.id)
                    ? "bg-green-500/10 text-green-500"
                    : "glass text-charcoal/50 dark:text-cream/50"
                }`}>
                  {uploaded.includes(doc.id) ? (
                    <CheckCircle className="h-5 w-5" />
                  ) : (
                    <Upload className="h-5 w-5" />
                  )}
                </div>
                <div className="text-left flex-1">
                  <p className="text-sm font-medium text-charcoal dark:text-cream">{doc.label}</p>
                  <p className="text-xs text-charcoal/50 dark:text-cream/50">{doc.description}</p>
                </div>
              </button>
            ))}
          </div>

          <Button className="w-full" disabled={uploaded.length === 0}>
            Submit for Verification
          </Button>

          <p className="text-xs text-charcoal/40 dark:text-cream/40 text-center mt-4">
            Documents are reviewed within 24 hours. You will be notified once verified.
          </p>
        </Card>
      </motion.div>
    </div>
  );
}
