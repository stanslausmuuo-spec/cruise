"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Avatar } from "@/components/ui/avatar";
import { staggerContainer, fadeUp } from "@/lib/animations";
import { MessageSquare } from "lucide-react";

const conversations = [
  { id: "1", name: "James Mwangi", lastMessage: "The car is ready for pickup at 10am", time: "2m ago", unread: 2, online: true },
  { id: "2", name: "Sarah Wanjiku", lastMessage: "Thanks for the smooth transaction!", time: "1h ago", unread: 0, online: false },
  { id: "3", name: "Michael Ochieng", lastMessage: "Is the BMW still available for this weekend?", time: "3h ago", unread: 1, online: true },
];

export default function MessagesPage() {
  return (
    <div className="min-h-screen pt-20 pb-16 px-4">
      <div className="max-w-2xl mx-auto">
        <h1 className="font-heading text-3xl font-bold text-charcoal dark:text-cream mb-8">
          <span className="text-gradient-gold">Messages</span>
        </h1>

        <motion.div variants={staggerContainer} initial="initial" animate="animate" className="space-y-2">
          {conversations.map((conv, i) => (
            <motion.div key={conv.id} variants={fadeUp}>
              <Link href={`/messages/${conv.id}`}>
                <Card glass className="flex items-center gap-4 p-4">
                  <Avatar name={conv.name} online={conv.online} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium text-sm text-charcoal dark:text-cream">{conv.name}</h3>
                      <span className="text-xs text-charcoal/40 dark:text-cream/40">{conv.time}</span>
                    </div>
                    <p className="text-sm text-charcoal/60 dark:text-cream/60 truncate">{conv.lastMessage}</p>
                  </div>
                  {conv.unread > 0 && (
                    <div className="h-5 w-5 rounded-full bg-brand-gold-400 flex items-center justify-center">
                      <span className="text-[10px] font-bold text-white">{conv.unread}</span>
                    </div>
                  )}
                </Card>
              </Link>
            </motion.div>
          ))}
        </motion.div>

        {conversations.length === 0 && (
          <div className="text-center py-20">
            <MessageSquare className="h-12 w-12 mx-auto mb-3 text-charcoal/20 dark:text-cream/20" />
            <p className="text-sm text-charcoal/40 dark:text-cream/40">No messages yet</p>
          </div>
        )}
      </div>
    </div>
  );
}
