"use client";

import { useState, useRef, useEffect } from "react";
import { useParams } from "next/navigation";
import { useQuery, useMutation } from "convex/react";
import { api } from "convex/_generated/api";
import { motion } from "framer-motion";
import { SkeletonScreen } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { ChatHeader } from "@/components/messaging/chat-header";
import { MessageBubble } from "@/components/messaging/message-bubble";
import { MessageInput } from "@/components/messaging/message-input";
import { staggerContainer, fadeUp } from "@/lib/animations";
import { MessageSquare } from "lucide-react";
import type { Id } from "convex/_generated/dataModel";

export default function ConversationPage() {
  const params = useParams();
  const otherUserId = params.id as Id<"users">;
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const currentUser = useQuery(api.auth.getMe);
  const otherUser = useQuery(api.auth.getUser, { userId: otherUserId });
  const messages = useQuery(
    api.messages.getConversation,
    currentUser ? { userId: currentUser._id, otherUserId } : "skip"
  );
  const sendMessage = useMutation(api.messages.sendMessage);

  const [inputValue, setInputValue] = useState("");

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (content: string) => {
    if (!currentUser) return;
    try {
      await sendMessage({
        senderId: currentUser._id,
        receiverId: otherUserId,
        content,
      });
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  if (currentUser === undefined || otherUser === undefined) {
    return (
      <div className="min-h-screen pt-20 pb-16 px-4">
        <SkeletonScreen type="chat" />
      </div>
    );
  }

  if (!currentUser || !otherUser) {
    return (
      <div className="min-h-screen pt-20 pb-16 px-4">
        <EmptyState
          icon={<MessageSquare className="h-8 w-8 text-charcoal/30 dark:text-cream/30" />}
          title="User not found"
          description="This conversation partner no longer exists."
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-20 pb-4 px-4">
      <div className="max-w-2xl mx-auto flex flex-col h-[calc(100vh-100px)]">
        <ChatHeader
          name={otherUser.name}
          avatarUrl={otherUser.avatarUrl}
          online={true}
        />

        <div className="flex-1 overflow-y-auto py-4 space-y-4">
          {messages === undefined ? (
            <div className="space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className={`flex ${i % 2 === 0 ? "justify-end" : ""}`}>
                  <div className="h-12 rounded-2xl bg-charcoal/5 dark:bg-white/5 w-2/3" />
                </div>
              ))}
            </div>
          ) : messages.length === 0 ? (
            <EmptyState
              icon={<MessageSquare className="h-8 w-8 text-charcoal/30 dark:text-cream/30" />}
              title="Start a conversation"
              description="Send a message to get started."
            />
          ) : (
            <motion.div
              variants={staggerContainer}
              initial="initial"
              animate="animate"
              className="space-y-4"
            >
              {messages.map((msg) => (
                <motion.div key={msg._id} variants={fadeUp}>
                  <MessageBubble
                    content={msg.content}
                    timestamp={msg.createdAt}
                    isOwn={msg.senderId === currentUser._id}
                  />
                </motion.div>
              ))}
            </motion.div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <MessageInput onSend={handleSend} />
      </div>
    </div>
  );
}
