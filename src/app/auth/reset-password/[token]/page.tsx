"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { FormEvent, useEffect, useMemo, useState } from "react";

type State = "loading" | "invalid" | "ready";

type PasswordStrength = "WEAK" | "GOOD" | "STRONG";

function getPasswordStrength(password: string): PasswordStrength {
  if (password.length < 8) return "WEAK";

  let score = 0;
  if (/[a-z]/.test(password)) score += 1;
  if (/[A-Z]/.test(password)) score += 1;
  if (/\d/.test(password)) score += 1;
  if (/[^A-Za-z0-9]/.test(password)) score += 1;

  if (password.length >= 12 && score >= 3) return "STRONG";
  if (score >= 2) return "GOOD";
  return "WEAK";
}

export default function ResetPasswordPage() {
  const params = useParams<{ token: string }>();
  const router = useRouter();

  const token = params.token || "";
  const [state, setState] = useState<State>("loading");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const strength = useMemo(() => getPasswordStrength(password), [password]);

  useEffect(() => {
    let active = true;

    const validateToken = async () => {
      if (!token) {
        if (active) setState("invalid");
        return;
      }

      try {
        const res = await fetch(`/api/auth/reset-password/${token}`);
        const data = await res.json();
        if (!active) return;
        setState(data.valid ? "ready" : "invalid");
      } catch {
        if (!active) return;
        setState("invalid");
      }
    };

    validateToken();

    return () => {
      active = false;
    };
  }, [token]);

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setError("");

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch(`/api/auth/reset-password/${token}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password, confirmPassword }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.message || "Unable to reset password.");
        return;
      }

      router.push("/auth/login?message=password-updated");
    } catch {
      setError("Unable to reset password.");
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

          {state === "loading" ? (
            <p className="mt-8 text-center text-sm text-[#F0EDE8]/80">Validating reset link...</p>
          ) : null}

          {state === "invalid" ? (
            <div className="mt-8 space-y-4 text-center">
              <p className="text-sm text-[#8B0000]">Invalid or expired reset link.</p>
              <Link href="/auth/forgot-password" className="text-xs uppercase tracking-[0.2em] underline">
                Request a new link
              </Link>
            </div>
          ) : null}

          {state === "ready" ? (
            <>
              <h1 className="mt-8 text-center text-xs uppercase tracking-[0.25em] text-[#F0EDE8]/70">
                Reset password
              </h1>

              <form className="mt-6 space-y-3" onSubmit={onSubmit}>
                <input
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  type="password"
                  placeholder="New password"
                  className="h-12 w-full border border-[0.5px] border-[#F0EDE8]/25 bg-[#0D0D0D] px-3 text-sm font-['Space_Grotesk'] outline-none focus:border-[#F0EDE8]"
                  required
                />

                <p className="text-[11px] uppercase tracking-[0.2em] text-[#F0EDE8]/60">
                  Strength: {strength}
                </p>

                <input
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  type="password"
                  placeholder="Confirm new password"
                  className="h-12 w-full border border-[0.5px] border-[#F0EDE8]/25 bg-[#0D0D0D] px-3 text-sm font-['Space_Grotesk'] outline-none focus:border-[#F0EDE8]"
                  required
                />

                {error ? <p className="text-[12px] text-[#8B0000]">{error}</p> : null}

                <button
                  type="submit"
                  disabled={submitting}
                  className="h-12 w-full border border-[0.5px] border-[#F0EDE8] bg-[#F0EDE8] text-sm font-semibold uppercase tracking-[0.22em] text-[#080808] disabled:opacity-60"
                >
                  {submitting ? "Updating..." : "Update password"}
                </button>
              </form>
            </>
          ) : null}
        </div>
      </div>
    </main>
  );
}
