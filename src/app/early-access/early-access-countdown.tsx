"use client";

import { useEffect, useMemo, useState } from "react";

export type CountdownParts = {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
};

function getRemaining(deadline: string | null, now = Date.now()): CountdownParts | null {
  if (!deadline) return null;
  const target = new Date(deadline).getTime();
  if (Number.isNaN(target)) return null;

  const diff = Math.max(0, target - now);
  return {
    days: Math.floor(diff / 86_400_000),
    hours: Math.floor((diff % 86_400_000) / 3_600_000),
    minutes: Math.floor((diff % 3_600_000) / 60_000),
    seconds: Math.floor((diff % 60_000) / 1000),
  };
}

function formatPart(value: number) {
  return String(value).padStart(2, "0");
}

export function EarlyAccessCountdown({
  deadline,
  initialRemaining,
}: {
  deadline: string | null;
  initialRemaining: CountdownParts | null;
}) {
  const [remaining, setRemaining] = useState(initialRemaining);
  const hasDeadline = Boolean(deadline);
  const totalRemaining = useMemo(() => {
    if (!remaining) return null;
    return (
      remaining.days +
      remaining.hours +
      remaining.minutes +
      remaining.seconds
    );
  }, [remaining]);

  useEffect(() => {
    if (!deadline) return;

    const timer = window.setInterval(() => {
      const next = getRemaining(deadline);
      setRemaining(next);
      if (next && next.days + next.hours + next.minutes + next.seconds === 0) {
        window.clearInterval(timer);
        window.setTimeout(() => {
          window.location.href = "/";
        }, 900);
      }
    }, 1000);

    return () => window.clearInterval(timer);
  }, [deadline]);

  if (!hasDeadline || !remaining) {
    return (
      <p className="text-[12px] uppercase leading-relaxed tracking-[0.24em] text-[#EDE9E0]/75 sm:text-[13px] sm:tracking-[0.3em]">
        Drop time is private. Leave your email for the first signal.
      </p>
    );
  }

  return (
    <div aria-live="polite">
      <div className="grid grid-cols-4 gap-2 sm:gap-4">
        {[
          ["DAYS", remaining.days],
          ["HOURS", remaining.hours],
          ["MIN", remaining.minutes],
          ["SEC", remaining.seconds],
        ].map(([label, value]) => (
          <div key={label} className="border-y border-[#EDE9E0]/20 py-3">
            <p className="font-anton text-[clamp(32px,12vw,82px)] leading-none tracking-[0.06em] text-[#EDE9E0] sm:tracking-[0.12em]">
              {formatPart(Number(value))}
            </p>
            <p className="mt-2 text-[9px] uppercase tracking-[0.24em] text-[#EDE9E0]/55 sm:text-[10px]">
              {label}
            </p>
          </div>
        ))}
      </div>
      {totalRemaining === 0 ? (
        <p className="mt-5 text-xs uppercase tracking-[0.28em] text-[#EDE9E0]/70">
          Opening the axis.
        </p>
      ) : null}
    </div>
  );
}
