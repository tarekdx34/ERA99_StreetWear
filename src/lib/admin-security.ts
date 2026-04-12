import bcrypt from "bcryptjs";
import { generateSecret, generateURI, verify } from "otplib";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";

const FAILED_WINDOW_MINUTES = 15;
const LOCKOUT_MINUTES = 30;
const MAX_FAILED_ATTEMPTS = 5;

const TOTP_SECRET_KEY = "admin_totp_secret_enc";
const TOTP_PENDING_SECRET_KEY = "admin_totp_secret_pending_enc";
const TOTP_ROTATE_PENDING_SECRET_KEY = "admin_totp_secret_rotate_pending_enc";
const SESSION_VERSION_KEY = "admin_session_version";
const ADMIN_PASSWORD_HASH_KEY = "admin_password_hash_override";

type ChallengePayload = {
  username: string;
  ip: string;
  exp: number;
  setupMode: boolean;
  nonce: string;
};

function base64UrlEncode(input: string | Buffer) {
  return Buffer.from(input)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

function base64UrlToBuffer(input: string) {
  const normalized = input.replace(/-/g, "+").replace(/_/g, "/");
  const padLen = (4 - (normalized.length % 4)) % 4;
  const padded = normalized + "=".repeat(padLen);
  return Buffer.from(padded, "base64");
}

function getHmacSecret() {
  const secret = process.env.NEXTAUTH_SECRET;
  if (!secret) {
    throw new Error("NEXTAUTH_SECRET is required for admin auth");
  }
  return secret;
}

function getEncryptionKey() {
  return crypto.createHash("sha256").update(getHmacSecret()).digest();
}

function encrypt(value: string) {
  const iv = crypto.randomBytes(12);
  const key = getEncryptionKey();
  const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);
  const encrypted = Buffer.concat([cipher.update(value, "utf8"), cipher.final()]);
  const tag = cipher.getAuthTag();
  return [base64UrlEncode(iv), base64UrlEncode(tag), base64UrlEncode(encrypted)].join(".");
}

function decrypt(payload: string) {
  const [ivPart, tagPart, dataPart] = payload.split(".");
  if (!ivPart || !tagPart || !dataPart) return null;

  const iv = base64UrlToBuffer(ivPart);
  const tag = base64UrlToBuffer(tagPart);
  const encrypted = base64UrlToBuffer(dataPart);

  const decipher = crypto.createDecipheriv("aes-256-gcm", getEncryptionKey(), iv);
  decipher.setAuthTag(tag);

  try {
    const decrypted = Buffer.concat([decipher.update(encrypted), decipher.final()]);
    return decrypted.toString("utf8");
  } catch {
    return null;
  }
}

export function getClientIp(headers: Headers) {
  const xff = headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0].trim();
  const realIp = headers.get("x-real-ip");
  if (realIp) return realIp.trim();
  return "unknown";
}

export async function recordLoginAttempt(input: {
  ip: string;
  username?: string;
  success: boolean;
}) {
  await prisma.loginAttempt.create({
    data: {
      ip: input.ip,
      username: input.username || null,
      success: input.success,
    },
  });
}

export async function getLockout(ip: string) {
  const now = new Date();
  const failedWindowStart = new Date(
    now.getTime() - FAILED_WINDOW_MINUTES * 60 * 1000,
  );

  const failedCount = await prisma.loginAttempt.count({
    where: {
      ip,
      success: false,
      createdAt: { gte: failedWindowStart },
    },
  });

  if (failedCount < MAX_FAILED_ATTEMPTS) {
    return { locked: false, retryAfterSeconds: 0 };
  }

  const latestFailure = await prisma.loginAttempt.findFirst({
    where: {
      ip,
      success: false,
      createdAt: { gte: failedWindowStart },
    },
    orderBy: { createdAt: "desc" },
  });

  if (!latestFailure) {
    return { locked: false, retryAfterSeconds: 0 };
  }

  const lockedUntil = new Date(
    latestFailure.createdAt.getTime() + LOCKOUT_MINUTES * 60 * 1000,
  );

  if (lockedUntil <= now) {
    return { locked: false, retryAfterSeconds: 0 };
  }

  const retryAfterSeconds = Math.ceil((lockedUntil.getTime() - now.getTime()) / 1000);
  return { locked: true, retryAfterSeconds };
}

