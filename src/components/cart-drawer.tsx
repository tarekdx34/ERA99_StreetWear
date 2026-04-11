"use client";

import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { makeItemKey, useCart } from "@/contexts/cart-context";
import { formatEGP } from "@/lib/utils";
import { CloseIcon, MinusIcon, PlusIcon } from "@/components/icons";

export function CartDrawer() {
  const { open, closeCart, items, subtotal, removeItem, updateQty } = useCart();

  return (
    <AnimatePresence>
      {open ? (
        <>
          <motion.button
            aria-label="Close cart"
            className="fixed inset-0 z-[70] bg-black/60"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            onClick={closeCart}
          />
          <motion.aside
            initial={{ x: 440 }}
            animate={{ x: 0 }}
            exit={{ x: 440 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="fixed right-0 top-0 z-[80] flex h-screen w-full max-w-[420px] flex-col border-l border-[#F0EDE8]/15 bg-[#0D0D0D] p-6"
          >
            <div className="mb-6 flex items-center justify-between border-b border-[#F0EDE8]/15 pb-4">
              <h2 className="font-blackletter text-3xl">YOUR CART</h2>
              <button onClick={closeCart} className="border border-[#F0EDE8]/25 p-2 hover:border-[#F0EDE8]">
                <CloseIcon />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto">
              {items.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center gap-4 text-center">
                  <p className="text-sm text-[#F0EDE8]/75">Your cart is empty</p>
                  <Link href="/" onClick={closeCart} className="text-xs uppercase tracking-[0.16em] hover:underline">
                    SHOP THE DROP →
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {items.map((item) => {
                    const key = makeItemKey(item);
                    return (
                      <article key={key} className="border border-[#F0EDE8]/12 p-3">
                        <div className="grid grid-cols-[60px_1fr_auto] gap-3">
                          <img src={item.image} alt={item.name} className="h-[60px] w-[60px] object-cover" />
                          <div>
                            <p className="text-xs uppercase tracking-[0.1em]">{item.name}</p>
                            <p className="mt-1 text-[11px] text-[#F0EDE8]/65">{item.color} / {item.size}</p>
                            <div className="mt-2 inline-flex items-center border border-[#F0EDE8]/25">
                              <button className="h-7 w-7 border-r border-[#F0EDE8]/25" onClick={() => updateQty(key, item.qty - 1)}>
                                <MinusIcon />
                              </button>
                              <span className="w-8 text-center text-xs">{item.qty}</span>
                              <button className="h-7 w-7 border-l border-[#F0EDE8]/25" onClick={() => updateQty(key, item.qty + 1)}>
                                <PlusIcon />
                              </button>
                            </div>
                          </div>
                          <div className="flex flex-col items-end justify-between">
                            <button onClick={() => removeItem(key)} className="text-[#F0EDE8]/55 hover:text-[#F0EDE8]">×</button>
                            <p className="text-xs">{formatEGP(item.unitPrice * item.qty)}</p>
                          </div>
                        </div>
                      </article>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="mt-4 border-t border-[#F0EDE8]/15 pt-4">
              <div className="mb-2 flex items-center justify-between text-sm uppercase tracking-[0.12em]">
                <span>SUBTOTAL</span>
                <span>{formatEGP(subtotal)}</span>
              </div>
              <p className="mb-4 text-xs text-[#F0EDE8]/55">Free delivery within Alexandria</p>
              <Link
                href="/checkout"
                onClick={closeCart}
                className="mb-3 block w-full bg-[#F0EDE8] px-4 py-3 text-center text-xs font-bold uppercase tracking-[0.14em] text-black"
              >
                CHECKOUT →
              </Link>
              <button
                onClick={closeCart}
                className="w-full border border-[#F0EDE8]/35 px-4 py-3 text-xs uppercase tracking-[0.14em]"
              >
                CONTINUE SHOPPING
              </button>
            </div>
          </motion.aside>
        </>
      ) : null}
    </AnimatePresence>
  );
}
