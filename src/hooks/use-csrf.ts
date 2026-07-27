import { useState, useEffect, useRef } from "react";
import { generateCSRFToken, CSRF_COOKIE_NAME } from "@/lib/csrf";

export function useCSRF() {
  const [csrfToken, setCSRFToken] = useState<string | null>(() => {
    const cookies = document.cookie.split(";");
    for (const cookie of cookies) {
      const [name, value] = cookie.trim().split("=");
      if (name === CSRF_COOKIE_NAME) {
        return decodeURIComponent(value);
      }
    }
    return null;
  });
  const generatedRef = useRef(false);

  useEffect(() => {
    if (csrfToken || generatedRef.current) return;
    generatedRef.current = true;
    const id = requestAnimationFrame(() => {
      const newToken = generateCSRFToken();
      setCSRFToken(newToken);
      const isProduction = process.env.NODE_ENV === "production";
      const cookieValue = `${CSRF_COOKIE_NAME}=${encodeURIComponent(newToken)}; path=/; SameSite=Lax${isProduction ? "; Secure" : ""}`;
      document.cookie = cookieValue;
    });
    return () => cancelAnimationFrame(id);
  }, [csrfToken]);

  return csrfToken;
}

export function getCSRFHeaders(token: string | null): Record<string, string> {
  if (!token) return {};
  return {
    "x-csrf-token": token,
  };
}
