"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { getAllowedOrderStatuses } from "@/lib/order-status";

type Props = {
  orderId: number;
  currentStatus: string;
  paymentMethod: string;
};

export function OrderStatusControl({
  orderId,
  currentStatus,
  paymentMethod,
}: Props) {
  const router = useRouter();
  const [status, setStatus] = useState(currentStatus);
  const [savedStatus, setSavedStatus] = useState(currentStatus);
  const [notice, setNotice] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const statuses = getAllowedOrderStatuses(paymentMethod);

  return (
    <div className="flex items-center gap-2">
      <select
        value={status}
        onChange={(event) => {
          setStatus(event.target.value);
          setNotice(null);
        }}
        className="w-[180px] border border-[#EDE9E0]/20 bg-[#080808] px-2 py-1 text-xs uppercase tracking-[0.08em]"
      >
        {statuses.map((item) => (
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
              setNotice(
                error instanceof Error ? error.message : "Failed to update",
              );
            }
          });
        }}
        className="border border-[#EDE9E0]/25 px-2 py-1 text-[11px] uppercase tracking-[0.16em] transition-colors duration-200 hover:border-[#EDE9E0]/45 disabled:cursor-not-allowed disabled:opacity-40"
      >
        {pending ? "Saving..." : "Save"}
      </button>

      {notice ? (
        <span className="text-[11px] text-[#EDE9E0]/60">{notice}</span>
      ) : null}
    </div>
  );
}
