"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mail, Lock, User, Phone, ArrowRight, ChevronLeft, Car, Search } from "lucide-react";

const steps = ["Account", "Profile", "Role"];

export default function RegisterPage() {
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [roles, setRoles] = useState<string[]>([]);

  const toggleRole = (role: string) => {
    setRoles((prev) =>
      prev.includes(role) ? prev.filter((r) => r !== role) : [...prev, role]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (step < 2) {
      setStep((s) => s + 1);
    } else {
      setLoading(true);
      setTimeout(() => setLoading(false), 1500);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 pt-20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="glass rounded-2xl p-8 border border-glass-border-light dark:border-glass-border-dark">
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              {step > 0 ? (
                <button
                  onClick={() => setStep((s) => s - 1)}
                  className="p-1 rounded-full hover:bg-black/5 dark:hover:bg-white/10 transition-colors"
                >
                  <ChevronLeft className="h-5 w-5 text-charcoal/60 dark:text-cream/60" />
                </button>
              ) : (
                <div />
              )}
              <div className="flex gap-1.5">
                {steps.map((_, i) => (
                  <div
                    key={i}
                    className={`h-1.5 w-8 rounded-full transition-colors ${
                      i <= step ? "bg-brand-gold-400" : "bg-charcoal/10 dark:bg-white/10"
                    }`}
                  />
                ))}
              </div>
            </div>

            <h1 className="font-heading text-3xl font-bold text-charcoal dark:text-cream mb-2">
              {step === 0 ? "Create Account" : step === 1 ? "Your Profile" : "Your Role"}
            </h1>
            <p className="text-sm text-charcoal/60 dark:text-cream/60">
              {step === 0
                ? "Start your journey with Cruise"
                : step === 1
                  ? "Tell us a bit about yourself"
                  : "How will you use Cruise?"}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <AnimatePresence mode="wait">
              {step === 0 && (
                <motion.div
                  key="step-0"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-4"
                >
                  <Input
                    id="email"
                    label="Email"
                    type="email"
                    placeholder="you@example.com"
                    icon={<Mail className="h-4 w-4" />}
                  />
                  <Input
                    id="password"
                    label="Password"
                    type="password"
                    placeholder="Create a password"
                    icon={<Lock className="h-4 w-4" />}
                  />
                  <Input
                    id="confirmPassword"
                    label="Confirm Password"
                    type="password"
                    placeholder="Confirm your password"
                    icon={<Lock className="h-4 w-4" />}
                  />
                </motion.div>
              )}

              {step === 1 && (
                <motion.div
                  key="step-1"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-4"
                >
                  <Input
                    id="name"
                    label="Full Name"
                    placeholder="John Doe"
                    icon={<User className="h-4 w-4" />}
                  />
                  <Input
                    id="phone"
                    label="Phone Number"
                    type="tel"
                    placeholder="+254 712 345 678"
                    icon={<Phone className="h-4 w-4" />}
                  />
                </motion.div>
              )}

              {step === 2 && (
                <motion.div
                  key="step-2"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  className="space-y-4"
                >
                  <p className="text-xs text-charcoal/60 dark:text-cream/60 mb-2">
                    Select all that apply
                  </p>
                  <button
                    type="button"
                    onClick={() => toggleRole("renter")}
                    className={`w-full flex items-center gap-4 p-4 rounded-premium border transition-all ${
                      roles.includes("renter")
                        ? "border-brand-gold-400 bg-brand-gold-400/5"
                        : "border-charcoal/10 dark:border-white/10 hover:border-brand-gold-400/30"
                    }`}
                  >
                    <div className={`p-2 rounded-full ${
                      roles.includes("renter") ? "bg-brand-gold-400 text-white" : "bg-charcoal/5 dark:bg-white/5"
                    }`}>
                      <Search className="h-5 w-5" />
                    </div>
                    <div className="text-left">
                      <p className="font-medium text-sm text-charcoal dark:text-cream">I want to rent cars</p>
                      <p className="text-xs text-charcoal/50 dark:text-cream/50">Browse and book vehicles</p>
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => toggleRole("host")}
                    className={`w-full flex items-center gap-4 p-4 rounded-premium border transition-all ${
                      roles.includes("host")
                        ? "border-brand-gold-400 bg-brand-gold-400/5"
                        : "border-charcoal/10 dark:border-white/10 hover:border-brand-gold-400/30"
                    }`}
                  >
                    <div className={`p-2 rounded-full ${
                      roles.includes("host") ? "bg-brand-gold-400 text-white" : "bg-charcoal/5 dark:bg-white/5"
                    }`}>
                      <Car className="h-5 w-5" />
                    </div>
                    <div className="text-left">
                      <p className="font-medium text-sm text-charcoal dark:text-cream">I want to list my car</p>
                      <p className="text-xs text-charcoal/50 dark:text-cream/50">Earn from your vehicle</p>
                    </div>
                  </button>
                </motion.div>
              )}
            </AnimatePresence>

            <Button
              type="submit"
              loading={loading}
              className="w-full mt-4"
              size="lg"
              disabled={step === 2 && roles.length === 0}
            >
              {step === 2 ? "Create Account" : "Continue"}
            </Button>
          </form>

          {step === 0 && (
            <div className="mt-6 text-center text-sm text-charcoal/60 dark:text-cream/60">
              Already have an account?{" "}
              <Link href="/auth/login" className="text-brand-gold-400 font-medium hover:underline">
                Sign in
              </Link>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
