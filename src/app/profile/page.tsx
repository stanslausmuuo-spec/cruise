"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "convex/_generated/api";
import { motion } from "framer-motion";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { SkeletonScreen } from "@/components/ui/skeleton";
import { RatingDisplay } from "@/components/reviews/review-card";
import { staggerContainer, fadeUp } from "@/lib/animations";
import { Sun, Moon, Monitor, ShieldCheck, Star, Car, CalendarClock } from "lucide-react";

export default function ProfilePage() {
  const currentUser = useQuery(api.auth.getMe);
  const vehicles = useQuery(
    api.vehicles.getOwnerVehicles,
    currentUser ? { ownerId: currentUser._id } : "skip"
  );
  const updateTheme = useMutation(api.users.updateTheme);

  if (currentUser === undefined) {
    return (
      <div className="min-h-screen pt-20 pb-16 px-4">
        <SkeletonScreen type="dashboard" />
      </div>
    );
  }

  if (!currentUser) {
    return (
      <div className="min-h-screen pt-20 pb-16 px-4">
        <div className="max-w-2xl mx-auto text-center py-20">
          <p className="text-charcoal/60 dark:text-cream/60 mb-4">Please sign in to view your profile.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 pb-16 px-4">
      <div className="max-w-2xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="text-center mb-8">
            <Avatar
              name={currentUser.name}
              size="lg"
              verified={currentUser.verified}
              className="mx-auto mb-4"
            />
            <h1 className="font-heading text-2xl font-bold text-charcoal dark:text-cream">
              {currentUser.name}
            </h1>
            <p className="text-sm text-charcoal/60 dark:text-cream/60">
              {currentUser.email} &middot; {currentUser.phone}
            </p>
            <div className="flex items-center justify-center gap-2 mt-2">
              {currentUser.verified && <Badge variant="verified">Verified</Badge>}
              <RatingDisplay rating={currentUser.rating} count={currentUser.reviewCount} />
            </div>
          </div>

          <motion.div variants={staggerContainer} initial="initial" animate="animate" className="space-y-4">
            <motion.div variants={fadeUp}>
              <div className="grid grid-cols-3 gap-4">
                <Card glass className="p-4 text-center">
                  <Car className="h-5 w-5 mx-auto mb-1 text-brand-gold-400" />
                  <p className="text-lg font-heading font-bold text-charcoal dark:text-cream">
                    {vehicles?.length ?? 0}
                  </p>
                  <p className="text-xs text-charcoal/50 dark:text-cream/50">Vehicles</p>
                </Card>
                <Card glass className="p-4 text-center">
                  <CalendarClock className="h-5 w-5 mx-auto mb-1 text-brand-gold-400" />
                  <p className="text-lg font-heading font-bold text-charcoal dark:text-cream">
                    {currentUser.reviewCount}
                  </p>
                  <p className="text-xs text-charcoal/50 dark:text-cream/50">Reviews</p>
                </Card>
                <Card glass className="p-4 text-center">
                  <Star className="h-5 w-5 mx-auto mb-1 text-brand-gold-400" />
                  <p className="text-lg font-heading font-bold text-charcoal dark:text-cream">
                    {currentUser.rating.toFixed(1)}
                  </p>
                  <p className="text-xs text-charcoal/50 dark:text-cream/50">Rating</p>
                </Card>
              </div>
            </motion.div>

            <motion.div variants={fadeUp}>
              <Card glass className="p-5">
                <h2 className="font-heading text-lg font-bold text-charcoal dark:text-cream mb-4">
                  Theme
                </h2>
                <div className="flex gap-3">
                  {[
                    { value: "light" as const, icon: Sun, label: "Light" },
                    { value: "dark" as const, icon: Moon, label: "Dark" },
                    { value: "system" as const, icon: Monitor, label: "System" },
                  ].map((t) => (
                    <button
                      key={t.value}
                      onClick={() => updateTheme({ userId: currentUser._id, theme: t.value })}
                      className={`flex-1 p-3 rounded-premium border transition-all text-center ${
                        currentUser.theme === t.value
                          ? "border-brand-gold-400 bg-brand-gold-400/10"
                          : "border-charcoal/10 dark:border-white/10 hover:border-brand-gold-400/30"
                      }`}
                    >
                      <t.icon className="h-5 w-5 mx-auto mb-1 text-brand-gold-400" />
                      <span className="text-xs font-medium text-charcoal dark:text-cream">
                        {t.label}
                      </span>
                    </button>
                  ))}
                </div>
              </Card>
            </motion.div>

            <motion.div variants={fadeUp}>
              <Card glass className="p-5">
                <h2 className="font-heading text-lg font-bold text-charcoal dark:text-cream mb-4">
                  KYC Status
                </h2>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <ShieldCheck className={`h-5 w-5 ${currentUser.verified ? "text-green-500" : "text-charcoal/30 dark:text-cream/30"}`} />
                    <div>
                      <p className="text-sm font-medium text-charcoal dark:text-cream">
                        {currentUser.verified ? "Identity Verified" : "Not Verified"}
                      </p>
                      <p className="text-xs text-charcoal/50 dark:text-cream/50">
                        {currentUser.kycStatus === "pending" ? "Documents under review" :
                         currentUser.kycStatus === "approved" ? "All documents approved" :
                         currentUser.kycStatus === "rejected" ? "Documents rejected" :
                         "No documents uploaded"}
                      </p>
                    </div>
                  </div>
                  <Badge variant={currentUser.verified ? "verified" : "status"}>
                    {currentUser.kycStatus || "None"}
                  </Badge>
                </div>
              </Card>
            </motion.div>

            <motion.div variants={fadeUp}>
              <Card glass className="p-5">
                <h2 className="font-heading text-lg font-bold text-charcoal dark:text-cream mb-2">
                  Roles
                </h2>
                <div className="flex flex-wrap gap-2">
                  {currentUser.roles.map((role) => (
                    <Badge key={role} variant="verified">{role}</Badge>
                  ))}
                </div>
              </Card>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
