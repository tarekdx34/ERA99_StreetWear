import { prisma } from "@/lib/prisma";

const LOCKOUT_WINDOW_MS = 15 * 60 * 1000;
const LOCKOUT_THRESHOLD = 5;

export async function getShopperLockout(ip: string) {
  const since = new Date(Date.now() - LOCKOUT_WINDOW_MS);
  const failures = await prisma.loginAttempt.findMany({
    where: {
      ip,
      success: false,
      createdAt: {
        gte: since,
      },
    },
    orderBy: { createdAt: "asc" },
    select: { createdAt: true },
  });

  if (failures.length < LOCKOUT_THRESHOLD) {
    return { locked: false as const, retryAfterSeconds: 0 };
  }

  const pivot = failures[failures.length - LOCKOUT_THRESHOLD];
  const unlockAt = pivot.createdAt.getTime() + LOCKOUT_WINDOW_MS;
  const remainingMs = unlockAt - Date.now();

  if (remainingMs <= 0) {
    return { locked: false as const, retryAfterSeconds: 0 };
  }

  return {
    locked: true as const,
    retryAfterSeconds: Math.ceil(remainingMs / 1000),
  };
}

export async function recordShopperLoginAttempt(params: {
  ip: string;
  success: boolean;
  userId?: string;
  email?: string;
}) {
  await prisma.loginAttempt.create({
    data: {
      ip: params.ip,
      success: params.success,
      userId: params.userId,
      username: params.email,
    },
  });
}
