"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useMemo, useState } from "react";
import { useAnalytics } from "@/hooks/useAnalytics";
import { useMetaPixel } from "@/hooks/useMetaPixel";

type PasswordStrength = "WEAK" | "GOOD" | "STRONG";

type FormState = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
};

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

function emailLooksValid(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export default function RegisterPage() {
  const router = useRouter();
  const { trackEvent } = useAnalytics();
  const { track } = useMetaPixel();
  const [form, setForm] = useState<FormState>({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [checkingEmail, setCheckingEmail] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [existsError, setExistsError] = useState(false);

  const passwordStrength = useMemo(
    () => getPasswordStrength(form.password),
    [form.password],
  );

  const setField = (name: keyof FormState, value: string) => {
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => {
      const next = { ...prev };
      delete next[name];
      return next;
    });
    if (name === "email") {
      setExistsError(false);
    }
  };

  const checkEmailUniqueness = async () => {
    if (!emailLooksValid(form.email)) {
      setErrors((prev) => ({ ...prev, email: "Please enter a valid email." }));
      return;
    }

    setCheckingEmail(true);
    try {
      const res = await fetch("/api/auth/check-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.email.trim().toLowerCase() }),
      });
      const data = await res.json();

      if (!res.ok || !data.available) {
        setErrors((prev) => ({
          ...prev,
          email: "This email is already in use.",
        }));
      }
    } catch {
      setErrors((prev) => ({
        ...prev,
        email: "Could not verify email right now.",
      }));
    } finally {
      setCheckingEmail(false);
    }
  };

  const validateClient = () => {
    const nextErrors: Record<string, string> = {};

    if (!form.firstName.trim()) nextErrors.firstName = "First name is required.";
    if (!form.lastName.trim()) nextErrors.lastName = "Last name is required.";
    if (!emailLooksValid(form.email)) nextErrors.email = "Enter a valid email.";
    if (form.password.length < 8)
      nextErrors.password = "Password must be at least 8 characters.";
    if (form.confirmPassword !== form.password)
      nextErrors.confirmPassword = "Passwords do not match.";

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setExistsError(false);

    if (!validateClient()) return;

    setSubmitting(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (res.status === 409) {
        setExistsError(true);
        return;
      }

      if (!res.ok) {
        setErrors((prev) => ({
          ...prev,
          form: "Unable to create account right now.",
        }));
        return;
      }

      trackEvent("sign_up", { method: "email" });
      track("CompleteRegistration", { method: "email" });

      router.push("/auth/login?message=account-created");
    } catch {
      setErrors((prev) => ({
        ...prev,
        form: "Unable to create account right now.",
      }));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#080808] text-[#F0EDE8]">
      <div className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center px-6">
        <div className="border border-[0.5px] border-[#F0EDE8]/25 bg-[#111111] p-6">
          <div className="text-center">
            <p className="font-anton text-5xl leading-none tracking-[16px] text-[#ede9e0]">QUTB</p>
            <p className="mt-2 text-[11px] uppercase tracking-[0.3em] text-[#555555]">
              THE AXIS
            </p>
          </div>

          <h1 className="mt-8 text-center text-xs uppercase tracking-[0.25em] text-[#F0EDE8]/70">
            Create Account
          </h1>

          <form className="mt-6 space-y-3" onSubmit={onSubmit}>
            <input
              value={form.firstName}
              onChange={(event) => setField("firstName", event.target.value)}
              placeholder="First name"
              className="h-12 w-full border border-[0.5px] border-[#F0EDE8]/25 bg-[#0D0D0D] px-3 text-sm font-['Space_Grotesk'] outline-none focus:border-[#F0EDE8]"
            />
            {errors.firstName ? (
              <p className="text-[12px] text-[#8B0000]">{errors.firstName}</p>
            ) : null}

            <input
              value={form.lastName}
              onChange={(event) => setField("lastName", event.target.value)}
              placeholder="Last name"
              className="h-12 w-full border border-[0.5px] border-[#F0EDE8]/25 bg-[#0D0D0D] px-3 text-sm font-['Space_Grotesk'] outline-none focus:border-[#F0EDE8]"
            />
            {errors.lastName ? (
              <p className="text-[12px] text-[#8B0000]">{errors.lastName}</p>
            ) : null}

            <input
              value={form.email}
              onChange={(event) => setField("email", event.target.value)}
              onBlur={checkEmailUniqueness}
              placeholder="Email"
              type="email"
              className={`h-12 w-full border border-[0.5px] bg-[#0D0D0D] px-3 text-sm font-['Space_Grotesk'] outline-none focus:border-[#F0EDE8] ${
                errors.email ? "border-[#8B0000]" : "border-[#F0EDE8]/25"
              }`}
            />
            {checkingEmail ? (
              <p className="text-[12px] text-[#F0EDE8]/55">Checking email...</p>
            ) : null}
            {errors.email ? (
              <p className="text-[12px] text-[#8B0000]">{errors.email}</p>
            ) : null}

            <input
              value={form.password}
              onChange={(event) => setField("password", event.target.value)}
              placeholder="Password"
              type="password"
              className={`h-12 w-full border border-[0.5px] bg-[#0D0D0D] px-3 text-sm font-['Space_Grotesk'] outline-none focus:border-[#F0EDE8] ${
                errors.password ? "border-[#8B0000]" : "border-[#F0EDE8]/25"
              }`}
            />
            <p className="text-[11px] uppercase tracking-[0.2em] text-[#F0EDE8]/60">
              Strength: {passwordStrength}
            </p>
            {errors.password ? (
              <p className="text-[12px] text-[#8B0000]">{errors.password}</p>
            ) : null}

            <input
              value={form.confirmPassword}
              onChange={(event) => setField("confirmPassword", event.target.value)}
              onBlur={() => {
                if (form.confirmPassword !== form.password) {
                  setErrors((prev) => ({
                    ...prev,
                    confirmPassword: "Passwords do not match.",
                  }));
                }
              }}
              placeholder="Confirm password"
              type="password"
              className={`h-12 w-full border border-[0.5px] bg-[#0D0D0D] px-3 text-sm font-['Space_Grotesk'] outline-none focus:border-[#F0EDE8] ${
                errors.confirmPassword ? "border-[#8B0000]" : "border-[#F0EDE8]/25"
              }`}
            />
            {errors.confirmPassword ? (
              <p className="text-[12px] text-[#8B0000]">{errors.confirmPassword}</p>
            ) : null}

            {existsError ? (
              <p className="text-[12px] text-[#8B0000]">
                Account already exists. Sign in instead?{" "}
                <Link href="/auth/login" className="underline">
                  Go to sign in
                </Link>
              </p>
            ) : null}

            {errors.form ? (
              <p className="text-[12px] text-[#8B0000]">{errors.form}</p>
            ) : null}

            <button
              type="submit"
              disabled={submitting}
              className="h-12 w-full border border-[0.5px] border-[#F0EDE8] bg-[#F0EDE8] text-sm font-semibold uppercase tracking-[0.22em] text-[#080808] disabled:opacity-60"
            >
              {submitting ? "Creating..." : "Create account"}
            </button>
          </form>

          <p className="mt-6 text-center text-[11px] text-[#F0EDE8]/55">
            Already have an account?{" "}
            <Link href="/auth/login" className="underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
