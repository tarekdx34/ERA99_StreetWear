"use client";

import Link from "next/link";

export default function AdminPanelError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="min-h-[60vh] bg-[#080808] px-6 py-16 text-[#F0EDE8]">
      <div className="mx-auto max-w-2xl border border-[#F0EDE8]/15 bg-[#111111] p-6">
        <p className="text-[11px] uppercase tracking-[0.2em] text-[#F0EDE8]/55">
          Admin Panel
        </p>
        <h1 className="mt-3 text-xl uppercase tracking-[0.14em]">
          Temporary dashboard error
        </h1>
        <p className="mt-3 text-sm text-[#F0EDE8]/70">
          The page failed to load one of the server queries. You can retry, or
          continue to products/orders while we stabilize dashboard data.
        </p>

        {error?.digest ? (
          <p className="mt-3 text-xs text-[#F0EDE8]/45">Digest: {error.digest}</p>
        ) : null}

        <div className="mt-6 flex flex-wrap gap-2">
          <button
            type="button"
            onClick={reset}
            className="border border-[#F0EDE8]/30 px-3 py-2 text-xs uppercase tracking-[0.14em]"
          >
            Retry
          </button>
          <Link
            href="/admin/products"
            className="border border-[#F0EDE8]/30 px-3 py-2 text-xs uppercase tracking-[0.14em]"
          >
            Open Products
          </Link>
          <Link
            href="/admin/orders"
            className="border border-[#F0EDE8]/30 px-3 py-2 text-xs uppercase tracking-[0.14em]"
          >
            Open Orders
          </Link>
        </div>
      </div>
    </main>
  );
}