export async function validatePrimaryCredentials(input: {
  username: string;
  password: string;
  ip: string;
}) {
  const lock = await getLockout(input.ip);
  if (lock.locked) {
    return {
      ok: false as const,
      status: 429,
      message: `Too many failed attempts. Try again in ${Math.ceil(lock.retryAfterSeconds / 60)} minutes.`,
      retryAfterSeconds: lock.retryAfterSeconds,
    };
  }

  const expectedUsername = process.env.ADMIN_USERNAME || "qutb_admin";
  const storedHash = await getSetting(ADMIN_PASSWORD_HASH_KEY);
  const hashFromB64 = process.env.ADMIN_PASSWORD_HASH_B64?.trim()
    ? Buffer.from(process.env.ADMIN_PASSWORD_HASH_B64, "base64").toString("utf8")
    : "";
  const hash = storedHash?.value || hashFromB64 || process.env.ADMIN_PASSWORD_HASH;

  if (!hash) {
    return {
      ok: false as const,
      status: 500,
      message: "Server auth is not configured.",
      retryAfterSeconds: 0,
    };
  }

  const usernameMatch = input.username === expectedUsername;
  const passwordMatch = usernameMatch
    ? await bcrypt.compare(input.password, hash)
    : false;

  if (!usernameMatch || !passwordMatch) {
    await recordLoginAttempt({
      ip: input.ip,
      username: input.username,
      success: false,
    });
    return {
      ok: false as const,
      status: 401,
      message: "Invalid username or password.",
      retryAfterSeconds: 0,
    };
  }

  await recordLoginAttempt({
    ip: input.ip,
    username: input.username,
    success: true,
  });

  return {
    ok: true as const,
    status: 200,
    message: "Credentials verified.",
    retryAfterSeconds: 0,
  };
}

