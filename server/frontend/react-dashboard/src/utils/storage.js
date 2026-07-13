export const ACCESS_TOKEN_KEY = "access_token";

function getSessionStorage() {
  try {
    return globalThis.sessionStorage;
  } catch {
    return null;
  }
}

export function getAccessToken() {
  return getSessionStorage()?.getItem(ACCESS_TOKEN_KEY) ?? null;
}

export function setAccessToken(token) {
  if (typeof token !== "string" || token.length === 0) return;
  getSessionStorage()?.setItem(ACCESS_TOKEN_KEY, token);
}

export function removeAccessToken() {
  getSessionStorage()?.removeItem(ACCESS_TOKEN_KEY);
}

export function hasAccessToken() {
  return Boolean(getAccessToken());
}
