"use client";

import { FormEvent, useState } from "react";

export function EarlyAccessForm() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setError("");

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Something went wrong. Try again.");
      return;
    }

    try {
      const res = await fetch("/api/early-access", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          source: "early-access",
          timestamp: new Date().toISOString(),
        }),
      });
      if (!res.ok) throw new Error("EARLY_ACCESS_FAILED");
      setSubmitted(true);
    } catch {
      setError("Something went wrong. Try again.");
    }
  };

  if (submitted) {
    return (
      <p className="font-anton mx-auto max-w-full text-[clamp(34px,14vw,84px)] uppercase leading-[0.9] tracking-[0.16em] text-[#EDE9E0] [overflow-wrap:anywhere] sm:tracking-[0.2em]">
        YOU&apos;RE IN. WATCH FOR THE SIGNAL.
      </p>
    );
  }

  return (
    <form onSubmit={submit} className="w-full">
      <div className="mb-8 h-px w-full bg-[#8B0000]" />
      <div className="grid min-w-0 gap-3 sm:grid-cols-[minmax(0,1fr)_auto]">
        <input
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="your@email.com"
          type="email"
          className="h-12 min-w-0 w-full border border-[#EDE9E0] bg-transparent px-3 text-sm text-[#EDE9E0] placeholder:text-[#555555] focus:outline-none"
          required
        />
        <button
          type="submit"
          className="h-12 min-w-0 border border-[#EDE9E0] bg-transparent px-5 font-anton text-[12px] uppercase tracking-[0.24em] text-[#EDE9E0] transition-colors hover:bg-[#EDE9E0] hover:text-[#080808] sm:px-6 sm:text-[13px] sm:tracking-[0.34em]"
        >
          NOTIFY ME
        </button>
      </div>
      {error ? <p className="mt-3 text-sm text-[#555555]">{error}</p> : null}
    </form>
  );
}
