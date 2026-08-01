"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useTheme } from "next-themes";
import { useQuery } from "convex/react";
import { useAuthActions } from "@convex-dev/auth/react";
import { api } from "convex/_generated/api";
import { cn } from "@/lib/utils";
import { ROUTES, APP_NAME } from "@/lib/constants";
import { Avatar } from "@/components/ui/avatar";
import { Menu, X, Sun, Moon, LogOut, LayoutDashboard } from "lucide-react";

const navLinks = [
  { href: ROUTES.HOME, label: "Home" },
  { href: ROUTES.VEHICLES, label: "Browse" },
  { href: ROUTES.VEHICLE_MAP, label: "Map" },
  { href: ROUTES.VEHICLE_NEW, label: "List Your Car" },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { theme, setTheme } = useTheme();
  const { signOut } = useAuthActions();

  const currentUser = useQuery(api.auth.getMe);

  useEffect(() => {
    const id = requestAnimationFrame(() => setMounted(true));
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => {
      cancelAnimationFrame(id);
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const isLoggedIn = currentUser !== null && currentUser !== undefined;

  return (
    <>
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className={cn(
          "fixed top-0 left-0 right-0 z-40 transition-all duration-300 bg-white dark:bg-surface-dark-muted border-b border-charcoal/5 dark:border-white/5",
          scrolled && "shadow-sm"
        )}
      >
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 md:h-20">
            <Link
              href={ROUTES.HOME}
              className="flex items-center gap-2 font-heading text-xl md:text-2xl font-bold"
            >
              <span className="text-brand-gold-400">{APP_NAME}</span>
            </Link>

            <div className="hidden md:flex items-center gap-8">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="relative text-sm font-medium text-charcoal/70 dark:text-cream/70 hover:text-charcoal dark:hover:text-cream transition-colors group"
                >
                  {link.label}
                  <span className="absolute -bottom-0.5 left-0 w-0 h-0.5 bg-brand-gold-400 transition-all duration-300 group-hover:w-full" />
                </Link>
              ))}
            </div>

            <div className="hidden md:flex items-center gap-3">
                <button
                  onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                  className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
                  aria-label="Toggle theme"
                >
                  {mounted ? (
                    theme === "dark" ? (
                      <Sun className="h-4 w-4 text-cream" />
                    ) : (
                      <Moon className="h-4 w-4 text-charcoal" />
                    )
                  ) : (
                    <div className="h-4 w-4" />
                  )}
                </button>

              {isLoggedIn ? (
                <>
                  <Link
                    href={ROUTES.DASHBOARD}
                    className="flex items-center gap-2 text-sm font-medium text-charcoal/70 dark:text-cream/70 hover:text-charcoal dark:hover:text-cream transition-colors"
                  >
                    <LayoutDashboard className="h-4 w-4" />
                    Dashboard
                  </Link>
                  <Avatar name={currentUser!.name ?? "U"} src={currentUser!.avatarUrl} size="sm" />
                  <button
                    onClick={() => signOut()}
                    className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors text-charcoal/60 dark:text-cream/60 hover:text-red-500"
                    aria-label="Sign out"
                  >
                    <LogOut className="h-4 w-4" />
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href={ROUTES.LOGIN}
                    className="text-sm font-medium text-charcoal/70 dark:text-cream/70 hover:text-charcoal dark:hover:text-cream transition-colors"
                  >
                    Sign In
                  </Link>
                  <Link
                    href={ROUTES.REGISTER}
                    className="inline-flex items-center gap-1.5 rounded-pill bg-brand-gold-500 px-4 py-2 text-sm font-medium text-white hover:brightness-110 transition-all shadow-premium"
                  >
                    Get Started
                  </Link>
                </>
              )}
            </div>

            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
              aria-label="Toggle menu"
            >
              {mobileOpen ? (
                <X className="h-5 w-5 text-charcoal dark:text-cream" />
              ) : (
                <Menu className="h-5 w-5 text-charcoal dark:text-cream" />
              )}
            </button>
          </div>
        </nav>
      </motion.header>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, x: "100%" }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed inset-0 z-30 md:hidden"
          >
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
            <div className="absolute right-0 top-0 bottom-0 w-72 bg-white dark:bg-surface-dark-muted p-6 pt-24 border-l border-charcoal/5 dark:border-white/5">
              <div className="flex flex-col gap-4">
                {isLoggedIn && (
                  <div className="flex items-center gap-3 pb-4 border-b border-charcoal/5 dark:border-white/5">
                    <Avatar name={currentUser!.name ?? "U"} src={currentUser!.avatarUrl} size="md" />
                    <div>
                      <p className="font-medium text-sm text-charcoal dark:text-cream">{currentUser!.name}</p>
                      <p className="text-xs text-charcoal/50 dark:text-cream/50">{currentUser!.email}</p>
                    </div>
                  </div>
                )}

                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileOpen(false)}
                    className="text-lg font-medium text-charcoal dark:text-cream py-2 border-b border-charcoal/5 dark:border-white/5"
                  >
                    {link.label}
                  </Link>
                ))}

                {isLoggedIn && (
                  <Link
                    href={ROUTES.DASHBOARD}
                    onClick={() => setMobileOpen(false)}
                    className="text-lg font-medium text-charcoal dark:text-cream py-2 border-b border-charcoal/5 dark:border-white/5"
                  >
                    Dashboard
                  </Link>
                )}

                <div className="pt-4 space-y-3">
                  {isLoggedIn ? (
                    <button
                      onClick={() => { signOut(); setMobileOpen(false); }}
                      className="flex items-center justify-center gap-2 w-full rounded-pill border border-red-500/30 px-4 py-2.5 text-sm font-medium text-red-500 hover:bg-red-500/10 transition-colors"
                    >
                      <LogOut className="h-4 w-4" />
                      Sign Out
                    </button>
                  ) : (
                    <>
                      <Link
                        href={ROUTES.LOGIN}
                        onClick={() => setMobileOpen(false)}
                        className="block w-full text-center rounded-pill border border-charcoal/20 dark:border-white/20 px-4 py-2.5 text-sm font-medium text-charcoal dark:text-cream"
                      >
                        Sign In
                      </Link>
                      <Link
                        href={ROUTES.REGISTER}
                        onClick={() => setMobileOpen(false)}
                        className="block w-full text-center rounded-pill bg-brand-gold-500 px-4 py-2.5 text-sm font-medium text-white"
                      >
                        Get Started
                      </Link>
                    </>
                  )}
                </div>
                <button
                    onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                    className="flex items-center gap-2 text-sm text-charcoal/60 dark:text-cream/60 mt-2"
                  >
                    {mounted ? (
                      theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />
                    ) : (
                      <div className="h-4 w-4" />
                    )}
                    {mounted ? (theme === "dark" ? "Light Mode" : "Dark Mode") : ""}
                  </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
