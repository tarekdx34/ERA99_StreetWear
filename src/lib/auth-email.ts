import { randomBytes } from "crypto";
import { prisma } from "@/lib/prisma";
import {
  sendEmailVerification,
  sendPasswordReset,
} from "@/lib/email";

const TOKEN_BYTES = 32;
const EMAIL_TOKEN_TTL_MS = 24 * 60 * 60 * 1000;
const PASSWORD_RESET_TOKEN_TTL_MS = 60 * 60 * 1000;

function getBaseUrl() {
  const configured = process.env.NEXTAUTH_URL?.trim();
  return configured?.length ? configured : "http://localhost:3000";
}

function makeVerificationToken() {
  return randomBytes(TOKEN_BYTES).toString("hex");
}

export async function createEmailVerificationToken(userId: string) {
  const token = makeVerificationToken();
  const expiresAt = new Date(Date.now() + EMAIL_TOKEN_TTL_MS);

  const saved = await prisma.emailVerificationToken.create({
    data: {
      userId,
      token,
      expiresAt,
    },
  });

  return saved;
}

export async function sendVerificationEmail(params: {
  email: string;
  firstName?: string | null;
  token: string;
}) {
  const baseUrl = getBaseUrl();
  const verificationUrl = `${baseUrl}/auth/verify-email/${params.token}?email=${encodeURIComponent(params.email)}`;
  await sendEmailVerification(params.email, verificationUrl);
}

export async function createPasswordResetToken(userId: string) {
  const token = makeVerificationToken();
  const expiresAt = new Date(Date.now() + PASSWORD_RESET_TOKEN_TTL_MS);

  const saved = await prisma.passwordResetToken.create({
    data: {
      userId,
      token,
      expiresAt,
    },
  });

  return saved;
}

export async function sendPasswordResetEmail(params: {
  email: string;
  firstName?: string | null;
  token: string;
}) {
  const baseUrl = getBaseUrl();
  const resetUrl = `${baseUrl}/auth/reset-password/${params.token}`;
  await sendPasswordReset(params.email, resetUrl);
}
