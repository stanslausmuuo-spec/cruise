"use client";

import { useEffect } from "react";
import { useAuthToken } from "@convex-dev/auth/react";

export function AuthTokenCookie() {
  const token = useAuthToken();

  useEffect(() => {
    if (token) {
      document.cookie = `__convexAuthToken=${token}; path=/; max-age=${60 * 60 * 24 * 30}; SameSite=Lax${process.env.NODE_ENV === "production" ? "; Secure" : ""}`;
    } else {
      document.cookie = "__convexAuthToken=; path=/; max-age=0";
    }
  }, [token]);

  return null;
}