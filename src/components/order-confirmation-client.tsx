"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { formatEGP } from "@/lib/utils";

type OrderItem = {
  name: string;
  color: string;
  size: string;
  qty: number;
  unitPrice: number;
};

type Props = {
  orderId: number;
  orderNumber: string;
  paymentStatus: string;
  paymentMethod: string;
  total: number;
  address: string;
  city: string;
  governorate: string;
  items: OrderItem[];
};

export function OrderConfirmationClient(props: Props) {
  const paid =
    props.paymentStatus === "paid" || props.paymentMethod === "ONLINE";

  return (
    <main className="min-h-screen bg-[#080808] px-6 pb-16 pt-28 md:px-10">
      <div className="mx-auto max-w-3xl text-center">
        <motion.svg
          viewBox="0 0 80 80"
          className="mx-auto h-20 w-20"
          initial={{ scale: 0.7, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        >
          <circle
            cx="40"
            cy="40"
            r="38"
            stroke="#F0EDE8"
            strokeWidth="2"
            fill="none"
          />
          <motion.path
            d="M22 41l12 12 24-26"
            stroke="#F0EDE8"
            strokeWidth="4"
            fill="none"
            strokeLinecap="square"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.9, ease: "easeOut", delay: 0.2 }}
          />
        </motion.svg>

        <h1 className="mt-6 font-blackletter text-5xl md:text-[64px]">
          ORDER RECEIVED
        </h1>
        <p className="mt-2 text-xl text-[#F0EDE8]/50">قطب</p>
        <p className="mt-4 text-sm uppercase tracking-[0.2em]">
          #{props.orderNumber}
        </p>

        <section className="mt-8 border border-[#F0EDE8]/18 bg-[#111111] p-5 text-left">
          <h2 className="text-xs uppercase tracking-[0.16em] text-[#F0EDE8]/65">
            Order Summary
          </h2>
          <div className="mt-4 space-y-2 text-sm">
            {props.items.map((item, index) => (
              <p key={`${item.name}-${index}`}>
                {item.name} — {item.color} — {item.size} — x{item.qty} —{" "}
                {formatEGP(item.unitPrice * item.qty)}
              </p>
            ))}
          </div>
          <div className="mt-4 border-t border-[#F0EDE8]/15 pt-4 text-sm text-[#F0EDE8]/75">
            <p>
              {props.address}, {props.city}, {props.governorate}
            </p>
            <p className="mt-1 text-lg font-bold text-[#F0EDE8]">
              Total: {formatEGP(props.total)}
            </p>
          </div>
        </section>

        <p className="mt-6 text-sm text-[#F0EDE8]/75">
          {paid
            ? "Payment confirmed. Your order is being prepared and will ship within 1-2 business days."
            : "Our team will call you within 24 hours to confirm your order before shipping."}
        </p>

        <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <button
            disabled
            className="border border-[#F0EDE8]/25 px-4 py-3 text-xs uppercase tracking-[0.14em] opacity-50"
          >
            TRACK ORDER (COMING SOON)
          </button>
          <Link
            href="/"
            className="bg-[#F0EDE8] px-4 py-3 text-center text-xs font-bold uppercase tracking-[0.14em] text-black"
          >
            CONTINUE SHOPPING →
          </Link>
        </div>

        <a
          href="https://wa.me/201000000000"
          target="_blank"
          rel="noreferrer"
          className="mt-8 inline-block text-sm hover:underline"
        >
          Questions? WhatsApp us directly →
        </a>
      </div>
    </main>
  );
}
