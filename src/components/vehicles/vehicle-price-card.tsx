"use client";

import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Phone, MessageSquare } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import type { Vehicle } from "@/lib/types";

interface VehiclePriceCardProps {
  vehicle: Vehicle;
  ownerPhone?: string | null;
}

function VehiclePriceCard({ vehicle, ownerPhone }: VehiclePriceCardProps) {
  const hasPhone = Boolean(ownerPhone);

  return (
    <Card glass className="p-6">
      <div className="text-center mb-6">
        <p className="font-heading text-3xl font-bold text-brand-gold-400">
          {formatCurrency(vehicle.pricePerDay)}
          <span className="text-sm font-normal text-charcoal/50 dark:text-cream/50">
            {" "}/day
          </span>
        </p>
      </div>

      <Link href={`/vehicles/${vehicle._id}/book`}>
        <Button className="w-full mb-3" size="lg">
          <Calendar className="h-4 w-4" />
          Book Now
        </Button>
      </Link>

      {hasPhone ? (
        <a
          href={`tel:${ownerPhone}`}
          className="block w-full"
        >
          <Button variant="outline" className="w-full" size="lg">
            <Phone className="h-4 w-4" />
            Call the owner — {ownerPhone}
          </Button>
        </a>
      ) : (
        <Link href={`/messages/${vehicle.ownerId}`} className="block w-full">
          <Button variant="outline" className="w-full" size="lg">
            <MessageSquare className="h-4 w-4" />
            Message the owner
          </Button>
        </Link>
      )}
    </Card>
  );
}

export { VehiclePriceCard };
