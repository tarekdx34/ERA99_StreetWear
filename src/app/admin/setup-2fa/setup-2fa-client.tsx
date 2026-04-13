"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useEffect, useState } from "react";

export default function Setup2FAClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const challengeToken = searchParams.get("challenge") || "";

  const [qrDataUrl, setQrDataUrl] = useState("");
  const [manualKey, setManualKey] = useState("");
  const [storageNote, setStorageNote] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [confirming, setConfirming] = useState(false);

  useEffect(() => {
    if (!challengeToken) {
      router.replace("/admin/login");
      return;
    }

    const run = async () => {
      try {
        const res = await fetch("/api/admin/setup-2fa/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ challengeToken }),
        });
        const data = await res.json();

        if (!res.ok) {
          setError(data.message || "Failed to load 2FA setup.");
          return;
        }

        if (data.alreadyConfigured) {
          router.replace("/admin/login");
          return;
        }

        setQrDataUrl(data.qrDataUrl || "");
        setManualKey(data.manualKey || "");
        setStorageNote(data.storageNote || "");
      } catch {
        setError("Unable to initialize 2FA setup.");
      } finally {
        setLoading(false);
      }
    };

    run();
  }, [challengeToken, router]);

  const confirm = async (event: FormEvent) => {
    event.preventDefault();
    setError("");
    setConfirming(true);

    try {
      const res = await fetch("/api/admin/setup-2fa/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ challengeToken, code }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.message || "Invalid code.");
        return;
      }

      router.replace("/admin/login?setup=done");
    } catch {
      setError("Unable to confirm 2FA setup.");
    } finally {
      setConfirming(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#080808] px-6 py-16 text-[#F0EDE8]">
      <div className="mx-auto w-full max-w-lg">
        <p className="text-center font-anton text-6xl leading-none tracking-[16px] text-[#ede9e0]">
          QUTB
        </p>
        <p className="mt-3 text-center text-[12px] font-medium uppercase tracking-[0.3em] text-[#555555]">
          QUTB — ADMIN
        </p>

        <h1 className="mt-10 text-center text-sm uppercase tracking-[0.2em] text-[#F0EDE8]/70">
          First-time 2FA Setup
        </h1>

        {loading ? (
          <p className="mt-6 text-center text-sm text-[#F0EDE8]/60">
            Preparing setup...
          </p>
        ) : (
          <>
            <div className="mt-6 border border-[#F0EDE8]/20 bg-[#111111] p-5">
              <p className="text-xs leading-6 text-[#F0EDE8]/75">
                Scan this QR with Google Authenticator or Authy, then enter the
                current 6-digit code to confirm setup.
              </p>

              {qrDataUrl ? (
                <img
                  src={qrDataUrl}
                  alt="2FA QR"
                  className="mx-auto mt-5 h-[220px] w-[220px] border border-[#F0EDE8]/15 bg-[#0D0D0D] p-2"
                />
              ) : null}

              <p className="mt-5 text-xs uppercase tracking-[0.16em] text-[#F0EDE8]/55">
                Manual key
              </p>
              <p className="mt-2 break-all border border-[#F0EDE8]/15 bg-[#0D0D0D] px-3 py-2 text-xs tracking-[0.12em]">
                {manualKey}
              </p>

              <p className="mt-4 text-[11px] text-[#F0EDE8]/50">
                {storageNote}
              </p>
            </div>

            <form onSubmit={confirm} className="mt-5 space-y-3">
              <input
                value={code}
                onChange={(event) =>
                  setCode(event.target.value.replace(/\D/g, "").slice(0, 6))
                }
                inputMode="numeric"
                pattern="[0-9]*"
                placeholder="Enter 6-digit code"
                className="h-12 w-full border border-[#F0EDE8]/25 bg-[#111111] px-3 text-center text-lg tracking-[0.3em] focus:border-[#F0EDE8] focus:outline-none"
              />
              <button
                type="submit"
                disabled={confirming || code.length !== 6}
                className="h-12 w-full border border-[#F0EDE8] bg-[#F0EDE8] text-xs font-bold uppercase tracking-[0.2em] text-[#080808] disabled:opacity-60"
              >
                {confirming ? "VERIFYING..." : "VERIFY SETUP →"}
              </button>
            </form>
          </>
        )}

        {error ? (
          <p className="mt-4 text-center text-xs text-[#8B0000]">{error}</p>
        ) : null}
      </div>
    </main>
  );
}
