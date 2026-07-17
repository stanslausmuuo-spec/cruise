"use client";

import { Check } from "lucide-react";

interface Step {
  label: string;
  description?: string;
}

interface BookingWizardProps {
  steps: Step[];
  currentStep: number;
}

function BookingWizard({ steps, currentStep }: BookingWizardProps) {
  return (
    <div className="flex items-center justify-between mb-8">
      {steps.map((step, i) => {
        const isCompleted = i < currentStep;
        const isCurrent = i === currentStep;

        return (
          <div key={i} className="flex items-center flex-1 last:flex-none">
            <div className="flex flex-col items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                  isCompleted
                    ? "bg-green-500 text-white"
                    : isCurrent
                    ? "bg-brand-gold-400 text-white"
                    : "bg-charcoal/10 dark:bg-white/10 text-charcoal/50 dark:text-cream/50"
                }`}
              >
                {isCompleted ? <Check className="h-5 w-5" /> : i + 1}
              </div>
              <span
                className={`text-xs mt-2 font-medium ${
                  isCurrent
                    ? "text-brand-gold-400"
                    : "text-charcoal/50 dark:text-cream/50"
                }`}
              >
                {step.label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div
                className={`flex-1 h-0.5 mx-3 ${
                  i < currentStep
                    ? "bg-green-500"
                    : "bg-charcoal/10 dark:bg-white/10"
                }`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

export { BookingWizard };
