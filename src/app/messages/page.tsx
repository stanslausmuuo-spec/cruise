"use client";

import { useQuery } from "convex/react";
import { api } from "convex/_generated/api";
import { motion } from "framer-motion";
import { PageHeader } from "@/components/ui/page-header";
import { SkeletonScreen } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { ConversationListItem } from "@/components/messaging/conversation-list-item";
import { staggerContainer, fadeUp } from "@/lib/animations";
import { MessageSquare } from "lucide-react";

export default function MessagesPage() {
  const currentUser = useQuery(api.auth.getMe);
  const messages = useQuery(api.messages.getConversation, 
    currentUser ? { userId: currentUser._id, otherUserId: currentUser._id } : "skip"
  );

  if (currentUser === undefined) {
    return (
      <div className="min-h-screen pt-20 pb-16 px-4">
        <SkeletonScreen type="search" />
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
        ) : messages === undefined ? (
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
        ) : messages.length === 0 ? (
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
            {messages.map((msg) => (
              <motion.div key={msg._id} variants={fadeUp}>
                <ConversationListItem
                  id={msg._id}
                  name="User"
                  lastMessage={msg.content}
                  timestamp={msg.createdAt}
                  unreadCount={msg.read ? 0 : 1}
                />
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
}
