"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Send } from "lucide-react";

const initialMessages = [
  { id: "1", sender: "them", content: "Hi! The car is ready for pickup at 10am tomorrow.", time: "10:30 AM" },
  { id: "2", sender: "me", content: "Perfect, I'll be there. The address is in the booking details?", time: "10:32 AM" },
  { id: "3", sender: "them", content: "Yes, exactly. I'll be waiting at the gate. Please bring your ID.", time: "10:33 AM" },
  { id: "4", sender: "me", content: "Got it. See you tomorrow!", time: "10:35 AM" },
];

export default function ConversationPage() {
  const [messages, setMessages] = useState(initialMessages);
  const [input, setInput] = useState("");

  const send = () => {
    if (!input.trim()) return;
    setMessages((prev) => [...prev, { id: Date.now().toString(), sender: "me", content: input, time: "Just now" }]);
    setInput("");
  };

  return (
    <div className="min-h-screen pt-20 pb-16 flex flex-col">
      <div className="max-w-2xl mx-auto w-full flex-1 flex flex-col px-4">
        <div className="flex items-center gap-3 mb-4 pb-4 border-b border-charcoal/5 dark:border-white/5">
          <Link href="/messages" className="p-1 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors">
            <ArrowLeft className="h-5 w-5 text-charcoal/60 dark:text-cream/60" />
          </Link>
          <Avatar name="James Mwangi" online />
          <div>
            <p className="font-medium text-sm text-charcoal dark:text-cream">James Mwangi</p>
            <p className="text-xs text-green-500">Online</p>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto space-y-3 mb-4">
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${msg.sender === "me" ? "justify-end" : "justify-start"}`}
            >
              <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 ${
                msg.sender === "me"
                  ? "bg-brand-gold-400 text-white rounded-br-md"
                  : "glass rounded-bl-md"
              }`}>
                <p className="text-sm">{msg.content}</p>
                <p className={`text-[10px] mt-0.5 ${
                  msg.sender === "me" ? "text-white/70" : "text-charcoal/40 dark:text-cream/40"
                }`}>{msg.time}</p>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="flex items-center gap-2 pb-4">
          <input
            type="text"
            placeholder="Type a message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && send()}
            className="flex-1 rounded-pill glass border border-glass-border-light dark:border-glass-border-dark px-4 py-2.5 text-sm text-charcoal dark:text-cream focus:outline-none focus:ring-2 focus:ring-brand-gold-400/50"
          />
          <Button size="sm" onClick={send} disabled={!input.trim()} icon={<Send className="h-4 w-4" />}>
            Send
          </Button>
        </div>
      </div>
    </div>
  );
}
