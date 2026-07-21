"use client";

import { useQuery } from "convex/react";
import { api } from "convex/_generated/api";
import { motion } from "framer-motion";
import { PageHeader } from "@/components/ui/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { Avatar } from "@/components/ui/avatar";
import { staggerContainer, fadeUp } from "@/lib/animations";
import { MessageSquare } from "lucide-react";
import { formatDate } from "@/lib/utils";
import Link from "next/link";

export default function MessagesPage() {
  const currentUser = useQuery(api.auth.getMe);
  const conversations = useQuery(
    api.messages.getConversations,
    currentUser ? {} : "skip"
  );

  if (currentUser === undefined) {
    return (
      <div className="min-h-screen pt-20 pb-16 px-4">
        <div className="max-w-2xl mx-auto space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="glass rounded-premium p-4 flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-charcoal/10 dark:bg-white/10" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-1/3 rounded bg-charcoal/10 dark:bg-white/10" />
                <div className="h-3 w-2/3 rounded bg-charcoal/5 dark:bg-white/5" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 pb-16 px-4">
      <div className="max-w-2xl mx-auto">
        <PageHeader title="Messages" />

        {!currentUser ? (
          <EmptyState
            icon={<MessageSquare className="h-8 w-8 text-charcoal/30 dark:text-cream/30" />}
            title="Sign in to view messages"
            description="Create an account or sign in to start messaging hosts and renters."
          />
        ) : conversations === undefined ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="glass rounded-premium p-4 flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-charcoal/10 dark:bg-white/10" />
                <div className="flex-1 space-y-2">
                  <div className="h-4 w-1/3 rounded bg-charcoal/10 dark:bg-white/10" />
                  <div className="h-3 w-2/3 rounded bg-charcoal/5 dark:bg-white/5" />
                </div>
              </div>
            ))}
          </div>
        ) : conversations.length === 0 ? (
          <EmptyState
            icon={<MessageSquare className="h-8 w-8 text-charcoal/30 dark:text-cream/30" />}
            title="No messages yet"
            description="Start a conversation by contacting a host or renter."
          />
        ) : (
          <motion.div
            variants={staggerContainer}
            initial="initial"
            animate="animate"
            className="space-y-3"
          >
            {conversations.map((conv) => (
              <motion.div key={conv.partnerId} variants={fadeUp}>
                <Link href={`/messages/${conv.partnerId}`}>
                  <div className="glass rounded-premium p-4 flex items-center gap-3 hover:shadow-premium-hover transition-shadow cursor-pointer">
                    <Avatar name={conv.partnerName} src={conv.partnerAvatar} size="md" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <p className="font-medium text-sm text-charcoal dark:text-cream truncate">
                          {conv.partnerName}
                        </p>
                        <span className="text-xs text-charcoal/40 dark:text-cream/40 shrink-0 ml-2">
                          {formatDate(conv.lastTimestamp, "relative")}
                        </span>
                      </div>
                      <p className="text-xs text-charcoal/50 dark:text-cream/50 truncate">
                        {conv.lastMessage}
                      </p>
                    </div>
                    {conv.unreadCount > 0 && (
                      <span className="h-5 min-w-5 rounded-full bg-brand-gold-400 text-white text-[10px] font-bold flex items-center justify-center px-1.5 shrink-0">
                        {conv.unreadCount}
                      </span>
                    )}
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
}
