"use client";

import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { formatDate } from "@/lib/utils";

interface ConversationListItemProps {
  id: string;
  name: string;
  avatarUrl?: string;
  lastMessage: string;
  timestamp: number;
  unreadCount: number;
  online?: boolean;
}

function ConversationListItem({
  id,
  name,
  avatarUrl,
  lastMessage,
  timestamp,
  unreadCount,
  online,
}: ConversationListItemProps) {
  return (
    <Link href={`/messages/${id}`}>
      <Card className="p-4 flex items-center gap-3">
        <Avatar name={name} src={avatarUrl} size="md" online={online} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <p className="font-medium text-sm text-charcoal dark:text-cream truncate">
              {name}
            </p>
            <span className="text-xs text-charcoal/50 dark:text-cream/50 shrink-0">
              {formatDate(timestamp, "relative")}
            </span>
          </div>
          <p className="text-xs text-charcoal/60 dark:text-cream/60 truncate mt-0.5">
            {lastMessage}
          </p>
        </div>
        {unreadCount > 0 && (
          <div className="h-5 w-5 rounded-full bg-brand-gold-400 flex items-center justify-center shrink-0">
            <span className="text-[10px] font-bold text-white">
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          </div>
        )}
      </Card>
    </Link>
  );
}

export { ConversationListItem };
