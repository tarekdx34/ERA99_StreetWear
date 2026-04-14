const SESSION_COOKIE_NAME = "qutb_session_id";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 30; // 30 days

function generateRandomHex(bytes: number): string {
  const array = new Uint8Array(bytes);
  crypto.getRandomValues(array);
  return Array.from(array, (b) => b.toString(16).padStart(2, "0")).join("");
}

export function generateSessionId(): string {
  return generateRandomHex(32);
}

export function getSessionCookieName(): string {
  return SESSION_COOKIE_NAME;
}

export function getSessionCookieMaxAge(): number {
  return COOKIE_MAX_AGE;
}
