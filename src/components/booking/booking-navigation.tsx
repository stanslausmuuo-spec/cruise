"use client";

import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface BookingNavigationProps {
  currentStep: number;
  totalSteps: number;
  onBack: () => void;
  onNext: () => void;
  loading?: boolean;
  nextLabel?: string;
}

function BookingNavigation({
  currentStep,
  totalSteps,
  onBack,
  onNext,
  loading,
  nextLabel,
}: BookingNavigationProps) {
  return (
    <div className="flex justify-between mt-8">
      <Button
        variant="ghost"
        size="sm"
        onClick={onBack}
        disabled={currentStep === 0}
      >
        <ChevronLeft className="h-4 w-4" /> Back
      </Button>
      <Button
        size="sm"
        onClick={onNext}
        loading={loading}
      >
        {nextLabel || (currentStep === totalSteps - 1 ? "Confirm Booking" : "Continue")}
        <ChevronRight className="h-4 w-4" />
      </Button>
    </div>
  );
}

export { BookingNavigation };
