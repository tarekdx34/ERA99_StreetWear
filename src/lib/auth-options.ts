import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { compare } from "bcryptjs";
import {
  getClientIp,
  getLockout,
  getTotpSecret,
  recordLoginAttempt,
  rotateSessionVersion,
  verifyChallengeToken,
  verifyTotpCode,
} from "@/lib/admin-security";
import { prisma } from "@/lib/prisma";
import {
  getShopperLockout,
  recordShopperLoginAttempt,
} from "@/lib/shopper-security";

const ADMIN_SESSION_MAX_AGE = 60 * 60 * 8;
const SHOPPER_SESSION_MAX_AGE = 60 * 60 * 24 * 30;
const SHOPPER_SHORT_SESSION_MAX_AGE = 60 * 60 * 24;
const DUMMY_BCRYPT_HASH =
  "$2b$12$ZjsK7uwzfWMD2Qf/V2S6Z.kYQrElUS7IF3bjCJWZ574n8OTrBAR42";

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
    maxAge: SHOPPER_SESSION_MAX_AGE,
    updateAge: 60 * 10,
  },
  providers: [
    CredentialsProvider({
      id: "admin-credentials",
      name: "Admin Credentials",
      credentials: {
        challengeToken: { label: "Challenge", type: "text" },
        code: { label: "2FA Code", type: "text" },
      },
      async authorize(credentials, req) {
        const challengeToken = String(credentials?.challengeToken || "");
        const code = String(credentials?.code || "");
        const headers =
          req?.headers instanceof Headers
            ? req.headers
            : new Headers(req?.headers as HeadersInit);
        const ip = getClientIp(headers);

        const lock = await getLockout(ip);
        if (lock.locked) return null;

        const payload = verifyChallengeToken(challengeToken, ip);
        if (!payload) {
          await recordLoginAttempt({ ip, success: false });
          return null;
        }

        const secret = await getTotpSecret();
        if (!secret) return null;

        const valid = verifyTotpCode(code, secret);
        if (!valid) {
          await recordLoginAttempt({
            ip,
            username: payload.username,
            success: false,
          });
          return null;
        }

        await recordLoginAttempt({
          ip,
          username: payload.username,
          success: true,
        });

        const sessionVersion = await rotateSessionVersion();

        return {
          id: "admin",
          name: payload.username,
          role: "admin",
          rememberMe: false,
          sessionVersion,
        } as any;
      },
    }),
    CredentialsProvider({
      id: "shopper-credentials",
      name: "Shopper Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        rememberMe: { label: "Remember me", type: "text" },
      },
      async authorize(credentials, req) {
        const email = String(credentials?.email || "")
          .trim()
          .toLowerCase();
        const password = String(credentials?.password || "");
        const rememberMe = ["true", "1", "on"].includes(
          String(credentials?.rememberMe || "").toLowerCase(),
        );
        const headers =
          req?.headers instanceof Headers
            ? req.headers
            : new Headers(req?.headers as HeadersInit);
        const ip = getClientIp(headers);

        const lock = await getShopperLockout(ip);
        if (lock.locked) {
          throw new Error(`LOCKED_OUT:${lock.retryAfterSeconds}`);
        }

        if (!email || !password) return null;

        const user = await prisma.user.findUnique({
          where: { email },
        });

        if (!user?.passwordHash) {
          await compare(password, DUMMY_BCRYPT_HASH);
          await recordShopperLoginAttempt({
            ip,
            email,
            success: false,
          });
          throw new Error("INVALID_CREDENTIALS");
        }

        const validPassword = await compare(password, user.passwordHash);
        if (!validPassword) {
          await recordShopperLoginAttempt({
            ip,
            email,
            userId: user.id,
            success: false,
          });
          throw new Error("INVALID_CREDENTIALS");
        }

        await recordShopperLoginAttempt({
          ip,
          email,
          userId: user.id,
          success: true,
        });

        const fullName = [user.firstName, user.lastName]
          .filter(Boolean)
          .join(" ")
          .trim();

        return {
          id: user.id,
          email: user.email,
          name: fullName || user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          authVersion: user.authVersion,
          role: "shopper",
          rememberMe,
        } as any;
      },
    }),
    CredentialsProvider({
      id: "email-verification-token",
      name: "Email Verification Token",
      credentials: {
        token: { label: "Token", type: "text" },
      },
      async authorize(credentials) {
        const tokenValue = String(credentials?.token || "").trim();
        if (!tokenValue) return null;

        const now = new Date();
        const verifiedUser = await prisma.$transaction(async (tx) => {
          const verification = await tx.emailVerificationToken.findUnique({
            where: { token: tokenValue },
          });

          if (!verification) return null;

          const consumed = await tx.emailVerificationToken.updateMany({
            where: {
              id: verification.id,
              used: false,
              expiresAt: { gt: now },
            },
            data: { used: true },
          });

          if (consumed.count !== 1) return null;

          return tx.user.update({
            where: { id: verification.userId },
            data: { emailVerified: true },
          });
        });

        if (!verifiedUser) return null;

        const fullName = [verifiedUser.firstName, verifiedUser.lastName]
          .filter(Boolean)
          .join(" ")
          .trim();

        return {
          id: verifiedUser.id,
          email: verifiedUser.email,
          name: fullName || verifiedUser.email,
          firstName: verifiedUser.firstName,
          lastName: verifiedUser.lastName,
          authVersion: verifiedUser.authVersion,
          role: "shopper",
          rememberMe: true,
        } as any;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        const role = (user as any).role === "admin" ? "admin" : "shopper";
        const maxAgeSeconds =
          role === "admin"
            ? ADMIN_SESSION_MAX_AGE
            : (user as any).rememberMe
              ? SHOPPER_SESSION_MAX_AGE
              : SHOPPER_SHORT_SESSION_MAX_AGE;

        token.sub = String(user.id);
        (token as any).role = role;
        (token as any).isAdmin = role === "admin";
        (token as any).username = role === "admin" ? user.name : undefined;
        (token as any).sessionVersion =
          role === "admin" ? (user as any).sessionVersion || "0" : undefined;
        (token as any).firstName = (user as any).firstName || undefined;
        (token as any).lastName = (user as any).lastName || undefined;
        (token as any).authVersion =
          role === "shopper" ? (user as any).authVersion ?? 0 : undefined;
        (token as any).sessionExpiresAt = Date.now() + maxAgeSeconds * 1000;
        token.exp = Math.floor(((token as any).sessionExpiresAt as number) / 1000);
      }

      if ((token as any).role === "shopper" && token.sub) {
        const current = await prisma.user.findUnique({
          where: { id: token.sub },
          select: { authVersion: true },
        });

        if (!current) return {};
        if ((token as any).authVersion !== current.authVersion) {
          return {};
        }
      }

      return token;
    },
    async session({ session, token }) {
      (session.user as any).id = token.sub;
      (session.user as any).role = (token as any).role;
      (session.user as any).isAdmin = (token as any).isAdmin;
      (session.user as any).username = (token as any).username;
      (session.user as any).sessionVersion = (token as any).sessionVersion;
      (session.user as any).firstName = (token as any).firstName;
      (session.user as any).lastName = (token as any).lastName;
      if ((token as any).sessionExpiresAt) {
        session.expires = new Date((token as any).sessionExpiresAt).toISOString();
      }
      return session;
    },
  },
};
