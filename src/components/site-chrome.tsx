"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { useEffect, useMemo, useState } from "react";
import { useCart } from "@/contexts/cart-context";
import { useConsent } from "@/contexts/consent-context";
import { CartIcon } from "@/components/icons";
import { CartDrawer } from "@/components/cart-drawer";

const defaultStripText =
  "QUTB — ERA 99 — DROP 001 — ALEXANDRIA";

function Logo() {
  return (
    <span className="inline-flex items-end text-[30px] leading-none text-ash sm:text-[34px]">
      <span className="font-anton tracking-[0.28em] text-[#EDE9E0] sm:tracking-[16px]">QUTB</span>
    </span>
  );
}

export function SiteChrome({
  showAnnouncementStrip = true,
  announcementText = defaultStripText,
  dropModeActive = false,
}: {
  showAnnouncementStrip?: boolean;
  announcementText?: string;
  dropModeActive?: boolean;
}) {
  const pathname = usePathname();
  const { count, openCart } = useCart();
  const { resetConsentDecision } = useConsent();

  const isAbsoluteNav =
    pathname?.startsWith("/shop") ||
    pathname?.startsWith("/product") ||
    pathname?.startsWith("/checkout");

  const positionClass = isAbsoluteNav ? "absolute" : "fixed";
  const stripHeightClass = showAnnouncementStrip ? "top-8" : "top-0";
  const [user, setUser] = useState<{
    firstName?: string;
    role?: string;
  } | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const loadSession = async () => {
      try {
        const res = await fetch("/api/auth/session", { cache: "no-store" });
        if (!res.ok) return;
        const data = await res.json();
        if (data?.user?.role === "shopper") {
          setUser({
            firstName: data.user.firstName || data.user.name || "U",
            role: data.user.role,
          });
        } else {
          setUser(null);
        }
      } catch {
        setUser(null);
      }
    };

    loadSession();
  }, [pathname]);

  const initials = useMemo(() => {
    const first = user?.firstName?.trim() || "U";
    return first.slice(0, 1).toUpperCase();
  }, [user?.firstName]);

  const isAdminRoute = pathname?.startsWith("/admin");

  if (isAdminRoute) {
    return null;
  }

  return (
    <>
      {showAnnouncementStrip ? (
        <div
          className={`${positionClass} left-0 top-0 z-50 h-8 w-full overflow-hidden border-b border-[#EDE9E0]/15 bg-[#080808]`}
        >
          {dropModeActive ? (
             <motion.div
              className="flex h-full min-w-max items-center gap-14 px-6 text-[10px] uppercase tracking-[0.2em] text-[#EDE9E0]"
              animate={{ x: ["0%", "-50%"] }}
              transition={{ duration: 60, ease: "linear", repeat: Infinity }}
            >
              <span><span className="text-[#8B0000]">ERA 99 IS LIVE</span>{". QUTB — DROP 001. QUTB.STUDIO"}</span>
              <span><span className="text-[#8B0000]">ERA 99 IS LIVE</span>{". QUTB — DROP 001. QUTB.STUDIO"}</span>
              <span><span className="text-[#8B0000]">ERA 99 IS LIVE</span>{". QUTB — DROP 001. QUTB.STUDIO"}</span>
              <span><span className="text-[#8B0000]">ERA 99 IS LIVE</span>{". QUTB — DROP 001. QUTB.STUDIO"}</span>
            </motion.div>
          ) : (
            <motion.div
              className="flex h-full min-w-max items-center gap-14 px-6 text-[10px] uppercase tracking-[0.2em] text-[#EDE9E0]"
              animate={{ x: ["0%", "-50%"] }}
              transition={{ duration: 60, ease: "linear", repeat: Infinity }}
            >
              <span>{announcementText}</span>
              <span>{announcementText}</span>
              <span>{announcementText}</span>
              <span>{announcementText}</span>
            </motion.div>
          )}
        </div>
      ) : null}

      <header
        className={`${positionClass} left-0 ${stripHeightClass} z-50 w-full border-b border-ash/20 bg-[#080808]/80 backdrop-blur-sm`}
      >
        <div className="mx-auto grid h-16 w-full max-w-7xl grid-cols-[minmax(0,auto)_1fr_auto] items-center pl-3 pr-2 md:grid-cols-[1fr_auto_1fr] md:px-10">
          <Link href="/" className="justify-self-start">
            <Logo />
          </Link>
          <nav className="hidden items-center gap-10 text-xs font-medium tracking-[0.22em] text-ash md:flex">
            <Link
              href="/shop"
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
          </nav>
          <div className="ml-auto flex items-center justify-self-end gap-1 text-ash md:gap-2">
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setMenuOpen((v) => !v)}
                  aria-label="Account menu"
                  className="grid h-8 w-8 place-items-center rounded-full bg-[#080808] text-xs font-medium text-[#EDE9E0]"
                >
                  {initials}
                </button>
                {menuOpen ? (
                  <motion.div
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="absolute right-0 top-10 w-40 border border-[#EDE9E0]/20 bg-[#080808] p-2 text-[11px] uppercase tracking-[0.15em]"
                  >
                    <Link
                      href="/account/orders"
                      className="block px-2 py-2 hover:bg-[#080808]"
                      onClick={() => setMenuOpen(false)}
                    >
                      My Orders
                    </Link>
                    <Link
                      href="/account"
                      className="block px-2 py-2 hover:bg-[#080808]"
                      onClick={() => setMenuOpen(false)}
                    >
                      Account
                    </Link>
                    <button
                      onClick={async () => {
                        await signOut({ redirect: false });
                        setMenuOpen(false);
                        location.href = "/";
                      }}
                      className="block w-full px-2 py-2 text-left hover:bg-[#080808]"
                    >
                      Sign Out
                    </button>
                  </motion.div>
                ) : null}
              </div>
            ) : (
              <Link
                href="/auth/login"
                className="px-1 text-[11px] uppercase tracking-[0.18em] text-[#EDE9E0]/85 md:px-2"
              >
                Sign In
              </Link>
            )}
            <button
              aria-label="Cart"
              onClick={openCart}
              className="relative grid h-10 w-10 place-items-center border border-ash/35 hover:border-ash"
            >
              <CartIcon />
              {count > 0 ? (
                <span className="absolute -right-2 -top-2 inline-flex min-h-5 min-w-5 items-center justify-center bg-[#080808] px-1 text-[10px] text-[#EDE9E0]">
                  {count}
                </span>
              ) : null}
            </button>
          </div>
        </div>
      </header>

      <CartDrawer />

      <button
        type="button"
        onClick={resetConsentDecision}
        className="fixed bottom-3 left-3 z-[95] text-[10px] uppercase tracking-[0.16em] text-[#EDE9E0]/65 underline hover:text-[#EDE9E0]"
      >
        Cookie Preferences
      </button>
    </>
  );
}
