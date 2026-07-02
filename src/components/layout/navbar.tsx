"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";
import { ROUTES, APP_NAME } from "@/lib/constants";
import { Menu, X, Sun, Moon, Search, PlusCircle, User, LogOut } from "lucide-react";

const navLinks = [
  { href: ROUTES.HOME, label: "Home" },
  { href: ROUTES.VEHICLES, label: "Browse" },
  { href: ROUTES.VEHICLE_MAP, label: "Map" },
  { href: ROUTES.VEHICLE_NEW, label: "List Your Car" },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();
  const isLanding = pathname === "/";
  const { theme, setTheme } = useTheme();

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      <motion.header
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
          className={cn(
            "fixed top-0 left-0 right-0 z-40 transition-all duration-300",
            scrolled
              ? "glass border-b border-glass-border-light dark:border-glass-border-dark shadow-sm"
              : isLanding
                ? "bg-glass-light/60 dark:bg-glass-dark/60 backdrop-blur-sm"
                : "bg-transparent"
          )}
      >
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 md:h-20">
            <Link
              href={ROUTES.HOME}
              className="flex items-center gap-2 font-heading text-xl md:text-2xl font-bold"
            >
              <span className="text-gradient-gold">{APP_NAME}</span>
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
              {mounted && (
                <button
                  onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                  className="p-2 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
                  aria-label="Toggle theme"
                >
                  {theme === "dark" ? (
                    <Sun className="h-4 w-4 text-cream" />
                  ) : (
                    <Moon className="h-4 w-4 text-charcoal" />
                  )}
                </button>
              )}
              <Link
                href={ROUTES.LOGIN}
                className="text-sm font-medium text-charcoal/70 dark:text-cream/70 hover:text-charcoal dark:hover:text-cream transition-colors"
              >
                Sign In
              </Link>
              <Link
                href={ROUTES.REGISTER}
                className="inline-flex items-center gap-1.5 rounded-pill bg-gradient-to-r from-brand-gold-400 to-brand-gold-500 px-4 py-2 text-sm font-medium text-white hover:brightness-110 transition-all shadow-premium hover:shadow-gold-glow"
              >
                Get Started
              </Link>
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
            <div className="absolute right-0 top-0 bottom-0 w-72 glass p-6 pt-24">
              <div className="flex flex-col gap-4">
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
                <div className="pt-4 space-y-3">
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
                    className="block w-full text-center rounded-pill bg-gradient-to-r from-brand-gold-400 to-brand-gold-500 px-4 py-2.5 text-sm font-medium text-white"
                  >
                    Get Started
                  </Link>
                </div>
                {mounted && (
                  <button
                    onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                    className="flex items-center gap-2 text-sm text-charcoal/60 dark:text-cream/60 mt-2"
                  >
                    {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                    {theme === "dark" ? "Light Mode" : "Dark Mode"}
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
