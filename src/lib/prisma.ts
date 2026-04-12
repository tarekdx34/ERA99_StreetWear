import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export function isDatabaseConfigured() {
  const url = process.env.DATABASE_URL?.trim() ?? "";
  const hasPlaceholderCreds =
    /:\/\/USER:PASSWORD@/i.test(url) ||
    /:\/\/postgres:PASSWORD@/i.test(url);

  return Boolean(
    url.length > 0 && !hasPlaceholderCreds,
  );
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
