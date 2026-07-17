"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "convex/_generated/api";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";
import { Bell, CheckCheck } from "lucide-react";

function NotificationBell({ userId }: { userId: string }) {
  const [open, setOpen] = useState(false);
  const unreadCount = useQuery(
    api.notifications.getUnreadCount,
    userId ? { userId: userId as never } : "skip"
  );
  const notifications = useQuery(
    api.notifications.getNotificationsByUser,
    open && userId ? { userId: userId as never } : "skip"
  );
  const markAsRead = useMutation(api.notifications.markAsRead);
  const markAllAsRead = useMutation(api.notifications.markAllAsRead);

  const typeIcon = (type: string) => {
    switch (type) {
      case "booking": return "📅";
      case "message": return "💬";
      case "payment": return "💳";
      case "verification": return "✅";
      case "system": return "🔔";
      default: return "🔔";
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2 rounded-full hover:bg-charcoal/5 dark:hover:bg-white/5 transition-colors"
      >
        <Bell className="h-5 w-5 text-charcoal/60 dark:text-cream/60" />
        {unreadCount !== undefined && unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-brand-gold-400 text-white text-[10px] font-bold flex items-center justify-center">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-2 w-80 glass rounded-premium shadow-premium-hover z-50 overflow-hidden">
            <div className="p-3 border-b border-charcoal/5 dark:border-white/5 flex items-center justify-between">
              <h3 className="font-heading font-bold text-sm text-charcoal dark:text-cream">
                Notifications
              </h3>
              {unreadCount !== undefined && unreadCount > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  icon={<CheckCheck className="h-3 w-3" />}
                  onClick={() => markAllAsRead({ userId: userId as never })}
                >
                  Mark all read
                </Button>
              )}
            </div>
            <div className="max-h-80 overflow-y-auto">
              {notifications === undefined || notifications.length === 0 ? (
                <div className="p-8 text-center">
                  <p className="text-sm text-charcoal/40 dark:text-cream/40">
                    No notifications
                  </p>
                </div>
              ) : (
                notifications.map((n) => (
                  <div
                    key={n._id}
                    className={`p-3 border-b border-charcoal/5 dark:border-white/5 last:border-0 ${
                      !n.read ? "bg-brand-gold-400/5" : ""
                    }`}
                    onClick={async () => {
                      if (!n.read) {
                        await markAsRead({ notificationId: n._id });
                      }
                    }}
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-lg">{typeIcon(n.type)}</span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-charcoal dark:text-cream truncate">
                          {n.title}
                        </p>
                        <p className="text-xs text-charcoal/50 dark:text-cream/50 truncate">
                          {n.body}
                        </p>
                        <p className="text-[10px] text-charcoal/30 dark:text-cream/30 mt-1">
                          {formatDate(n.createdAt, "short")}
                        </p>
                      </div>
                      {!n.read && (
                        <div className="h-2 w-2 rounded-full bg-brand-gold-400 shrink-0 mt-1" />
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export { NotificationBell };
