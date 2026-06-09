"use client";

import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { makeItemKey, useCart } from "@/contexts/cart-context";
import { formatEGP } from "@/lib/utils";
import { MinusIcon, PlusIcon } from "@/components/icons";

export function CartDrawer() {
  const { open, closeCart, items, subtotal, removeItem, updateQty } = useCart();

  return (
    <AnimatePresence>
      {open ? (
        <>
          <motion.button
            aria-label="Close cart"
            className="fixed inset-0 z-[70] bg-[#111111]/35 backdrop-blur-[2px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            onClick={closeCart}
          />
          <motion.aside
            initial={{ x: 440 }}
            animate={{ x: 0 }}
            exit={{ x: 440 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className="fixed right-0 top-0 z-[80] flex h-screen w-full max-w-[430px] flex-col border-l border-[#111111]/10 bg-[#FAF8F4] text-[#111111] shadow-[0_20px_90px_rgba(17,17,17,0.18)]"
            role="dialog"
            aria-modal="true"
            aria-label="Shopping cart"
          >
            <div className="flex items-start justify-between border-b border-[#111111]/10 px-6 py-6">
              <div>
                <p className="qutb-eyebrow text-[#7C7C75]">Your Bag</p>
                <h2 className="mt-2 font-brand-serif text-3xl font-medium">
                  The Uniform
                </h2>
              </div>
              <button
                onClick={closeCart}
                className="grid h-9 w-9 place-items-center text-[#7C7C75] transition-colors hover:text-[#111111]"
                aria-label="Close cart"
              >
                <X size={18} strokeWidth={1.5} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-5">
              {items.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center gap-5 text-center">
                  <p className="font-brand-serif text-3xl text-[#111111]">
                    Your bag is empty.
                  </p>
                  <p className="max-w-[260px] text-sm font-light leading-[1.7] text-[#7C7C75]">
                    Cotton essentials are waiting in The Uniform.
                  </p>
                  <Link
                    href="/shop"
                    onClick={closeCart}
                    className="qutb-link-underline text-[12px] uppercase tracking-[0.16em] text-[#111111]"
                  >
                    Shop The Uniform
                  </Link>
                </div>
              ) : (
                <div className="space-y-5">
                  {items.map((item) => {
                    const key = makeItemKey(item);
                    return (
                      <article key={key} className="border-b border-[#111111]/10 pb-5">
                        <div className="grid grid-cols-[76px_1fr_auto] gap-4">
                          <img
                            src={item.image}
                            alt={item.name}
                            width={76}
                            height={96}
                            loading="lazy"
                            className="h-24 w-[76px] bg-[#EDE8DF] object-cover"
                          />
                          <div className="min-w-0">
                            <p className="font-brand-serif text-[18px] leading-tight">
                              {item.name}
                            </p>
                            <p className="mt-1 text-sm font-light text-[#7C7C75]">
                              {item.color} / {item.size}
                            </p>
                            <div className="mt-4 inline-flex h-8 items-center border border-[#111111]/15">
                              <button
                                className="grid h-8 w-8 place-items-center border-r border-[#111111]/15 text-[#7C7C75] hover:text-[#111111]"
                                onClick={() => updateQty(key, item.qty - 1)}
                                aria-label={`Decrease quantity for ${item.name}`}
                              >
                                <MinusIcon />
                              </button>
                              <span className="w-9 text-center text-xs">
                                {item.qty}
                              </span>
                              <button
                                className="grid h-8 w-8 place-items-center border-l border-[#111111]/15 text-[#7C7C75] hover:text-[#111111]"
                                onClick={() => updateQty(key, item.qty + 1)}
                                aria-label={`Increase quantity for ${item.name}`}
                              >
                                <PlusIcon />
                              </button>
                            </div>
                          </div>
                          <div className="flex flex-col items-end justify-between gap-4">
                            <button
                              onClick={() => removeItem(key)}
                              className="text-[11px] uppercase tracking-[0.14em] text-[#7C7C75] hover:text-[#111111]"
                            >
                              Remove
                            </button>
                            <p className="whitespace-nowrap text-sm">
                              {formatEGP(item.unitPrice * item.qty)}
                            </p>
                          </div>
                        </div>
                      </article>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="border-t border-[#111111]/10 bg-[#F5F0E8] px-6 py-5">
              <div className="mb-2 flex items-center justify-between text-sm uppercase tracking-[0.12em]">
                <span>Subtotal</span>
                <span>{formatEGP(subtotal)}</span>
              </div>
              <p className="mb-5 text-sm font-light text-[#7C7C75]">
                Delivery and payment are calculated at checkout.
              </p>
              <Link
                href="/checkout"
                onClick={closeCart}
                className="mb-3 block h-12 w-full bg-[#111111] px-4 py-4 text-center text-[12px] uppercase tracking-[0.16em] text-[#FAF8F4] transition-opacity hover:opacity-80"
              >
                Checkout
              </Link>
              <button
                onClick={closeCart}
                className="h-12 w-full border border-[#111111]/25 px-4 text-[12px] uppercase tracking-[0.16em] text-[#111111] transition-colors hover:border-[#111111]"
              >
                Continue Shopping
              </button>
            </div>
          </motion.aside>
        </>
      ) : null}
    </AnimatePresence>
  );
}
