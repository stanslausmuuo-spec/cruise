"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuthActions } from "@convex-dev/auth/react";
import { useMutation, useQuery } from "convex/react";
import { api } from "convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import { ROUTES } from "@/lib/constants";
import { registerSchema } from "@/lib/validators";
import {
  Mail,
  Lock,
  User,
  Phone,
  ChevronLeft,
  Car,
  Search,
  AlertCircle,
} from "lucide-react";

const steps = ["Account", "Profile", "Role"];

interface FormData {
  email: string;
  password: string;
  confirmPassword: string;
  name: string;
  phone: string;
  roles: string[];
}

const initialForm: FormData = {
  email: "",
  password: "",
  confirmPassword: "",
  name: "",
  phone: "",
  roles: [],
};

export default function RegisterPage() {
  const router = useRouter();
  const { signIn } = useAuthActions();
  const updateProfile = useMutation(api.users.updateProfile);
  const registerUser = useMutation(api.auth.registerUser);
  const currentUser = useQuery(api.auth.getMe);
  const { toast } = useToast();

  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [rateLimited, setRateLimited] = useState(false);
  const [retryAfter, setRetryAfter] = useState(0);
  const [form, setForm] = useState<FormData>(initialForm);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const updateField = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const toggleRole = (role: string) => {
    setForm((prev) => ({
      ...prev,
      roles: prev.roles.includes(role)
        ? prev.roles.filter((r) => r !== role)
        : [...prev.roles, role],
    }));
    if (errors.roles) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next.roles;
        return next;
      });
    }
  };

  const validateStep = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (step === 0) {
      if (!form.email) newErrors.email = "Email is required";
      else if (!/\S+@\S+\.\S+/.test(form.email))
        newErrors.email = "Invalid email address";
      if (!form.password) newErrors.password = "Password is required";
      else if (form.password.length < 8)
        newErrors.password = "Password must be at least 8 characters";
      if (form.password !== form.confirmPassword)
        newErrors.confirmPassword = "Passwords do not match";
    }

    if (step === 1) {
      if (!form.name || form.name.length < 2)
        newErrors.name = "Name must be at least 2 characters";
      if (!form.phone || form.phone.length < 10)
        newErrors.phone = "Phone number must be at least 10 digits";
    }

    if (step === 2) {
      if (form.roles.length === 0)
        newErrors.roles = "Select at least one role";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep()) {
      setStep((s) => s + 1);
    }
  };

  const handleBack = () => {
    setStep((s) => s - 1);
    setErrors({});
  };

  const checkRateLimit = async (email: string): Promise<boolean> => {
    try {
      const res = await fetch("/api/auth/rate-limit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, action: "register" }),
      });
      const data = await res.json();
      if (!data.allowed) {
        setRateLimited(true);
        setRetryAfter(data.resetTime);
        return false;
      }
      return true;
    } catch {
      return true; // Fail open
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setRateLimited(false);

    if (step < 2) {
      handleNext();
      return;
    }

    const result = registerSchema.safeParse(form);
    if (!result.success) {
      const fieldErrors: Record<string, string> = {};
      result.error.errors.forEach((err) => {
        const key = err.path[0] as string;
        if (!fieldErrors[key]) fieldErrors[key] = err.message;
      });
      setErrors(fieldErrors);
      return;
    }

    // Check rate limit
    const allowed = await checkRateLimit(form.email);
    if (!allowed) return;

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("email", form.email);
      formData.append("password", form.password);
      formData.append("flow", "signUp");

      await signIn("password", formData);

      // Persist name, phone, and roles to the user profile
      await registerUser({
        name: form.name,
        phone: form.phone,
        roles: form.roles as ("renter" | "host")[],
      });

      toast(
        "success",
        "Account created!",
        "Welcome to Cruise. You are now signed in."
      );
      router.push("/");
    } catch (err: unknown) {
      const message =
        err instanceof Error ? err.message : "Something went wrong";
      toast("error", "Registration failed", message);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (ms: number) => {
    const mins = Math.ceil((ms - Date.now()) / 60000);
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
        <div className="glass rounded-2xl p-8 border border-glass-border-light dark:border-glass-border-dark">
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              {step > 0 ? (
                <button
                  type="button"
                  onClick={handleBack}
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
                      i <= step
                        ? "bg-brand-gold-400"
                        : "bg-charcoal/10 dark:bg-white/10"
                    }`}
                  />
                ))}
              </div>
            </div>

            <h1 className="font-heading text-3xl font-bold text-charcoal dark:text-cream mb-2">
              {step === 0
                ? "Create Account"
                : step === 1
                  ? "Your Profile"
                  : "Your Role"}
            </h1>
            <p className="text-sm text-charcoal/60 dark:text-cream/60">
              {step === 0
                ? "Start your journey with Cruise"
                : step === 1
                  ? "Tell us a bit about yourself"
                  : "How will you use Cruise?"}
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
                    value={form.email}
                    onChange={(e) => updateField("email", e.target.value)}
                    error={errors.email}
                  />
                  <Input
                    id="password"
                    label="Password"
                    type="password"
                    placeholder="Create a password"
                    icon={<Lock className="h-4 w-4" />}
                    value={form.password}
                    onChange={(e) => updateField("password", e.target.value)}
                    error={errors.password}
                  />
                  <Input
                    id="confirmPassword"
                    label="Confirm Password"
                    type="password"
                    placeholder="Confirm your password"
                    icon={<Lock className="h-4 w-4" />}
                    value={form.confirmPassword}
                    onChange={(e) =>
                      updateField("confirmPassword", e.target.value)
                    }
                    error={errors.confirmPassword}
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
                    value={form.name}
                    onChange={(e) => updateField("name", e.target.value)}
                    error={errors.name}
                  />
                  <Input
                    id="phone"
                    label="Phone Number"
                    type="tel"
                    placeholder="+254 712 345 678"
                    icon={<Phone className="h-4 w-4" />}
                    value={form.phone}
                    onChange={(e) => updateField("phone", e.target.value)}
                    error={errors.phone}
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
                  {errors.roles && (
                    <p className="text-xs text-red-500">{errors.roles}</p>
                  )}
                  <button
                    type="button"
                    onClick={() => toggleRole("renter")}
                    className={`w-full flex items-center gap-4 p-4 rounded-premium border transition-all ${
                      form.roles.includes("renter")
                        ? "border-brand-gold-400 bg-brand-gold-400/5"
                        : "border-charcoal/10 dark:border-white/10 hover:border-brand-gold-400/30"
                    }`}
                  >
                    <div
                      className={`p-2 rounded-full ${
                        form.roles.includes("renter")
                          ? "bg-brand-gold-400 text-white"
                          : "bg-charcoal/5 dark:bg-white/5"
                      }`}
                    >
                      <Search className="h-5 w-5" />
                    </div>
                    <div className="text-left">
                      <p className="font-medium text-sm text-charcoal dark:text-cream">
                        I want to rent cars
                      </p>
                      <p className="text-xs text-charcoal/50 dark:text-cream/50">
                        Browse and book vehicles
                      </p>
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => toggleRole("host")}
                    className={`w-full flex items-center gap-4 p-4 rounded-premium border transition-all ${
                      form.roles.includes("host")
                        ? "border-brand-gold-400 bg-brand-gold-400/5"
                        : "border-charcoal/10 dark:border-white/10 hover:border-brand-gold-400/30"
                    }`}
                  >
                    <div
                      className={`p-2 rounded-full ${
                        form.roles.includes("host")
                          ? "bg-brand-gold-400 text-white"
                          : "bg-charcoal/5 dark:bg-white/5"
                      }`}
                    >
                      <Car className="h-5 w-5" />
                    </div>
                    <div className="text-left">
                      <p className="font-medium text-sm text-charcoal dark:text-cream">
                        I want to list my car
                      </p>
                      <p className="text-xs text-charcoal/50 dark:text-cream/50">
                        Earn from your vehicle
                      </p>
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
              disabled={step === 2 && form.roles.length === 0}
            >
              {step === 2 ? "Create Account" : "Continue"}
            </Button>
          </form>

          {step === 0 && (
            <div className="mt-6 text-center text-sm text-charcoal/60 dark:text-cream/60">
              Already have an account?{" "}
              <Link
                href={ROUTES.LOGIN}
                className="text-brand-gold-400 font-medium hover:underline"
              >
                Sign in
              </Link>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}