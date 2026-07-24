const CSRF_TOKEN_LENGTH = 32;
const CSRF_COOKIE_NAME = "__Host-csrf-token";
const CSRF_HEADER_NAME = "x-csrf-token";

function hex(bytes: Uint8Array): string {
  return Array.from(bytes).map((b) => b.toString(16).padStart(2, "0")).join("");
}

function constantTimeEqual(a: Uint8Array, b: Uint8Array): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a[i] ^ b[i];
  return diff === 0;
}

export function generateCSRFToken(): string {
  const bytes = new Uint8Array(CSRF_TOKEN_LENGTH);
  crypto.getRandomValues(bytes);
  return hex(bytes);
}

export async function hashCSRFToken(token: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(token);
  const hash = await crypto.subtle.digest("SHA-256", data);
  return hex(new Uint8Array(hash));
}

export async function validateCSRFToken(token: string, hashedToken: string): Promise<boolean> {
  if (!token || !hashedToken) return false;
  const tokenHash = await hashCSRFToken(token);
  try {
    return constantTimeEqual(
      new TextEncoder().encode(tokenHash),
      new TextEncoder().encode(hashedToken)
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
