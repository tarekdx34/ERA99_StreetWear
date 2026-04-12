import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import {
  getClientIp,
  getLockout,
  getTotpSecret,
  recordLoginAttempt,
  rotateSessionVersion,
  verifyChallengeToken,
  verifyTotpCode,
} from "@/lib/admin-security";

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
    maxAge: 60 * 60 * 8,
    updateAge: 60 * 10,
  },
  pages: {
    signIn: "/admin/login",
  },
  providers: [
    CredentialsProvider({
      name: "Admin Credentials",
      credentials: {
        challengeToken: { label: "Challenge", type: "text" },
        code: { label: "2FA Code", type: "text" },
      },
      async authorize(credentials, req) {
        const challengeToken = String(credentials?.challengeToken || "");
        const code = String(credentials?.code || "");
        const headers = req?.headers instanceof Headers
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
          sessionVersion,
        } as any;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        (token as any).isAdmin = true;
        (token as any).username = user.name;
        (token as any).sessionVersion = (user as any).sessionVersion || "0";
      }
      return token;
    },
    async session({ session, token }) {
      (session.user as any).isAdmin = (token as any).isAdmin;
      (session.user as any).username = (token as any).username;
      (session.user as any).sessionVersion = (token as any).sessionVersion;
      return session;
    },
  },
};
