"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Avatar } from "@/components/ui/avatar";

interface ChatHeaderProps {
  name: string;
  avatarUrl?: string;
  online?: boolean;
  backHref?: string;
}

function ChatHeader({ name, avatarUrl, online, backHref = "/messages" }: ChatHeaderProps) {
  return (
    <div className="flex items-center gap-3 py-4 border-b border-charcoal/5 dark:border-white/5">
      <Link
        href={backHref}
        className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
      >
        <ArrowLeft className="h-5 w-5 text-charcoal dark:text-cream" />
      </Link>
      <Avatar name={name} src={avatarUrl} size="sm" online={online} />
      <div>
        <p className="font-medium text-sm text-charcoal dark:text-cream">{name}</p>
        <p className="text-xs text-charcoal/50 dark:text-cream/50">
          {online ? "Online" : "Offline"}
        </p>
      </div>
    </div>
  );
}

export { ChatHeader };
