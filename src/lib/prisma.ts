import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const DB_RETRY_COOLDOWN_MS = Number(process.env.DB_RETRY_COOLDOWN_MS || 30_000);

let databaseUnavailableUntil = 0;

function isConnectivityError(error: unknown) {
  if (!error || typeof error !== "object") return false;
  const maybeError = error as {
    code?: unknown;
    name?: unknown;
    message?: unknown;
  };

  if (maybeError.code === "P1001" || maybeError.code === "P1002") return true;

  const name = String(maybeError.name || "");
  const message = String(maybeError.message || "").toLowerCase();

  return (
    name.includes("PrismaClientInitializationError") ||
    message.includes("can't reach database server") ||
    message.includes("connection")
  );
}

export function markDatabaseUnavailable(error?: unknown) {
  if (error && !isConnectivityError(error)) return;
  databaseUnavailableUntil = Date.now() + DB_RETRY_COOLDOWN_MS;
}

export function isDatabaseConfigured() {
  const url = process.env.DATABASE_URL?.trim() ?? "";
  const hasPlaceholderCreds =
    /:\/\/USER:PASSWORD@/i.test(url) || /:\/\/postgres:PASSWORD@/i.test(url);
  const isCoolingDown = Date.now() < databaseUnavailableUntil;

  return Boolean(url.length > 0 && !hasPlaceholderCreds && !isCoolingDown);
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.PRISMA_LOG_ERRORS === "true" ? ["error"] : [],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
