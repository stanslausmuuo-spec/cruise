"use client";

import { type ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "convex/_generated/api";
import { cn } from "@/lib/utils";
import { Home, Car, MessageSquare, User, PlusCircle } from "lucide-react";

interface NavItem {
  href: string;
  label: string;
  icon: ReactNode;
  authRequired?: boolean;
}

const publicNavItems: NavItem[] = [
  { href: "/", label: "Home", icon: <Home className="h-5 w-5" /> },
  { href: "/vehicles", label: "Browse", icon: <Car className="h-5 w-5" /> },
];

const authNavItems: NavItem[] = [
  { href: "/vehicles/new", label: "List", icon: <PlusCircle className="h-5 w-5" />, authRequired: true },
  { href: "/messages", label: "Messages", icon: <MessageSquare className="h-5 w-5" />, authRequired: true },
  { href: "/dashboard", label: "Profile", icon: <User className="h-5 w-5" />, authRequired: true },
];

export function MobileNav() {
  const pathname = usePathname();
  const currentUser = useQuery(api.auth.getMe);
  const isLoggedIn = currentUser !== null && currentUser !== undefined;

  const navItems = [...publicNavItems, ...authNavItems];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white dark:bg-surface-dark-muted border-t border-charcoal/10 dark:border-white/10 safe-area-bottom">
      <div className="flex items-center justify-around h-16 px-2">
        {navItems
          .filter((item) => !item.authRequired || isLoggedIn)
          .map((item) => {
            const isActive =
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-colors",
                  isActive
                    ? "text-brand-gold-400"
                    : "text-charcoal/50 dark:text-cream/50 hover:text-charcoal/80 dark:hover:text-cream/80"
                )}
              >
                {item.icon}
                <span className="text-[10px] font-medium">{item.label}</span>
              </Link>
            );
          })}
      </div>
    </nav>
  );
}