function signChallenge(payload: ChallengePayload) {
  const raw = JSON.stringify(payload);
  const encoded = base64UrlEncode(raw);
  const signature = crypto
    .createHmac("sha256", getHmacSecret())
    .update(encoded)
    .digest("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
  return `${encoded}.${signature}`;
}

export function createChallengeToken(input: {
  username: string;
  ip: string;
  setupMode: boolean;
}) {
  return signChallenge({
    username: input.username,
    ip: input.ip,
    setupMode: input.setupMode,
    nonce: crypto.randomUUID(),
    exp: Date.now() + 10 * 60 * 1000,
  });
}

export function verifyChallengeToken(token: string, ip: string) {
  const [encoded, signature] = token.split(".");
  if (!encoded || !signature) return null;

  const expected = crypto
    .createHmac("sha256", getHmacSecret())
    .update(encoded)
    .digest("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");

  const sigA = Buffer.from(signature);
  const sigB = Buffer.from(expected);
  if (sigA.length !== sigB.length || !crypto.timingSafeEqual(sigA, sigB)) {
    return null;
  }

  try {
    const payload = JSON.parse(base64UrlToBuffer(encoded).toString("utf8")) as ChallengePayload;
    if (payload.exp < Date.now()) return null;
    if (payload.ip !== ip) return null;
    return payload;
  } catch {
    return null;
  }
}

async function getSetting(key: string) {
  return prisma.setting.findUnique({ where: { key } });
}

async function upsertSetting(key: string, value: string) {
  await prisma.setting.upsert({
    where: { key },
    create: { key, value },
    update: { value },
  });
}

async function deleteSetting(key: string) {
  await prisma.setting.deleteMany({ where: { key } });
}

export async function getTotpSecret() {
  const envSecret = process.env.ADMIN_TOTP_SECRET?.trim();
  if (envSecret) return envSecret;

  const setting = await getSetting(TOTP_SECRET_KEY);
  if (!setting) return null;
  return decrypt(setting.value);
}

export async function getPendingTotpSecret() {
  const setting = await getSetting(TOTP_PENDING_SECRET_KEY);
  if (!setting) return null;
  return decrypt(setting.value);
}

export async function generatePendingTotpSecret() {
  const existingPending = await getPendingTotpSecret();
  if (existingPending) return existingPending;

  const secret = await generateSecret();
  await upsertSetting(TOTP_PENDING_SECRET_KEY, encrypt(secret));
  return secret;
}

export async function confirmTotpSecret() {
  const pending = await getPendingTotpSecret();
  if (!pending) return null;

  await upsertSetting(TOTP_SECRET_KEY, encrypt(pending));
  await deleteSetting(TOTP_PENDING_SECRET_KEY);
  return pending;
}

export function verifyTotpCode(code: string, secret: string) {
  const normalized = code.replace(/\D/g, "").slice(0, 6);
  if (normalized.length !== 6) return false;
  return verify({
    token: normalized,
    secret,
    strategy: "totp",
    period: 30,
    epochTolerance: 1,
    digits: 6,
  });
}

export function buildOtpAuthUri(secret: string) {
  const username = process.env.ADMIN_USERNAME || "qutb_admin";
  return generateURI({
    strategy: "totp",
    label: username,
    issuer: "QUTB Admin",
    secret,
    digits: 6,
    period: 30,
  });
}

export async function getSessionVersion() {
  const setting = await getSetting(SESSION_VERSION_KEY);
  if (!setting) return "0";
  return setting.value;
}

export async function rotateSessionVersion() {
  const current = await getSessionVersion();
  const next = String(Number(current || "0") + 1);
  await upsertSetting(SESSION_VERSION_KEY, next);
  return next;
}

export async function changeAdminPassword(currentPassword: string, newPassword: string) {
  const hashFromB64 = process.env.ADMIN_PASSWORD_HASH_B64?.trim()
    ? Buffer.from(process.env.ADMIN_PASSWORD_HASH_B64, "base64").toString("utf8")
    : "";
  const storedHash = await getSetting(ADMIN_PASSWORD_HASH_KEY);
  const currentHash = storedHash?.value || hashFromB64 || process.env.ADMIN_PASSWORD_HASH || "";

  if (!currentHash) {
    return { ok: false as const, message: "Server auth is not configured." };
  }

  const currentValid = await bcrypt.compare(currentPassword, currentHash);
  if (!currentValid) {
    return { ok: false as const, message: "Current password is incorrect." };
  }

  const nextHash = await bcrypt.hash(newPassword, 12);
  await upsertSetting(ADMIN_PASSWORD_HASH_KEY, nextHash);
  await rotateSessionVersion();
  return { ok: true as const };
}

export async function beginTotpRotation() {
  const current = await getTotpSecret();
  if (!current) {
    return { ok: false as const, message: "2FA is not configured yet." };
  }

  const secret = await generateSecret();
  await upsertSetting(TOTP_ROTATE_PENDING_SECRET_KEY, encrypt(secret));
  return {
    ok: true as const,
    secret,
    uri: buildOtpAuthUri(secret),
  };
}

export async function confirmTotpRotation(code: string) {
  const current = await getTotpSecret();
  if (!current) {
    return { ok: false as const, message: "2FA is not configured yet." };
  }

  const validCurrent = verifyTotpCode(code, current);
  if (!validCurrent) {
    return { ok: false as const, message: "Current 2FA code is invalid." };
  }

  const pending = await getSetting(TOTP_ROTATE_PENDING_SECRET_KEY);
  if (!pending?.value) {
    return { ok: false as const, message: "No pending 2FA rotation request." };
  }

  const nextSecret = decrypt(pending.value);
  if (!nextSecret) {
    return { ok: false as const, message: "Pending 2FA secret is invalid." };
  }

  await upsertSetting(TOTP_SECRET_KEY, encrypt(nextSecret));
  await deleteSetting(TOTP_ROTATE_PENDING_SECRET_KEY);
  await rotateSessionVersion();
  return { ok: true as const };
}

export async function getRecentLoginAttempts(limit = 20) {
  const rows = await prisma.loginAttempt.findMany({
    orderBy: { createdAt: "desc" },
    take: limit,
    select: {
      id: true,
      ip: true,
      username: true,
      success: true,
      createdAt: true,
    },
  });

  return rows;
}

export async function getActiveSessionsSnapshot() {
  const since = new Date(Date.now() - 8 * 60 * 60 * 1000);
  const rows = await prisma.loginAttempt.findMany({
    where: {
      success: true,
      createdAt: { gte: since },
    },
    orderBy: { createdAt: "desc" },
    select: {
      ip: true,
      username: true,
      createdAt: true,
    },
  });

  const byIp = new Map<string, { ip: string; username: string | null; lastSeen: Date }>();
  for (const row of rows) {
    if (!byIp.has(row.ip)) {
      byIp.set(row.ip, {
        ip: row.ip,
        username: row.username,
        lastSeen: row.createdAt,
      });
    }
  }

  return Array.from(byIp.values());
}
