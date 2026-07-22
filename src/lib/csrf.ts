import { randomBytes, createHash, timingSafeEqual } from "crypto";

const CSRF_TOKEN_LENGTH = 32;
const CSRF_COOKIE_NAME = "__Host-csrf-token";
const CSRF_HEADER_NAME = "x-csrf-token";

export function generateCSRFToken(): string {
  return randomBytes(CSRF_TOKEN_LENGTH).toString("hex");
}

export function hashCSRFToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export function validateCSRFToken(token: string, hashedToken: string): boolean {
  if (!token || !hashedToken) return false;
  const tokenHash = hashCSRFToken(token);
  try {
    return timingSafeEqual(
      Buffer.from(tokenHash, "hex"),
      Buffer.from(hashedToken, "hex")
    );
  } catch {
    return false;
  }
}

export function getCSRFFromCookie(cookieHeader: string | undefined): string | null {
  if (!cookieHeader) return null;
  const cookies = cookieHeader.split(";").map((c) => c.trim());
  for (const cookie of cookies) {
    const [name, ...parts] = cookie.split("=");
    if (name === CSRF_COOKIE_NAME) {
      return parts.join("=");
    }
  }
  return null;
}

export { CSRF_COOKIE_NAME, CSRF_HEADER_NAME };
