import { useState, useEffect, useRef } from "react";
import { generateCSRFToken, hashCSRFToken, CSRF_COOKIE_NAME } from "@/lib/csrf";

export function useCSRF() {
  const [csrfToken, setCSRFToken] = useState<string | null>(null);
  const generatedRef = useRef(false);

  useEffect(() => {
    if (generatedRef.current) return;
    generatedRef.current = true;
    const id = requestAnimationFrame(async () => {
      const newToken = generateCSRFToken();
      const tokenHash = await hashCSRFToken(newToken);
      setCSRFToken(newToken);
      const isProduction = process.env.NODE_ENV === "production";
      const cookieValue = `${CSRF_COOKIE_NAME}=${encodeURIComponent(tokenHash)}; path=/; SameSite=Lax${isProduction ? "; Secure" : ""}`;
      document.cookie = cookieValue;
    });
    return () => cancelAnimationFrame(id);
  }, []);

  return csrfToken;
}

export function getCSRFHeaders(token: string | null): Record<string, string> {
  if (!token) return {};
  return {
    "x-csrf-token": token,
  };
}
