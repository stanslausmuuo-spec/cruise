const CONVEX_URL = process.env.NEXT_PUBLIC_CONVEX_URL || "";
const NAMESPACE = CONVEX_URL.replace(/[^a-zA-Z0-9]/g, "");
const JWT_KEY = `__convexAuthJWT_${NAMESPACE}`;
const REFRESH_KEY = `__convexAuthRefreshToken_${NAMESPACE}`;

export function setAuthTokens(token: string, refreshToken: string) {
  localStorage.setItem(JWT_KEY, token);
  localStorage.setItem(REFRESH_KEY, refreshToken);

  window.dispatchEvent(
    new StorageEvent("storage", {
      key: JWT_KEY,
      newValue: token,
      oldValue: null,
      storageArea: localStorage,
      url: window.location.href,
    })
  );
}

export function clearAuthTokens() {
  localStorage.removeItem(JWT_KEY);
  localStorage.removeItem(REFRESH_KEY);

  window.dispatchEvent(
    new StorageEvent("storage", {
      key: JWT_KEY,
      newValue: null,
      oldValue: null,
      storageArea: localStorage,
      url: window.location.href,
    })
  );
}
