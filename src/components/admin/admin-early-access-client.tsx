"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";

type Subscriber = {
  id: number;
  email: string;
  signed_up_at: string;
  source: string;
  converted: boolean;
};

export function AdminEarlyAccessClient() {
  const router = useRouter();
  const [earlyAccessActive, setEarlyAccessActive] = useState(false);
  const [dropModeActive, setDropModeActive] = useState(false);
  const [countdownEnabled, setCountdownEnabled] = useState(false);
  const [dropAtInput, setDropAtInput] = useState("");
  const [subscribers, setSubscribers] = useState<Subscriber[]>([]);
  const [search, setSearch] = useState("");
  const [notice, setNotice] = useState("");

  const load = async () => {
    const res = await fetch("/api/admin/early-access", { cache: "no-store" });
    if (res.status === 401 || res.status === 403) {
      router.push("/admin/login?next=/admin/early-access");
      return;
    }
    const data = await res.json();
    setEarlyAccessActive(Boolean(data.earlyAccessActive));
    setDropModeActive(Boolean(data.dropModeActive));
    setCountdownEnabled(Boolean(data.countdownEnabled));
    setDropAtInput(toDateTimeLocalValue(data.earlyAccessDropAt));
    setSubscribers(data.subscribers || []);
  };

  useEffect(() => {
    void load();
  }, []);

  const updateFlags = async (patch: {
    earlyAccessActive?: boolean;
    dropModeActive?: boolean;
  }) => {
    setNotice("");
    const res = await fetch("/api/admin/early-access", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    });
    if (!res.ok) {
      setNotice("Unable to update early access settings.");
      return;
    }
    const data = await res.json();
    setEarlyAccessActive(Boolean(data.earlyAccessActive));
    setDropModeActive(Boolean(data.dropModeActive));
    setCountdownEnabled(Boolean(data.countdownEnabled));
    setDropAtInput(toDateTimeLocalValue(data.earlyAccessDropAt));
    setNotice("Saved.");
  };

  const updateCountdown = async () => {
    setNotice("");
    const earlyAccessDropAt =
      countdownEnabled && dropAtInput
        ? new Date(dropAtInput).toISOString()
        : null;

    if (countdownEnabled && !dropAtInput) {
      setNotice("Select a drop date and time first.");
      return;
    }

    const res = await fetch("/api/admin/early-access", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ earlyAccessDropAt }),
    });
    if (!res.ok) {
      setNotice("Unable to update countdown.");
      return;
    }
    const data = await res.json();
    setEarlyAccessActive(Boolean(data.earlyAccessActive));
    setDropModeActive(Boolean(data.dropModeActive));
    setCountdownEnabled(Boolean(data.countdownEnabled));
    setDropAtInput(toDateTimeLocalValue(data.earlyAccessDropAt));
    setNotice("Saved.");
  };

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return subscribers;
    return subscribers.filter((item) => item.email.toLowerCase().includes(query));
  }, [search, subscribers]);

  const exportCsv = async () => {
    const res = await fetch("/api/admin/early-access?format=csv", {
      cache: "no-store",
    });
    if (!res.ok) return;
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const date = new Date().toISOString().slice(0, 10);
    const a = document.createElement("a");
    a.href = url;
    a.download = `qutb-early-access-${date}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <section>
      <p className="text-[12px] uppercase tracking-[0.28em] text-[#EDE9E0]/55">
        DROP CONTROL
      </p>
      <h1 className="mt-2 font-blackletter text-4xl md:text-5xl">
        Early Access
      </h1>
      <p className="mt-3 max-w-2xl text-sm text-[#EDE9E0]/70">
        Control whether customers see the early access capture page as the only
        public page, and export signup emails before the next drop.
      </p>

      {notice ? (
        <p className="mt-4 border border-[#EDE9E0]/15 bg-[#080808] p-3 text-xs uppercase tracking-[0.14em] text-[#EDE9E0]/70">
          {notice}
        </p>
      ) : null}

      <section className="mt-6 grid gap-4 md:grid-cols-2">
        <FlagPanel
          label="EARLY ACCESS PAGE"
          active={earlyAccessActive}
          onToggle={() => updateFlags({ earlyAccessActive: !earlyAccessActive })}
          liveCopy="Customers are redirected to /early-access until this is turned off."
          hiddenCopy="/early-access redirects to the homepage."
        />
        <FlagPanel
          label="DROP MODE"
          active={dropModeActive}
          onToggle={() => updateFlags({ dropModeActive: !dropModeActive })}
          liveCopy="The announcement bar says ERA 99 is live."
          hiddenCopy="The announcement bar uses the default rotating message."
        />
      </section>

      <section className="mt-4 border border-[#EDE9E0]/15 bg-[#080808] p-4">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setCountdownEnabled((value) => !value)}
                className="grid h-5 w-5 place-items-center border border-[#EDE9E0]/45"
                aria-pressed={countdownEnabled}
                aria-label="Toggle countdown"
              >
                <span
                  className={`h-3 w-3 ${
                    countdownEnabled ? "bg-[#EDE9E0]" : "bg-transparent"
                  }`}
                />
              </button>
              <h2 className="text-xs uppercase tracking-[0.22em]">
                Countdown to drop
              </h2>
            </div>
            <p className="mt-3 max-w-2xl text-sm text-[#555555]">
              Optional. When the timer reaches zero, early access turns off and
              drop mode turns on automatically.
            </p>
          </div>
          <div className="grid gap-2 sm:grid-cols-[minmax(0,280px)_auto]">
            <input
              type="datetime-local"
              value={dropAtInput}
              onChange={(event) => setDropAtInput(event.target.value)}
              disabled={!countdownEnabled}
              className="h-10 border border-[#EDE9E0]/25 bg-[#080808] px-3 text-sm text-[#EDE9E0] disabled:text-[#555555]"
            />
            <button
              onClick={updateCountdown}
              className="h-10 border border-[#EDE9E0] px-3 text-xs uppercase tracking-[0.16em]"
            >
              SAVE COUNTDOWN
            </button>
          </div>
        </div>
      </section>

      <section className="mt-8 border border-[#EDE9E0]/15 bg-[#080808] p-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="font-anton text-4xl uppercase leading-none tracking-[12px] md:text-5xl md:tracking-[16px]">
              {subscribers.length} SUBSCRIBERS
            </p>
            <p className="mt-2 text-xs uppercase tracking-[0.18em] text-[#555555]">
              Newest first
            </p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search email"
              className="h-10 border border-[#EDE9E0]/25 bg-[#080808] px-3 text-sm text-[#EDE9E0] placeholder:text-[#555555]"
            />
            <button
              onClick={exportCsv}
              className="h-10 border border-[#EDE9E0] px-3 text-xs uppercase tracking-[0.16em]"
            >
              EXPORT CSV
            </button>
          </div>
        </div>
        <div className="mt-5 overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="text-xs uppercase tracking-[0.16em] text-[#555555]">
              <tr>
                <th className="border-b border-[#EDE9E0]/15 py-3 pr-3">Email</th>
                <th className="border-b border-[#EDE9E0]/15 py-3 pr-3">
                  Signed Up
                </th>
                <th className="border-b border-[#EDE9E0]/15 py-3 pr-3">
                  Source
                </th>
                <th className="border-b border-[#EDE9E0]/15 py-3">
                  Converted
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.slice(0, 50).map((item) => (
                <tr key={item.id} className="border-b border-[#EDE9E0]/10">
                  <td className="py-3 pr-3">{item.email}</td>
                  <td className="py-3 pr-3 text-[#555555]">
                    {new Date(item.signed_up_at).toLocaleString("en-GB")}
                  </td>
                  <td className="py-3 pr-3">{item.source}</td>
                  <td className="py-3">{item.converted ? "YES" : "NO"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </section>
  );
}

function toDateTimeLocalValue(value: string | null | undefined) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const pad = (part: number) => String(part).padStart(2, "0");
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(
    date.getDate(),
  )}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function FlagPanel({
  label,
  active,
  onToggle,
  liveCopy,
  hiddenCopy,
}: {
  label: string;
  active: boolean;
  onToggle: () => void;
  liveCopy: string;
  hiddenCopy: string;
}) {
  return (
    <section className="border border-[#EDE9E0]/15 bg-[#080808] p-4">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-xs uppercase tracking-[0.22em]">{label}</h2>
        <span
          className={`border px-2 py-1 text-[11px] uppercase tracking-[0.14em] ${
            active
              ? "border-[#EDE9E0] text-[#EDE9E0]"
              : "border-[#555555] text-[#555555]"
          }`}
        >
          {active ? "LIVE" : "HIDDEN"}
        </span>
      </div>
      <button
        onClick={onToggle}
        className="mt-5 grid h-9 w-20 grid-cols-2 border border-[#EDE9E0]/35 p-1"
        aria-label={`Toggle ${label}`}
      >
        <span className={active ? "bg-[#EDE9E0]" : ""} />
        <span className={!active ? "bg-[#555555]" : ""} />
      </button>
      <p className="mt-4 text-sm text-[#555555]">
        {active ? liveCopy : hiddenCopy}
      </p>
    </section>
  );
}
