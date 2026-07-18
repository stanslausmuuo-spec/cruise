"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "convex/_generated/api";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/utils";
import { Bell, CheckCheck } from "lucide-react";

function NotificationBell() {
  const [open, setOpen] = useState(false);
  const unreadCount = useQuery(api.notifications.getUnreadCount);
  const notifications = useQuery(
    api.notifications.getNotifications,
    open ? {} : "skip"
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
          <div className="fixed top-12 right-4 z-50 w-80 max-w-[90vw] glass rounded-premium shadow-premium overflow-hidden">
            <div className="p-4 border-b border-charcoal/10 dark:border-white/10 flex items-center justify-between">
              <h3 className="font-heading font-bold text-charcoal dark:text-cream">Notifications</h3>
              {unreadCount && unreadCount > 0 && (
                <Button variant="ghost" size="sm" onClick={() => markAllAsRead()}>
                  <CheckCheck className="h-4 w-4 mr-1" />
                  Mark all read
                </Button>
              )}
            </div>
            <div className="max-h-[400px] overflow-y-auto">
              {notifications?.length === 0 ? (
                <div className="p-4 text-center text-sm text-charcoal/50 dark:text-cream/50">
                  No notifications
                </div>
              ) : (
                notifications?.map((n) => (
                  <div
                    key={n._id}
                    className={`p-4 border-b border-charcoal/5 dark:border-white/5 hover:bg-charcoal/5 dark:hover:bg-white/5 transition-colors ${n.read ? "" : "bg-brand-gold-400/5"}`}
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-lg mt-0.5">{typeIcon(n.type)}</span>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm text-charcoal dark:text-cream">{n.title}</p>
                        <p className="text-xs text-charcoal/60 dark:text-cream/60 mt-0.5 truncate">{n.body}</p>
                        <p className="text-xs text-charcoal/40 dark:text-cream/40 mt-1">{formatDate(n.createdAt, "relative")}</p>
                      </div>
                      {!n.read && (
                        <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => markAsRead({ notificationId: n._id })}>
                          <CheckCheck className="h-4 w-4" />
                        </Button>
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