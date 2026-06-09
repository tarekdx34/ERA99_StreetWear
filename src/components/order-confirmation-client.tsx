"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { useEffect } from "react";
import { useAnalytics } from "@/hooks/useAnalytics";
import { useMetaPixel } from "@/hooks/useMetaPixel";
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
  claimToken?: string;
  orderNumber: string;
  paymentStatus: string;
  paymentMethod: string;
  total: number;
  address: string;
  city: string;
  governorate: string;
  isLoggedIn: boolean;
  items: OrderItem[];
};

export function OrderConfirmationClient(props: Props) {
  const { trackEvent } = useAnalytics();
  const { track } = useMetaPixel();
  const encodedClaimToken = props.claimToken
    ? encodeURIComponent(props.claimToken)
    : "";
  const supportWhatsapp = process.env.NEXT_PUBLIC_SUPPORT_WHATSAPP;

  useEffect(() => {
    const eventItems = props.items.map((item) => ({
      item_name: item.name,
      size: item.size,
      quantity: item.qty,
      price: item.unitPrice,
    }));

    trackEvent("purchase", {
      transaction_id: props.orderNumber,
      value: props.total,
      currency: "EGP",
      items: eventItems,
    });

    track("Purchase", {
      value: props.total,
      currency: "EGP",
      order_id: props.orderNumber,
    });
  }, [props.items, props.orderNumber, props.total, track, trackEvent]);

  const paid = props.paymentStatus === "paid";

  return (
    <main className="min-h-screen bg-[#EBE4D8] px-6 pb-16 pt-28 md:px-10">
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
            stroke="#1A1714"
            strokeWidth="2"
            fill="none"
          />
          <motion.path
            d="M22 41l12 12 24-26"
            stroke="#1A1714"
            strokeWidth="4"
            fill="none"
            strokeLinecap="square"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.9, ease: "easeOut", delay: 0.2 }}
          />
        </motion.svg>

        <h1 className="mt-6 font-blackletter display-hero text-5xl md:text-[64px]">
          ORDER RECEIVED
        </h1>
        <p className="mt-2 text-xl text-[#1A1714]/50"></p>
        <p className="mt-4 text-sm uppercase tracking-[0.2em]">
          #{props.orderNumber}
        </p>

        <section className="mt-8 border border-[#1A1714]/18 bg-[#EBE4D8] p-5 text-left">
          <h2 className="text-xs uppercase tracking-[0.16em] text-[#1A1714]/65">
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
          <div className="mt-4 border-t border-[#1A1714]/12 pt-4 text-sm text-[#1A1714]/75">
            <p>
              {props.address}, {props.city}, {props.governorate}
            </p>
            <p className="mt-1 text-[11px] uppercase tracking-[0.14em] text-[#1A1714]/55">
              Payment: Cash on Delivery
            </p>
            <p className="mt-1 text-lg font-medium text-[#1A1714]">
              Total: {formatEGP(props.total)}
            </p>
          </div>
        </section>

        <p className="mt-6 text-sm text-[#1A1714]/75">
          {paid
            ? "Payment confirmed. Your order is being prepared and will ship within 1-2 business days."
            : "Our team will call you within 24 hours to confirm your order before shipping."}
        </p>

        {!props.isLoggedIn ? (
          <section className="mt-8 border border-[#1A1714]/18 bg-[#EBE4D8] p-6 text-left">
            <h2 className="text-xs uppercase tracking-[0.16em] text-[#1A1714]/65">
              TRACK YOUR ORDER
            </h2>
            <p className="mt-2 text-sm text-[#1A1714]/60">
              Create an account to track this order, view your order history,
              and get faster checkout on future orders.
            </p>

            <div className="mt-4 flex flex-col gap-2 sm:flex-row">
              <a
                href={`/auth/register?next=/account&claimOrder=${props.orderId}&claimOrderToken=${encodedClaimToken}`}
                className="flex-1 border border-[#1A1714] bg-[#1A1714] px-4 py-3 text-center text-xs font-medium uppercase tracking-[0.14em] text-[#EBE4D8]"
              >
                CREATE ACCOUNT
              </a>
              <a
                href={`/auth/login?next=/account&claimOrder=${props.orderId}&claimOrderToken=${encodedClaimToken}`}
                className="flex-1 border border-[#1A1714]/25 px-4 py-3 text-center text-xs uppercase tracking-[0.14em] hover:border-[#1A1714]"
              >
                LOGIN
              </a>
            </div>

            <p className="mt-3 text-xs text-[#1A1714]/45">
              Or track as guest:{" "}
              <a href="/track-order" className="text-[#1A1714] underline">
                Track Order
              </a>
            </p>
          </section>
        ) : null}

        <div className="mt-6">
          <Link
            href="/shop"
            className="inline-block border border-[#1A1714]/25 px-6 py-3 text-xs uppercase tracking-[0.14em] hover:border-[#1A1714]"
          >
            CONTINUE SHOPPING
          </Link>
        </div>

        {supportWhatsapp ? (
          <a
            href={`https://wa.me/${supportWhatsapp}`}
            target="_blank"
            rel="noreferrer"
            className="mt-8 inline-block text-sm hover:underline"
          >
            WhatsApp support
          </a>
        ) : null}
      </div>
    </main>
  );
}
