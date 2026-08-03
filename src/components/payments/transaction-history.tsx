"use client";

import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import type { Transaction } from "@/lib/types";

interface TransactionHistoryProps {
  transactions: Transaction[];
}

function TransactionHistory({ transactions }: TransactionHistoryProps) {
  const typeLabel = (type: string) => {
    switch (type) {
      case "plan_purchase": return "Plan Purchase";
      default: return type;
    }
  };

  const typeVariant = (type: string) => {
    switch (type) {
      case "plan_purchase": return "featured";
      default: return "status";
    }
  };

  if (transactions.length === 0) {
    return (
      <div className="glass rounded-premium p-8 text-center">
        <p className="text-charcoal/70 dark:text-cream/70">No transactions yet</p>
      </div>
    );
  }

  return (
    <div className="glass rounded-premium overflow-hidden">
      {transactions.map((transaction) => (
        <div
          key={transaction._id}
          className="p-4 border-b border-charcoal/5 dark:border-white/5 last:border-0"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-sm text-charcoal dark:text-cream">
                {typeLabel(transaction.type)}
              </p>
              <p className="text-xs text-charcoal/50 dark:text-cream/50">
                {transaction.reference} &middot; {formatDate(transaction.createdAt, "short")}
              </p>
            </div>
            <div className="text-right">
              <p className="font-heading font-bold text-brand-gold-400">
                KES {transaction.amount.toLocaleString()}
              </p>
              <Badge variant={typeVariant(transaction.type) as "verified" | "featured" | "status"}>
                {transaction.status}
              </Badge>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export { TransactionHistory };
