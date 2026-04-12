"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

type Props = {
  orderId: number;
  currentStatus: string;
};

const ORDER_STATUSES = [
  "pending_confirmation",
  "pending_payment",
  "paid",
  "preparing",
  "shipped",
  "delivered",
  "payment_failed",
  "cancelled",
] as const;

export function OrderStatusControl({ orderId, currentStatus }: Props) {
  const router = useRouter();
  const [status, setStatus] = useState(currentStatus);
  const [savedStatus, setSavedStatus] = useState(currentStatus);
  const [notice, setNotice] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  return (
    <div className="flex items-center gap-2">
      <select
        value={status}
        onChange={(event) => {
          setStatus(event.target.value);
          setNotice(null);
        }}
        className="w-[180px] border border-[#F0EDE8]/20 bg-[#111111] px-2 py-1 text-xs uppercase tracking-[0.08em]"
      >
        {ORDER_STATUSES.map((item) => (
          <option key={item} value={item}>
            {item.replaceAll("_", " ")}
          </option>
        ))}
      </select>

      <button
        type="button"
        disabled={pending || status === savedStatus}
        onClick={() => {
          startTransition(async () => {
            try {
              const res = await fetch(`/api/admin/orders/${orderId}/status`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ orderStatus: status }),
              });

              if (!res.ok) {
                const body = await res.json().catch(() => ({}));
                throw new Error(body?.message || "Failed to update status");
              }

              setSavedStatus(status);
              setNotice("Saved");
              router.refresh();
            } catch (error) {
              setNotice(error instanceof Error ? error.message : "Failed to update");
            }
          });
        }}
        className="border border-[#F0EDE8]/25 px-2 py-1 text-[11px] uppercase tracking-[0.16em] transition-colors duration-200 hover:border-[#F0EDE8]/45 disabled:cursor-not-allowed disabled:opacity-40"
      >
        {pending ? "Saving..." : "Save"}
      </button>

      {notice ? <span className="text-[11px] text-[#F0EDE8]/60">{notice}</span> : null}
    </div>
  );
}
