"use client";

import { signIn } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useMemo, useRef, useState } from "react";

type Step = "password" | "totp";

export default function AdminLoginPage() {
  const router = useRouter();
  const codeRef = useRef<HTMLInputElement | null>(null);

  const [step, setStep] = useState<Step>("password");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [challengeToken, setChallengeToken] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const heading = useMemo(
    () => (step === "password" ? "Admin Access" : "Two-Factor Verification"),
    [step],
  );

  const startLogin = async (event: FormEvent) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/admin/auth/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.message || "Invalid credentials.");
        return;
      }

      if (data.requiresSetup) {
        router.push(`/admin/setup-2fa?challenge=${encodeURIComponent(data.challengeToken)}`);
        return;
      }

      setChallengeToken(data.challengeToken);
      setStep("totp");
      window.setTimeout(() => codeRef.current?.focus(), 20);
    } catch {
      setError("Unable to start login.");
    } finally {
      setLoading(false);
    }
  };

  const verifyCode = async (event: FormEvent) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    const result = await signIn("credentials", {
      challengeToken,
      code,
      redirect: false,
    });

    setLoading(false);

    if (!result || result.error) {
      setError("Invalid or expired 2FA code.");
      return;
    }

    router.push("/admin/dashboard");
    router.refresh();
  };

  return (
    <main className="min-h-screen bg-[#080808] text-[#F0EDE8]">
      <div className="mx-auto flex min-h-screen w-full max-w-md flex-col items-center justify-center px-6">
        <p className="font-blackletter text-6xl leading-none">QUTB</p>
        <p className="mt-3 text-[12px] font-medium uppercase tracking-[0.3em] text-[#F0EDE8]/55">
          99 — ADMIN
        </p>

        <h1 className="mt-12 text-sm uppercase tracking-[0.2em] text-[#F0EDE8]/65">
          {heading}
        </h1>

        {step === "password" ? (
          <form onSubmit={startLogin} className="mt-6 w-full space-y-3">
            <input
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              placeholder="Username"
              className="h-12 w-full border border-[#F0EDE8]/25 bg-[#111111] px-3 text-sm focus:border-[#F0EDE8] focus:outline-none"
              autoComplete="username"
              required
            />
            <input
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              type="password"
              placeholder="Password"
              className="h-12 w-full border border-[#F0EDE8]/25 bg-[#111111] px-3 text-sm focus:border-[#F0EDE8] focus:outline-none"
              autoComplete="current-password"
              required
            />
            <button
              disabled={loading}
              type="submit"
              className="h-12 w-full border border-[#F0EDE8] bg-[#F0EDE8] text-xs font-bold uppercase tracking-[0.2em] text-[#080808] disabled:opacity-60"
            >
              {loading ? "CHECKING..." : "CONTINUE →"}
            </button>
          </form>
        ) : (
          <form onSubmit={verifyCode} className="mt-6 w-full space-y-3">
            <input
              ref={codeRef}
              value={code}
              onChange={(event) =>
                setCode(event.target.value.replace(/\D/g, "").slice(0, 6))
              }
              onPaste={(event) => {
                const pasted = event.clipboardData
                  .getData("text")
                  .replace(/\D/g, "")
                  .slice(0, 6);
                if (pasted) {
                  event.preventDefault();
                  setCode(pasted);
                }
              }}
              inputMode="numeric"
              pattern="[0-9]*"
              placeholder="6-digit code"
              className="h-12 w-full border border-[#F0EDE8]/25 bg-[#111111] px-3 text-center text-lg tracking-[0.35em] focus:border-[#F0EDE8] focus:outline-none"
              required
            />
            <button
              disabled={loading || code.length !== 6}
              type="submit"
              className="h-12 w-full border border-[#F0EDE8] bg-[#F0EDE8] text-xs font-bold uppercase tracking-[0.2em] text-[#080808] disabled:opacity-60"
            >
              {loading ? "VERIFYING..." : "VERIFY →"}
            </button>
            <button
              type="button"
              onClick={() => {
                setStep("password");
                setCode("");
                setChallengeToken("");
                setError("");
              }}
              className="w-full text-xs uppercase tracking-[0.2em] text-[#F0EDE8]/65 hover:text-[#F0EDE8]"
            >
              Back
            </button>
          </form>
        )}

        {error ? (
          <p className="mt-4 text-center text-xs text-[#8B0000]">{error}</p>
        ) : null}

        <p className="mt-8 text-center text-[11px] text-[#F0EDE8]/40">
          Internal access only.
        </p>

        <Link href="/" className="mt-3 text-[11px] text-[#F0EDE8]/45 hover:text-[#F0EDE8]/80">
          Back to storefront
        </Link>
      </div>
    </main>
  );
}
