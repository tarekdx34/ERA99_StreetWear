"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { usePathname } from "next/navigation";
import { useCart } from "@/contexts/cart-context";
import { CartIcon, SearchIcon } from "@/components/icons";
import { CartDrawer } from "@/components/cart-drawer";

const defaultStripText =
  "QUTB — 99 — ALEXANDRIA — THE AXIS — NINETY NINE — EVERYTHING REVOLVES — 99 — قطب — QUTB";

function Logo() {
  return (
    <span className="inline-flex items-end text-[34px] leading-none text-ash">
      <span className="font-blackletter">Q</span>
      <span className="font-sans text-[0.82em] uppercase tracking-[0.12em]">
        UTB
      </span>
    </span>
  );
}

export function SiteChrome({
  showAnnouncementStrip = true,
  announcementText = defaultStripText,
}: {
  showAnnouncementStrip?: boolean;
  announcementText?: string;
}) {
  const pathname = usePathname();
  const isAdminRoute = pathname?.startsWith("/admin");

  if (isAdminRoute) {
    return null;
  }

  const { count, openCart } = useCart();
  const stripHeightClass = showAnnouncementStrip ? "top-8" : "top-0";

  return (
    <>
      {showAnnouncementStrip ? (
        <div className="fixed left-0 top-0 z-50 h-8 w-full overflow-hidden border-b border-[#F0EDE8]/15 bg-[#080808]">
          <motion.div
            className="flex h-full min-w-max items-center gap-14 px-6 text-[10px] uppercase tracking-[0.2em] text-[#F0EDE8]"
            animate={{ x: ["0%", "-50%"] }}
            transition={{ duration: 60, ease: "linear", repeat: Infinity }}
          >
            <span>{announcementText}</span>
            <span>{announcementText}</span>
            <span>{announcementText}</span>
          </motion.div>
        </div>
      ) : null}

      <header className={`fixed left-0 ${stripHeightClass} z-50 w-full border-b border-ash/20 bg-transparent`}>
        <div className="mx-auto grid h-16 w-full max-w-7xl grid-cols-[1fr_auto_1fr] items-center px-6 md:px-10">
          <Link href="/" className="justify-self-start">
            <Logo />
          </Link>
          <nav className="hidden items-center gap-10 text-xs font-medium tracking-[0.22em] text-ash md:flex">
            <Link
              href="/#drop"
              className="transition-colors hover:text-concrete"
            >
              SHOP
            </Link>
            <Link
              href="/story"
              className="transition-colors hover:text-concrete"
            >
              STORY
            </Link>
            <Link
              href="/#footer"
              className="transition-colors hover:text-concrete"
            >
              ALEX
            </Link>
          </nav>
          <div className="flex items-center justify-self-end gap-2 text-ash">
            <button
              aria-label="Search"
              className="grid h-10 w-10 place-items-center border border-ash/35 hover:border-ash"
            >
              <SearchIcon />
            </button>
            <button
              aria-label="Cart"
              onClick={openCart}
              className="relative grid h-10 w-10 place-items-center border border-ash/35 hover:border-ash"
            >
              <CartIcon />
              {count > 0 ? (
                <span className="absolute -right-2 -top-2 inline-flex min-h-5 min-w-5 items-center justify-center bg-[#8B0000] px-1 text-[10px]">
                  {count}
                </span>
              ) : null}
            </button>
          </div>
        </div>
      </header>

      <CartDrawer />
    </>
  );
}
