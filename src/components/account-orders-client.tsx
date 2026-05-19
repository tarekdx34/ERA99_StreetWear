"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { formatEGP } from "@/lib/utils";
import { OrderTimeline } from "@/components/order-timeline";
import { csrfFetch } from "@/hooks/use-csrf";

type Order = {
  id: number;
  orderNumber: string;
  orderStatus: string;
  paymentStatus: string;
  paymentMethod: string;
  items: any;
  total: number;
  customerName: string;
  phone: string;
  governorate: string;
  city: string;
  address: string;
  building: string | null;
  createdAt: string;
  updatedAt: string;
};

export function AccountOrdersClient() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [claimOrderId, setClaimOrderId] = useState<number | null>(null);
  const [claimToken, setClaimToken] = useState("");
  const [showClaimForm, setShowClaimForm] = useState(false);

  const refreshOrders = async () => {
    const res = await fetch("/api/account/orders", { cache: "no-store" });
    if (res.status === 401) {
      router.push("/auth/login?next=/account/orders");
      return;
    }
    const data = await res.json().catch(() => ({}));
    setOrders(data.orders || []);
    setLoading(false);
  };

  useEffect(() => {
    refreshOrders();
  }, []);

  const reorder = async (orderId: number) => {
    const res = await csrfFetch("/api/account/reorder", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ orderId }),
    });

    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setMessage(data.message || "Unable to reorder these items.");
      return;
    }

    setMessage("Items added to cart.");
  };

  const claimOrder = async () => {
    if (!claimOrderId || !claimToken.trim()) return;

    setMessage("");
    try {
      const res = await csrfFetch("/api/account/claim-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId: claimOrderId, token: claimToken.trim() }),
      });

      const data = await res.json();

      if (!res.ok) {
        setMessage(data.message || "Failed to claim order.");
        return;
      }

      setMessage("Order linked to your account.");
      setShowClaimForm(false);
      setClaimOrderId(null);
      setClaimToken("");
      await refreshOrders();
    } catch {
      setMessage("Unable to claim order right now.");
    }
  };

  if (loading) {
    return <main className="px-6 pb-20 pt-28">Loading orders...</main>;
  }

  const inputBase =
    "h-12 w-full border border-[#EDE9E0]/20 bg-[#080808] px-3 text-sm text-[#EDE9E0] placeholder:text-[#EDE9E0]/40 focus:border-[#EDE9E0] focus:outline-none";

  return (
    <main className="bg-[#080808] px-6 pb-20 pt-28 md:px-10">
      <div className="mx-auto max-w-4xl space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl uppercase tracking-[0.18em]">MY ORDERS</h1>
          <Link
            href="/account"
            className="text-xs uppercase tracking-[0.14em] text-[#EDE9E0]/60 hover:text-[#EDE9E0]"
          >
            BACK TO ACCOUNT
          </Link>
        </div>

        {message ? (
          <div className="border border-[#EDE9E0]/25 bg-[#080808] p-3 text-sm">
            {message}
          </div>
        ) : null}

        {!showClaimForm ? (
          <button
            onClick={() => setShowClaimForm(true)}
            className="w-full border border-[#EDE9E0]/25 px-4 py-3 text-left text-xs uppercase tracking-[0.14em] hover:border-[#EDE9E0]"
          >
            LINK A GUEST ORDER
          </button>
        ) : (
          <section className="border border-[#EDE9E0]/18 bg-[#080808] p-5">
            <h2 className="text-xs uppercase tracking-[0.16em] text-[#EDE9E0]/65">
              LINK A GUEST ORDER
            </h2>
             <p className="mt-2 text-sm text-[#EDE9E0]/60">
               Enter the order ID and claim token from your order confirmation.
             </p>

            <div className="mt-4 space-y-3">
              <input
                className={inputBase}
                placeholder="Order ID (numeric)"
                type="number"
                value={claimOrderId || ""}
                onChange={(e) =>
                  setClaimOrderId(e.target.value ? parseInt(e.target.value, 10) : null)
                }
              />
              <input
                className={inputBase}
                placeholder="Claim token"
                value={claimToken}
                onChange={(e) => setClaimToken(e.target.value)}
              />
              <div className="flex gap-2">
                <button
                  onClick={claimOrder}
                  disabled={!claimOrderId || !claimToken.trim()}
                  className="flex-1 border border-[#EDE9E0] bg-[#EDE9E0] px-4 py-3 text-xs font-medium uppercase tracking-[0.14em] text-[#080808] disabled:opacity-40"
                >
                  LINK ORDER
                </button>
                <button
                  onClick={() => {
                    setShowClaimForm(false);
                    setClaimOrderId(null);
                    setClaimToken("");
                  }}
                  className="border border-[#EDE9E0]/25 px-4 py-3 text-xs uppercase tracking-[0.14em]"
                >
                  CANCEL
                </button>
              </div>
            </div>
          </section>
        )}

        <section className="space-y-4">
          {orders.length === 0 ? (
            <div className="border border-[#EDE9E0]/15 bg-[#080808] p-8 text-center">
              <p className="text-sm text-[#EDE9E0]/60">No orders yet.</p>
              <Link
                href="/shop"
                className="mt-4 inline-block border border-[#EDE9E0]/25 px-6 py-3 text-xs uppercase tracking-[0.14em] hover:border-[#EDE9E0]"
              >
                START SHOPPING
              </Link>
            </div>
          ) : null}

          {orders.map((order) => {
            const items = Array.isArray(order.items) ? order.items : [];
            return (
              <div
                key={order.id}
                className="border border-[#EDE9E0]/15 bg-[#080808] p-5"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-xs uppercase tracking-[0.14em]">
                    #{order.orderNumber}
                  </p>
                  <p className="text-xs text-[#EDE9E0]/65">
                    {new Date(order.createdAt).toLocaleString("en-GB", {
                      timeZone: "Africa/Cairo",
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </p>
                </div>

                <div className="mt-3">
                  <OrderTimeline
                    orderStatus={order.orderStatus}
                    createdAt={order.createdAt}
                    updatedAt={order.updatedAt}
                    paymentMethod={order.paymentMethod}
                  />
                </div>

                <div className="mt-4 border-t border-[#EDE9E0]/10 pt-4">
                  <div className="mb-3 flex items-center gap-2">
                    <span className="border border-[#EDE9E0]/25 px-2 py-1 text-[10px] uppercase tracking-[0.12em]">
                      {order.orderStatus.replace(/_/g, " ")}
                    </span>
                    <span className="text-[11px] text-[#EDE9E0]/65">
                      {order.paymentStatus}
                    </span>
                  </div>

                  <p className="text-sm">
                    {formatEGP(order.total)} — {items.length} items
                  </p>
                  <p className="mt-1 text-[12px] text-[#EDE9E0]/60">
                    {order.city}, {order.governorate}
                  </p>

                  <div className="mt-3 flex flex-wrap gap-2">
                    <Link
                      href={`/track-order?order=${order.orderNumber}`}
                      className="border border-[#EDE9E0]/35 px-3 py-2 text-[11px] uppercase tracking-[0.16em]"
                    >
                      VIEW DETAILS
                    </Link>
                    <button
                      onClick={() => reorder(order.id)}
                      className="border border-[#EDE9E0]/35 px-3 py-2 text-[11px] uppercase tracking-[0.16em]"
                    >
                      REORDER
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </section>
      </div>
    </main>
  );
}
