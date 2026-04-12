"use client";

import Link from "next/link";
import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";

type Props = {
  pendingConfirmation: number;
  pendingPayment: number;
  lowStockCount: number;
  failedPayments: number;
  highValuePendingCount: number;
};

export function AdminDashboardLive({
  pendingConfirmation,
  pendingPayment,
  lowStockCount,
  failedPayments,
  highValuePendingCount,
}: Props) {
  const router = useRouter();
  const [seconds, setSeconds] = useState(45);
  const [notice, setNotice] = useState("");
  const [pending, startTransition] = useTransition();

  useEffect(() => {
    const timer = window.setInterval(() => {
      setSeconds((current) => {
        if (current <= 1) {
          router.refresh();
          return 45;
        }
        return current - 1;
      });
    }, 1000);

    return () => window.clearInterval(timer);
  }, [router]);

  const confirmPendingCod = () => {
    startTransition(async () => {
      try {
        const res = await fetch(
          "/api/admin/orders/quick-actions/confirm-pending-cod",
          {
            method: "POST",
          },
        );
        const body = await res.json().catch(() => ({}));
        if (!res.ok) {
          throw new Error(body?.message || "Quick action failed");
        }

        setNotice(`Confirmed ${body.updatedCount || 0} order(s).`);
        router.refresh();
        setSeconds(45);
      } catch (error) {
        setNotice(
          error instanceof Error ? error.message : "Quick action failed",
        );
      }
    });
  };

  return (
    <section className="mt-6 grid gap-4 xl:grid-cols-[1.3fr_1fr]">
      <article className="border border-[#F0EDE8]/12 bg-[#111111] p-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xs uppercase tracking-[0.22em] text-[#F0EDE8]/75">
            Live KPI
          </h2>
          <p className="text-[11px] uppercase tracking-[0.14em] text-[#F0EDE8]/55">
            Refresh in {seconds}s
          </p>
        </div>

        <div className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <div className="border border-[#8B0000]/35 bg-[#8B0000]/10 p-3">
            <p className="text-[11px] uppercase tracking-[0.14em] text-[#F0EDE8]/55">
              Pending Confirmation
            </p>
            <p className="mt-2 text-2xl font-semibold">{pendingConfirmation}</p>
          </div>
          <div className="border border-[#F0EDE8]/12 bg-[#151515] p-3">
            <p className="text-[11px] uppercase tracking-[0.14em] text-[#F0EDE8]/55">
              Pending Payment
            </p>
            <p className="mt-2 text-2xl font-semibold">{pendingPayment}</p>
          </div>
          <div className="border border-[#F0EDE8]/12 bg-[#151515] p-3">
            <p className="text-[11px] uppercase tracking-[0.14em] text-[#F0EDE8]/55">
              Low Stock Products
            </p>
            <p className="mt-2 text-2xl font-semibold">{lowStockCount}</p>
          </div>
          <div className="border border-[#F0EDE8]/12 bg-[#151515] p-3">
            <p className="text-[11px] uppercase tracking-[0.14em] text-[#F0EDE8]/55">
              Failed Payments
            </p>
            <p className="mt-2 text-2xl font-semibold">{failedPayments}</p>
          </div>
        </div>
      </article>

      <article className="border border-[#F0EDE8]/12 bg-[#111111] p-4">
        <h2 className="text-xs uppercase tracking-[0.22em] text-[#F0EDE8]/75">
          Action Center
        </h2>

        <div className="mt-3 space-y-2 text-sm">
          <Link
            href="/admin/orders?status=pending_confirmation"
            className="flex items-center justify-between border-b border-[#F0EDE8]/10 pb-2 hover:text-[#F0EDE8]"
          >
            <span className="text-[#F0EDE8]/75">Pending confirmation</span>
            <span>{pendingConfirmation}</span>
          </Link>
          <Link
            href="/admin/orders?status=payment_failed"
            className="flex items-center justify-between border-b border-[#F0EDE8]/10 pb-2 hover:text-[#F0EDE8]"
          >
            <span className="text-[#F0EDE8]/75">Failed payments</span>
            <span>{failedPayments}</span>
          </Link>
          <Link
            href="/admin/products"
            className="flex items-center justify-between border-b border-[#F0EDE8]/10 pb-2 hover:text-[#F0EDE8]"
          >
            <span className="text-[#F0EDE8]/75">Low stock products</span>
            <span>{lowStockCount}</span>
          </Link>
          <div className="flex items-center justify-between border-b border-[#F0EDE8]/10 pb-2">
            <span className="text-[#F0EDE8]/75">High-value pending orders</span>
            <span>{highValuePendingCount}</span>
          </div>
        </div>

        <button
          type="button"
          disabled={pending}
          onClick={confirmPendingCod}
          className="mt-4 w-full border border-[#F0EDE8]/25 px-3 py-2 text-xs uppercase tracking-[0.16em] hover:border-[#F0EDE8]/45 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {pending ? "Processing..." : "Confirm Pending COD > 15m"}
        </button>

        {notice ? (
          <p className="mt-3 text-xs text-[#F0EDE8]/65">{notice}</p>
        ) : null}
      </article>
    </section>
  );
}
