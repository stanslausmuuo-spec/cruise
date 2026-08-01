"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import { ROUTES } from "@/lib/constants";
import { loginSchema } from "@/lib/validators";
import { setAuthTokens } from "@/lib/auth-client";
import { Mail, Lock, ArrowRight, AlertCircle } from "lucide-react";

export default function LoginPage() {
  const { toast } = useToast();

  const [loading, setLoading] = useState(false);
  const [rateLimited, setRateLimited] = useState(false);
  const [retryAfter, setRetryAfter] = useState(0);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [form, setForm] = useState({ email: "", password: "" });
  const [rememberMe, setRememberMe] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [e.target.id]: e.target.value }));
    if (errors[e.target.id]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[e.target.id];
        return next;
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    setRateLimited(false);

    const result = loginSchema.safeParse(form);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach((err) => {
        fieldErrors[err.path[0] as string] = err.message;
      });
      setErrors(fieldErrors);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/auth/signin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.email, password: form.password, flow: "signIn" }),
      });

      if (res.status === 429) {
        const data = await res.json();
        setRateLimited(true);
        setRetryAfter(60000);
        toast("error", "Too many attempts", data.error || "Please try again later.");
        return;
      }

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Invalid email or password");
      }

      const data = await res.json();
      if (data.tokens?.token) {
        localStorage.setItem("cruiselinx-remember-me", rememberMe ? "true" : "false");
        setAuthTokens(data.tokens.token, data.tokens.refreshToken || "dummy");
        toast("success", "Welcome back!", "You have been signed in successfully.");
        window.location.href = "/";
      }
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Invalid email or password";
      toast("error", "Sign in failed", message);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (ms: number) => {
    const mins = Math.ceil(ms / 60000);
    return `${mins} minute${mins !== 1 ? "s" : ""}`;
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 pt-20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="glass rounded-2xl p-8">
          <div className="text-center mb-8">
            <h1 className="font-heading text-3xl font-bold text-charcoal dark:text-cream mb-2">
              Welcome Back
            </h1>
            <p className="text-sm text-charcoal/60 dark:text-cream/60">
              Sign in to continue to CruiseLinx
            </p>
          </div>

          {rateLimited && (
            <div className="mb-6 p-4 glass rounded-xl border border-amber-500/30 bg-amber-50/20 dark:bg-amber-900/10">
              <div className="flex items-center gap-3">
                <AlertCircle className="h-5 w-5 text-amber-500 shrink-0" />
                <div>
                  <p className="font-medium text-charcoal dark:text-cream">
                    Too many attempts
                  </p>
                  <p className="text-sm text-charcoal/60 dark:text-cream/60">
                    Please wait {formatTime(retryAfter)} before trying again.
                  </p>
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <Input
              id="email"
              label="Email"
              type="email"
              placeholder="you@example.com"
              icon={<Mail className="h-4 w-4" />}
              value={form.email}
              onChange={handleChange}
              error={errors.email}
              disabled={rateLimited}
            />
            <Input
              id="password"
              label="Password"
              type="password"
              placeholder="Enter your password"
              icon={<Lock className="h-4 w-4" />}
              value={form.password}
              onChange={handleChange}
              error={errors.password}
              disabled={rateLimited}
            />

            <div className="flex items-center justify-between text-xs">
              <label className="flex items-center gap-2 text-charcoal/60 dark:text-cream/60">
                <input
                  type="checkbox"
                  className="rounded border-charcoal/20"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                Remember me
              </label>
            </div>

            <Button
              type="submit"
              loading={loading}
              className="w-full"
              size="lg"
              icon={<ArrowRight className="h-4 w-4" />}
              disabled={rateLimited}
            >
              Sign In
            </Button>
          </form>

          <div className="mt-6 text-center text-sm text-charcoal/60 dark:text-cream/60">
            Don&apos;t have an account?{" "}
            <Link
              href={ROUTES.REGISTER}
              className="text-brand-gold-400 font-medium hover:underline"
            >
              Create one
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
