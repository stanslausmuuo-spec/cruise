"use client";

import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft } from "lucide-react";

const disputes = [
  { id: "1", booking: "CRU-001", raisedBy: "John D.", reason: "Scratch on rear bumper", status: "investigating", date: "2d ago" },
  { id: "2", booking: "CRU-002", raisedBy: "Sarah W.", reason: "Late return by 4 hours", status: "open", date: "1d ago" },
];

export default function DisputesPage() {
  return (
    <div className="min-h-screen pt-20 pb-16 px-4">
      <div className="max-w-3xl mx-auto">
        <Link href="/admin" className="inline-flex items-center gap-2 text-sm text-charcoal/60 dark:text-cream/60 hover:text-charcoal dark:hover:text-cream transition-colors mb-6">
          <ArrowLeft className="h-4 w-4" /> Back
        </Link>
        <h1 className="font-heading text-3xl font-bold text-charcoal dark:text-cream mb-8">
          <span className="text-gradient-gold">Disputes</span>
        </h1>

        <div className="space-y-3">
          {disputes.map((d) => (
            <Card key={d.id} glass className="p-4">
              <div className="flex items-center justify-between mb-2">
                <p className="font-medium text-sm text-charcoal dark:text-cream">{d.booking}</p>
                <Badge variant={d.status === "open" ? "featured" : "status"}>
                  {d.status}
                </Badge>
              </div>
              <p className="text-xs text-charcoal/60 dark:text-cream/60">{d.reason}</p>
              <div className="flex items-center justify-between mt-2">
                <p className="text-xs text-charcoal/40 dark:text-cream/40">{d.raisedBy} &middot; {d.date}</p>
                <button className="text-xs text-brand-gold-400 hover:underline">Review →</button>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
