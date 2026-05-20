import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { EarlyAccessForm } from "./early-access-form";
import {
  EarlyAccessCountdown,
  type CountdownParts,
} from "./early-access-countdown";
import { getEarlyAccessState } from "@/lib/early-access";

export const metadata: Metadata = {
  title: "THE NEXT ERA IS COMING — QUTB",
  description:
    "BE THE FIRST TO KNOW WHEN ERA 99 DROPS. QUTB. Alexandria, Egypt.",
  alternates: {
    canonical: "https://qutb.studio/early-access",
  },
  openGraph: {
    title: "THE NEXT ERA IS COMING — QUTB",
    description: "BE THE FIRST TO KNOW WHEN ERA 99 DROPS.",
    url: "https://qutb.studio/early-access",
    type: "website",
  },
};

function getInitialRemaining(deadline: string | null): CountdownParts | null {
  if (!deadline) return null;
  const target = new Date(deadline).getTime();
  if (Number.isNaN(target)) return null;
  const diff = Math.max(0, target - Date.now());
  return {
    days: Math.floor(diff / 86_400_000),
    hours: Math.floor((diff % 86_400_000) / 3_600_000),
    minutes: Math.floor((diff % 3_600_000) / 60_000),
    seconds: Math.floor((diff % 60_000) / 1000),
  };
}

export default async function EarlyAccessPage() {
  const state = await getEarlyAccessState();

  if (!state.earlyAccessActive) {
    redirect("/");
  }

  return (
    <main className="relative grid min-h-screen overflow-hidden bg-[#080808] px-4 py-12 text-[#EDE9E0] sm:px-6 sm:py-16">
      <img
        src="/images/1.avif"
        alt=""
        className="absolute inset-0 h-full w-full object-cover opacity-45"
      />
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(8,8,8,0.94),rgba(8,8,8,0.72)_48%,rgba(8,8,8,0.94)),linear-gradient(180deg,rgba(8,8,8,0.78),rgba(8,8,8,0.96))]" />
      <section className="relative z-10 mx-auto flex w-full max-w-4xl flex-col justify-center text-center">
        <p className="text-[11px] uppercase tracking-[0.34em] text-[#EDE9E0]/65 sm:text-[12px]">
          QUTB — ERA 99 — DROP 001
        </p>
        <h1 className="font-anton mx-auto mt-6 max-w-full text-[clamp(42px,14vw,118px)] uppercase leading-[0.9] tracking-[0.14em] text-[#EDE9E0] [overflow-wrap:anywhere] sm:tracking-[0.18em]">
          THE AXIS OPENS SOON
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-[12px] uppercase leading-relaxed tracking-[0.22em] text-[#EDE9E0]/85 sm:text-[14px] sm:tracking-[0.28em]">
          ERA 99 is locked for early access. Leave your email for the first
          signal.
        </p>
        <div className="mx-auto mt-9 w-full max-w-3xl sm:mt-11">
          <EarlyAccessCountdown
            deadline={state.earlyAccessDropAt}
            initialRemaining={getInitialRemaining(state.earlyAccessDropAt)}
          />
        </div>
        <div className="mx-auto mt-9 w-full max-w-xl sm:mt-11">
          <EarlyAccessForm />
        </div>
        <p className="mx-auto mt-10 max-w-[24rem] text-center text-[11px] uppercase leading-relaxed tracking-[0.2em] text-[#EDE9E0]/45 sm:max-w-none sm:text-[12px] sm:tracking-[0.25em]">
          Alexandria, Egypt. Not a brand. A position.
        </p>
      </section>
    </main>
  );
}
