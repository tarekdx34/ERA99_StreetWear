"use client";

import Link from "next/link";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { useAnalytics } from "@/hooks/useAnalytics";

function formatCountdown(seconds: number) {
  const safe = Math.max(0, seconds);
  const minutes = Math.floor(safe / 60)
    .toString()
    .padStart(2, "0");
  const remainder = (safe % 60).toString().padStart(2, "0");
  return `${minutes}:${remainder}`;
}

export default function LoginPage() {
  const router = useRouter();
  const { trackEvent } = useAnalytics();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("next") || "/";
  const flashMessage = searchParams.get("message");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [countdown, setCountdown] = useState(0);

  useEffect(() => {
    if (countdown <= 0) return;
    const timer = window.setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          window.clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => window.clearInterval(timer);
  }, [countdown]);

  const lockoutText = useMemo(() => {
    if (countdown <= 0) return "";
    return `Too many attempts. Try again in ${formatCountdown(countdown)}`;
  }, [countdown]);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setError("");

    if (countdown > 0) {
      setError(lockoutText);
      return;
    }

    setSubmitting(true);

    try {
      const result = await signIn("shopper-credentials", {
        email: email.trim().toLowerCase(),
        password,
        rememberMe: rememberMe ? "true" : "false",
        redirect: false,
      });

      if (!result || result.error) {
        const errorCode = result?.error || "";
        if (errorCode.startsWith("LOCKED_OUT:")) {
          const seconds = Number(errorCode.split(":")[1] || 0);
          setCountdown(Number.isFinite(seconds) ? seconds : 0);
          setError(
            `Too many attempts. Try again in ${formatCountdown(Number.isFinite(seconds) ? seconds : 0)}`,
          );
        } else {
          setError("Incorrect email or password.");
        }
        return;
      }

      trackEvent("login", { method: "email" });

      router.push(redirectTo);
      router.refresh();
    } catch {
      setError("Unable to sign in right now.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#080808] text-[#F0EDE8]">
      <div className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center px-6">
        <div className="border border-[0.5px] border-[#F0EDE8]/25 bg-[#111111] p-6">
          <div className="text-center">
            <p className="font-blackletter text-5xl leading-none">6 STREET</p>
            <p className="mt-2 text-[11px] uppercase tracking-[0.3em] text-[#F0EDE8]/55">
              99 - ALEXANDRIA
            </p>
          </div>

          <h1 className="mt-8 text-center text-xs uppercase tracking-[0.25em] text-[#F0EDE8]/70">
            Sign In
          </h1>

          {flashMessage === "password-updated" ? (
            <p className="mt-4 text-[12px] text-[#F0EDE8]/75">
              Password updated. Please sign in.
            </p>
          ) : null}
          {flashMessage === "account-created" ? (
            <p className="mt-4 text-[12px] text-[#F0EDE8]/75">
              Account created. Please sign in.
            </p>
          ) : null}

          <form className="mt-6 space-y-3" onSubmit={submit}>
            <input
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              type="email"
              placeholder="Email"
              autoComplete="email"
              className="h-12 w-full border border-[0.5px] border-[#F0EDE8]/25 bg-[#0D0D0D] px-3 text-sm font-['Space_Grotesk'] outline-none focus:border-[#F0EDE8]"
              required
            />

            <input
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              type="password"
              placeholder="Password"
              autoComplete="current-password"
              className="h-12 w-full border border-[0.5px] border-[#F0EDE8]/25 bg-[#0D0D0D] px-3 text-sm font-['Space_Grotesk'] outline-none focus:border-[#F0EDE8]"
              required
            />

            <label className="flex items-center gap-2 text-[11px] uppercase tracking-[0.16em] text-[#F0EDE8]/70">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(event) => setRememberMe(event.target.checked)}
                className="h-4 w-4 accent-[#F0EDE8]"
              />
              Remember me
            </label>

            {error ? <p className="text-[12px] text-[#8B0000]">{error}</p> : null}

            <button
              type="submit"
              disabled={submitting || countdown > 0}
              className="h-12 w-full border border-[0.5px] border-[#F0EDE8] bg-[#F0EDE8] text-sm font-semibold uppercase tracking-[0.22em] text-[#080808] disabled:opacity-60"
            >
              {submitting ? "Signing in..." : "Sign in"}
            </button>
          </form>

          <div className="mt-6 space-y-2 text-center text-[11px] text-[#F0EDE8]/55">
            <p>
              <Link href="/auth/forgot-password" className="underline">
                Forgot password?
              </Link>
            </p>
            <p>
              No account?{" "}
              <Link href="/auth/register" className="underline">
                Register
              </Link>
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
