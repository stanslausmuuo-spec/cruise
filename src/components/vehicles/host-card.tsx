"use client";

import { Avatar } from "@/components/ui/avatar";
import { Star, ShieldCheck } from "lucide-react";
import type { User } from "@/lib/types";

interface HostCardProps {
  host: User;
}

function HostCard({ host }: HostCardProps) {
  return (
    <div className="glass rounded-premium p-5">
      <div className="flex items-center gap-3 mb-3">
        <Avatar
          name={host.name}
          src={host.avatarUrl}
          size="md"
          verified={host.verified}
        />
        <div>
          <p className="font-medium text-sm text-charcoal dark:text-cream">
            {host.name}
          </p>
          <div className="flex items-center gap-1 text-xs text-charcoal/50 dark:text-cream/50">
            <Star className="h-3 w-3 text-brand-gold-400 fill-brand-gold-400" />
            {host.rating} &middot; {host.reviewCount} reviews
          </div>
        </div>
      </div>
      {host.verified && (
        <div className="flex items-center gap-1.5 text-xs text-brand-gold-400">
          <ShieldCheck className="h-3 w-3" />
          Verified Host
        </div>
      )}
    </div>
  );
}

export { HostCard };
