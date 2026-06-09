"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { OrderTimeline } from "@/components/order-timeline";
import { csrfFetch } from "@/hooks/use-csrf";
import { formatEGP } from "@/lib/utils";

type TrackedOrder = {
  id: number;
  orderNumber: string;
  orderStatus: string;
  paymentStatus: string;
  paymentMethod: string;
  total: number;
  customerName: string;
  phone: string;
  governorate: string;
  city: string;
  address: string;
  building: string | null;
  items: Array<{
    name: string;
    color: string;
    size: string;
    qty: number;
    unitPrice: number;
  }>;
  createdAt: string;
  updatedAt: string;
};

export default function TrackOrderPage() {
  const [orderNumber, setOrderNumber] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [order, setOrder] = useState<TrackedOrder | null>(null);

  const track = async (event: FormEvent) => {
    event.preventDefault();
    setError("");
    setOrder(null);
    setLoading(true);

    try {
      const res = await csrfFetch("/api/orders/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderNumber, phone }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Failed to track order");
        return;
      }

      setOrder(data.order);
    } catch {
      setError("Unable to track order. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const inputBase =
    "h-12 w-full border border-[#1A1714]/20 bg-[#EBE4D8] px-3 text-sm text-[#1A1714] placeholder:text-[#1A1714]/40 focus:border-[#1A1714] focus:outline-none";

  return (
    <main className="bg-[#EBE4D8] px-6 pb-20 pt-28 md:px-10">
      <div className="mx-auto max-w-3xl">
        <h1 className="font-blackletter text-4xl md:text-5xl">
          TRACK YOUR ORDER
        </h1>
        <p className="mt-3 text-sm text-[#1A1714]/60">
          Enter your order number and phone number to check the status of your
          order.
        </p>

        <form onSubmit={track} className="mt-8 space-y-4">
          <div>
            <input
              className={`${inputBase} ${error ? "border-[#8C8278]" : ""}`}
              placeholder="Order number (e.g., QTB-00001)"
              value={orderNumber}
              onChange={(e) => setOrderNumber(e.target.value)}
            />
          </div>
          <div>
            <input
              className={`${inputBase} ${error ? "border-[#8C8278]" : ""}`}
              placeholder="Phone number"
              value={phone}
              onChange={(e) =>
                setPhone(e.target.value.replace(/\D/g, "").slice(0, 11))
              }
            />
          </div>

          {error ? <p className="text-xs text-[#8C8278]">{error}</p> : null}

          <button
            type="submit"
            disabled={loading || !orderNumber || !phone}
            className="w-full border border-[#1A1714] bg-[#1A1714] px-4 py-3 text-xs font-medium uppercase tracking-[0.14em] text-[#EBE4D8] disabled:opacity-40"
          >
            {loading ? (
              <motion.span
                animate={{ opacity: [0.4, 1, 0.4] }}
                transition={{ duration: 1.2, repeat: Infinity }}
              >
                TRACKING...
              </motion.span>
            ) : (
              "TRACK ORDER"
            )}
          </button>
        </form>

        {order ? (
          <motion.section
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="mt-12 space-y-8"
          >
            <div className="border border-[#1A1714]/18 bg-[#EBE4D8] p-5">
              <div className="flex items-center justify-between">
                <p className="text-xs uppercase tracking-[0.16em]">
                  #{order.orderNumber}
                </p>
                <p className="text-xs text-[#1A1714]/60">
                  {new Date(order.createdAt).toLocaleString("en-GB", {
                    timeZone: "Africa/Cairo",
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })}
                </p>
              </div>

              <div className="mt-4">
                <OrderTimeline
                  orderStatus={order.orderStatus}
                  createdAt={order.createdAt}
                  updatedAt={order.updatedAt}
                />
              </div>
            </div>

            <div className="border border-[#1A1714]/18 bg-[#EBE4D8] p-5">
              <h2 className="text-xs uppercase tracking-[0.16em] text-[#1A1714]/65">
                ORDER DETAILS
              </h2>

              <div className="mt-4 space-y-2 text-sm">
                {order.items.map((item, index) => (
                  <p key={index}>
                    {item.name} — {item.color} — {item.size} — x{item.qty} —{" "}
                    {formatEGP(item.unitPrice * item.qty)}
                  </p>
                ))}
              </div>

              <div className="mt-4 border-t border-[#1A1714]/12 pt-4 space-y-1 text-sm">
                <p className="text-[#1A1714]/70">
                  {order.address}
                  {order.building ? `, ${order.building}` : ""}
                </p>
                <p className="text-[#1A1714]/70">
                  {order.city}, {order.governorate}
                </p>
                <p className="mt-3 text-lg font-medium text-[#1A1714]">
                  TOTAL: {formatEGP(order.total)}
                </p>
                <p className="text-xs uppercase tracking-[0.14em] text-[#1A1714]/60">
                  PAYMENT: CASH ON DELIVERY
                </p>
              </div>
            </div>

            <div className="text-center">
              <Link
                href="/shop"
                className="inline-block border border-[#1A1714]/25 px-6 py-3 text-xs uppercase tracking-[0.14em] hover:border-[#1A1714]"
              >
                CONTINUE SHOPPING
              </Link>
            </div>
          </motion.section>
        ) : null}

        {!order && !loading ? (
          <div className="mt-12 text-center">
            <p className="text-xs text-[#1A1714]/50">
              Track future orders automatically with an account.{" "}
              <Link
                href="/auth/register?next=/track-order"
                className="text-[#1A1714] underline"
              >
                CREATE AN ACCOUNT
              </Link>{" "}
              or{" "}
              <Link
                href="/auth/login?next=/track-order"
                className="text-[#1A1714] underline"
              >
                LOGIN
              </Link>
            </p>
          </div>
        ) : null}
      </div>
    </main>
  );
}
