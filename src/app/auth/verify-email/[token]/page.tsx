"use client";

import Link from "next/link";
import { signIn } from "next-auth/react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

type VerifyState = "loading" | "invalid" | "success";

export default function VerifyEmailTokenPage({
}: {}) {
  const params = useParams<{ token: string }>();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [state, setState] = useState<VerifyState>("loading");
  const [resending, setResending] = useState(false);
  const [resendMessage, setResendMessage] = useState("");

  const email = searchParams.get("email") || "";

  useEffect(() => {
    let active = true;

    const run = async () => {
      try {
        const tokenValue = params.token || "";
        if (!active) return;

        if (!tokenValue) {
          setState("invalid");
          return;
        }

        const result = await signIn("email-verification-token", {
          token: tokenValue,
          redirect: false,
        });

        if (!active) return;

        if (!result || result.error) {
          setState("invalid");
          return;
        }

        setState("success");
        router.replace("/account");
      } catch {
        if (!active) return;
        setState("invalid");
      }
    };

    run();

    return () => {
      active = false;
    };
  }, [params.token, router]);

  const resend = async () => {
    if (!email) {
      setResendMessage("Add your email to the link to resend verification.");
      return;
    }

    setResending(true);
    setResendMessage("");

    try {
      const res = await fetch("/api/auth/resend-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      setResendMessage(
        data.message ||
          "If an account exists for this email, a verification link has been sent.",
      );
    } catch {
      setResendMessage(
        "If an account exists for this email, a verification link has been sent.",
      );
    } finally {
      setResending(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#080808] text-[#F0EDE8]">
      <div className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center px-6">
        <div className="border border-[0.5px] border-[#F0EDE8]/25 bg-[#111111] p-6 text-center">
          <p className="font-blackletter text-5xl leading-none">ERA 99</p>
          <p className="mt-2 text-[11px] uppercase tracking-[0.3em] text-[#F0EDE8]/55">
            99 - ALEXANDRIA
          </p>

          {state === "loading" ? (
            <p className="mt-8 text-sm text-[#F0EDE8]/80">Verifying your email...</p>
          ) : null}

          {state === "invalid" ? (
            <div className="mt-8 space-y-4">
              <p className="text-sm text-[#8B0000]">
                This verification link is invalid or expired.
              </p>
              <button
                type="button"
                onClick={resend}
                disabled={resending}
                className="h-12 w-full border border-[0.5px] border-[#F0EDE8] bg-[#F0EDE8] text-xs uppercase tracking-[0.2em] text-[#080808] disabled:opacity-60"
              >
                {resending ? "Sending..." : "Resend verification email"}
              </button>
              {resendMessage ? (
                <p className="text-[12px] text-[#F0EDE8]/70">{resendMessage}</p>
              ) : null}
            </div>
          ) : null}

          {state === "success" ? (
            <p className="mt-8 text-sm text-[#F0EDE8]/80">
              Email verified. Redirecting...
            </p>
          ) : null}

          <Link
            href="/"
            className="mt-6 inline-block text-xs uppercase tracking-[0.2em] text-[#F0EDE8]/65 underline"
          >
            Back to storefront
          </Link>
        </div>
      </div>
    </main>
  );
}
