"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setSubmitting(true);

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });
      const data = await res.json();
      setMessage(
        data.message ||
          "If an account exists for this email, a reset link has been sent.",
      );
    } catch {
      setMessage("If an account exists for this email, a reset link has been sent.");
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
            Forgot password
          </h1>

          <form className="mt-6 space-y-3" onSubmit={onSubmit}>
            <input
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              type="email"
              placeholder="Email"
              autoComplete="email"
              className="h-12 w-full border border-[0.5px] border-[#F0EDE8]/25 bg-[#0D0D0D] px-3 text-sm font-['Space_Grotesk'] outline-none focus:border-[#F0EDE8]"
              required
            />

            <button
              type="submit"
              disabled={submitting}
              className="h-12 w-full border border-[0.5px] border-[#F0EDE8] bg-[#F0EDE8] text-sm font-semibold uppercase tracking-[0.22em] text-[#080808] disabled:opacity-60"
            >
              {submitting ? "Sending..." : "Send reset link"}
            </button>
          </form>

          {message ? (
            <p className="mt-4 text-[12px] text-[#F0EDE8]/70">{message}</p>
          ) : null}

          <p className="mt-6 text-center text-[11px] text-[#F0EDE8]/55">
            Back to{" "}
            <Link href="/auth/login" className="underline">
              sign in
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
