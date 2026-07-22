import { useState, useEffect } from "react";
import { generateCSRFToken, CSRF_COOKIE_NAME } from "@/lib/csrf";

export function useCSRF() {
  const [csrfToken, setCSRFToken] = useState<string | null>(null);

  useEffect(() => {
    // Check if we already have a CSRF token in cookies
    const cookies = document.cookie.split(";");
    let existingToken: string | null = null;

    for (const cookie of cookies) {
      const [name, value] = cookie.trim().split("=");
      if (name === CSRF_COOKIE_NAME) {
        existingToken = decodeURIComponent(value);
        break;
      }
    }

    if (existingToken) {
      setCSRFToken(existingToken);
    } else {
      // Generate a new CSRF token
      const newToken = generateCSRFToken();
      setCSRFToken(newToken);

      // Store in cookie with security flags
      const isProduction = process.env.NODE_ENV === "production";
      const cookieValue = `${CSRF_COOKIE_NAME}=${encodeURIComponent(newToken)}; path=/; SameSite=Lax${isProduction ? "; Secure" : ""}`;
      document.cookie = cookieValue;
    }
  }, []);

  return csrfToken;
}

export function getCSRFHeaders(token: string | null): Record<string, string> {
  if (!token) return {};
  return {
    "x-csrf-token": token,
  };
}
