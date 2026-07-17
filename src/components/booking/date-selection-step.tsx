"use client";

import { Input } from "@/components/ui/input";
import { formatDate } from "@/lib/utils";

interface DateSelectionStepProps {
  startDate: string;
  endDate: string;
  onStartDateChange: (date: string) => void;
  onEndDateChange: (date: string) => void;
  numberOfDays: number;
}

function DateSelectionStep({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
  numberOfDays,
}: DateSelectionStepProps) {
  const today = new Date().toISOString().split("T")[0];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Pickup Date"
          type="date"
          min={today}
          value={startDate}
          onChange={(e) => onStartDateChange(e.target.value)}
        />
        <Input
          label="Return Date"
          type="date"
          min={startDate || today}
          value={endDate}
          onChange={(e) => onEndDateChange(e.target.value)}
        />
      </div>
      {numberOfDays > 0 && (
        <p className="text-sm text-charcoal/60 dark:text-cream/60">
          {numberOfDays} day{numberOfDays !== 1 ? "s" : ""} rental
        </p>
      )}
    </div>
  );
}

export { DateSelectionStep };
