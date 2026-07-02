"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useConvex } from "convex/react";
import { useMutation } from "convex/react";
import { api } from "@convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import { ROUTES } from "@/lib/constants";
import { loginSchema } from "@/lib/validators";
import { Mail, Lock, ArrowRight } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const convex = useConvex();
  const store = useMutation(api.auth.store);
  const { toast } = useToast();

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [form, setForm] = useState({ email: "", password: "" });

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
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_CONVEX_URL}/api/auth/signin`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email: form.email,
            password: form.password,
          }),
        }
      );

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data?.message ?? "Invalid email or password");
      }

      const data = await res.json();
      const token = data.token;
      if (!token) throw new Error("No token returned from server");

      convex.setAuth(() => token, () => {});
      await store();
      toast("success", "Welcome back!", "You have been signed in successfully.");
      router.push("/");
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Invalid email or password";
      toast("error", "Sign in failed", message);
    } finally {
      setLoading(false);
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
          <div className="text-center mb-8">
            <h1 className="font-heading text-3xl font-bold text-charcoal dark:text-cream mb-2">
              Welcome Back
            </h1>
            <p className="text-sm text-charcoal/60 dark:text-cream/60">
              Sign in to continue to Cruise
            </p>
          </div>

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
            />

            <div className="flex items-center justify-between text-xs">
              <label className="flex items-center gap-2 text-charcoal/60 dark:text-cream/60">
                <input type="checkbox" className="rounded border-charcoal/20" />
                Remember me
              </label>
              <Link
                href="/auth/forgot-password"
                className="text-brand-gold-400 hover:underline"
              >
                Forgot password?
              </Link>
            </div>

            <Button
              type="submit"
              loading={loading}
              className="w-full"
              size="lg"
              icon={<ArrowRight className="h-4 w-4" />}
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
