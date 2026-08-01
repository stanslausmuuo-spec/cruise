"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "convex/_generated/api";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { ShieldCheck, AlertTriangle, Car, Users, ChevronRight } from "lucide-react";

export default function AdminPage() {
  const router = useRouter();
  const isAdmin = useQuery(api.auth.isAdmin);
  const pendingVerifications = useQuery(api.verification.getPendingVerifications);
  const openDisputes = useQuery(api.disputes.getOpenDisputes);

  const verificationCount = pendingVerifications?.length ?? "–";
  const disputeCount = openDisputes?.length ?? "–";

  useEffect(() => {
    if (isAdmin === false) {
      router.push("/");
    }
  }, [isAdmin, router]);

  if (isAdmin === undefined) {
    return (
      <div className="min-h-screen pt-20 pb-16 px-4">
        <div className="max-w-4xl mx-auto text-center py-20">
          <p className="text-charcoal/60 dark:text-cream/60">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen pt-20 pb-16 px-4">
        <div className="max-w-4xl mx-auto text-center py-20">
          <p className="text-charcoal/60 dark:text-cream/60">Access denied</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 pb-16 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="font-heading text-3xl font-bold text-charcoal dark:text-cream mb-8">
          Admin <span className="text-brand-gold-400">Dashboard</span>
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Link href="/admin/verifications">
            <Card glass className="p-5 hover:shadow-premium-hover transition-shadow">
              <ShieldCheck className="h-8 w-8 text-brand-gold-400 mb-3" />
              <p className="text-2xl font-heading font-bold text-charcoal dark:text-cream">
                {verificationCount}
              </p>
              <p className="text-xs text-charcoal/50 dark:text-cream/50">Pending Verifications</p>
            </Card>
          </Link>
          <Card glass className="p-5">
            <AlertTriangle className="h-8 w-8 text-red-400 mb-3" />
            <p className="text-2xl font-heading font-bold text-charcoal dark:text-cream">
              {disputeCount}
            </p>
            <p className="text-xs text-charcoal/50 dark:text-cream/50">Open Disputes</p>
          </Card>
          <Card glass className="p-5">
            <Car className="h-8 w-8 text-brand-gold-400 mb-3" />
            <p className="text-2xl font-heading font-bold text-charcoal dark:text-cream">–</p>
            <p className="text-xs text-charcoal/50 dark:text-cream/50">Active Listings</p>
          </Card>
          <Card glass className="p-5">
            <Users className="h-8 w-8 text-brand-gold-400 mb-3" />
            <p className="text-2xl font-heading font-bold text-charcoal dark:text-cream">–</p>
            <p className="text-xs text-charcoal/50 dark:text-cream/50">Total Users</p>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link href="/admin/verifications">
            <Card glass className="p-5 flex items-center justify-between hover:shadow-premium-hover transition-shadow">
              <div className="flex items-center gap-3">
                <ShieldCheck className="h-5 w-5 text-brand-gold-400" />
                <span className="font-medium text-charcoal dark:text-cream">Verification Queue</span>
              </div>
              <ChevronRight className="h-5 w-5 text-charcoal/30 dark:text-cream/30" />
            </Card>
          </Link>
          <Link href="/admin/disputes">
            <Card glass className="p-5 flex items-center justify-between hover:shadow-premium-hover transition-shadow">
              <div className="flex items-center gap-3">
                <AlertTriangle className="h-5 w-5 text-red-400" />
                <span className="font-medium text-charcoal dark:text-cream">Disputes</span>
              </div>
              <ChevronRight className="h-5 w-5 text-charcoal/30 dark:text-cream/30" />
            </Card>
          </Link>
        </div>
      </div>
    </div>
  );
}