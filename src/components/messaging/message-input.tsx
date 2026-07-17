"use client";

import { useState } from "react";
import { Send } from "lucide-react";
import { Button } from "@/components/ui/button";

interface MessageInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

function MessageInput({ onSend, disabled, placeholder = "Type a message..." }: MessageInputProps) {
  const [message, setMessage] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim()) {
      onSend(message.trim());
      setMessage("");
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex items-center gap-2 py-4 border-t border-charcoal/5 dark:border-white/5"
    >
      <input
        type="text"
        placeholder={placeholder}
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        disabled={disabled}
        className="flex-1 rounded-pill glass border border-glass-border-light dark:border-glass-border-dark px-4 py-2.5 text-sm text-charcoal dark:text-cream focus:outline-none focus:ring-2 focus:ring-brand-gold-400/50"
      />
      <Button
        type="submit"
        size="sm"
        disabled={!message.trim() || disabled}
        icon={<Send className="h-4 w-4" />}
      />
    </form>
  );
}

export { MessageInput };
