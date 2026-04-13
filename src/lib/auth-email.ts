import { randomBytes } from "crypto";
import { Resend } from "resend";
import { prisma } from "@/lib/prisma";

const TOKEN_BYTES = 32;
const EMAIL_TOKEN_TTL_MS = 24 * 60 * 60 * 1000;
const PASSWORD_RESET_TOKEN_TTL_MS = 60 * 60 * 1000;

function getBaseUrl() {
  const configured = process.env.NEXTAUTH_URL?.trim();
  return configured?.length ? configured : "http://localhost:3000";
}

function getResendClient() {
  const apiKey = process.env.RESEND_API_KEY?.trim();
  if (!apiKey) return null;
  return new Resend(apiKey);
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
  const client = getResendClient();
  if (!client) {
    throw new Error("RESEND_API_KEY is not configured");
  }

  const baseUrl = getBaseUrl();
  const verificationUrl = `${baseUrl}/auth/verify-email/${params.token}?email=${encodeURIComponent(params.email)}`;
  const greetingName = params.firstName?.trim() || "there";

  await client.emails.send({
    from: "ERA 99 <noreply@era99.co>",
    to: [params.email],
    subject: "Verify your ERA 99 account",
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.5; color: #111;">
        <p>Hi ${greetingName},</p>
        <p>Welcome to ERA 99. Please verify your email to start shopping.</p>
        <p>
          <a href="${verificationUrl}" style="display:inline-block;padding:10px 16px;background:#111;color:#fff;text-decoration:none;">
            Verify email
          </a>
        </p>
        <p>This link expires in 24 hours.</p>
        <p style="margin-top: 30px; font-size: 12px; color: #666;">ERA 99 &middot; Alexandria, Egypt &middot; The axis holds.</p>
        <p style="margin-top: 30px; font-size: 12px; color: #666;">ERA 99 &middot; Alexandria, Egypt &middot; The axis holds.</p>
      </div>
    `,
  });
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
  const client = getResendClient();
  if (!client) {
    throw new Error("RESEND_API_KEY is not configured");
  }

  const baseUrl = getBaseUrl();
  const resetUrl = `${baseUrl}/auth/reset-password/${params.token}`;
  const greetingName = params.firstName?.trim() || "there";

  await client.emails.send({
    from: "ERA 99 <noreply@era99.co>",
    to: [params.email],
    subject: "Reset your ERA 99 password",
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.5; color: #111;">
        <p>Hi ${greetingName},</p>
        <p>We received a request to reset your ERA 99 account password.</p>
        <p>
          <a href="${resetUrl}" style="display:inline-block;padding:10px 16px;background:#111;color:#fff;text-decoration:none;">
            Reset password
          </a>
        </p>
        <p>This link expires in 1 hour.</p>
        <p style="margin-top: 30px; font-size: 12px; color: #666;">ERA 99 &middot; Alexandria, Egypt &middot; The axis holds.</p>
        <p style="margin-top: 30px; font-size: 12px; color: #666;">ERA 99 &middot; Alexandria, Egypt &middot; The axis holds.</p>
      </div>
    `,
  });
}
