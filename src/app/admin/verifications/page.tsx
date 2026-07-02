"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Check, X, Eye } from "lucide-react";

const pendingVerifications = [
  { id: "1", name: "Jane Wanjiku", type: "National ID", submitted: "2h ago", status: "pending" },
  { id: "2", name: "Peter Kamau", type: "Driver's License", submitted: "5h ago", status: "pending" },
  { id: "3", name: "Mercy Achieng", type: "Vehicle Logbook", submitted: "1d ago", status: "pending" },
];

export default function VerificationsPage() {
  return (
    <div className="min-h-screen pt-20 pb-16 px-4">
      <div className="max-w-3xl mx-auto">
        <Link href="/admin" className="inline-flex items-center gap-2 text-sm text-charcoal/60 dark:text-cream/60 hover:text-charcoal dark:hover:text-cream transition-colors mb-6">
          <ArrowLeft className="h-4 w-4" /> Back
        </Link>
        <h1 className="font-heading text-3xl font-bold text-charcoal dark:text-cream mb-8">
          Verification <span className="text-gradient-gold">Queue</span>
        </h1>

        <div className="space-y-3">
          {pendingVerifications.map((v) => (
            <motion.div key={v.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <Card glass className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="h-10 w-10 rounded-full glass flex items-center justify-center">
                    <Eye className="h-4 w-4 text-brand-gold-400" />
                  </div>
                  <div>
                    <p className="font-medium text-sm text-charcoal dark:text-cream">{v.name}</p>
                    <p className="text-xs text-charcoal/50 dark:text-cream/50">{v.type} &middot; {v.submitted}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button size="sm" variant="ghost" icon={<Check className="h-4 w-4" />}>Approve</Button>
                  <Button size="sm" variant="danger" icon={<X className="h-4 w-4" />}>Reject</Button>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        {pendingVerifications.length === 0 && (
          <div className="text-center py-20">
            <p className="text-charcoal/40 dark:text-cream/40">No pending verifications</p>
          </div>
        )}
      </div>
    </div>
  );
}
