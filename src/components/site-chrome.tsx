"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { useEffect, useMemo, useState } from "react";
import { useCart } from "@/contexts/cart-context";
import { useConsent } from "@/contexts/consent-context";
import { useAnalytics } from "@/hooks/useAnalytics";
import { useMetaPixel } from "@/hooks/useMetaPixel";
import { CartIcon, SearchIcon } from "@/components/icons";
import { CartDrawer } from "@/components/cart-drawer";

const defaultStripText =
  "QUTB — ERA 99 — DROP 001 — ALEXANDRIA";

function Logo() {
  return (
    <span className="inline-flex items-end text-[34px] leading-none text-ash">
      <span className="font-anton tracking-[16px] text-[#ede9e0]">QUTB</span>
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
  const { openPreferences } = useConsent();
  const { trackEvent } = useAnalytics();
  const { track } = useMetaPixel();

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

  return (
    <>
      {showAnnouncementStrip ? (
        <div
          className={`${positionClass} left-0 top-0 z-50 h-8 w-full overflow-hidden border-b border-[#F0EDE8]/15 bg-[#080808]`}
        >
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

      <header
        className={`${positionClass} left-0 ${stripHeightClass} z-50 w-full border-b border-ash/20 bg-[#080808]/80 backdrop-blur-sm`}
      >
        <div className="mx-auto grid h-16 w-full max-w-7xl grid-cols-[auto_1fr_auto] items-center pl-4 pr-2 md:grid-cols-[1fr_auto_1fr] md:px-10">
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
            <Link
              href="/#footer"
              className="transition-colors hover:text-concrete"
            >
              ALEX
            </Link>
          </nav>
          <div className="ml-auto flex items-center justify-self-end gap-1 text-ash md:gap-2">
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setMenuOpen((v) => !v)}
                  aria-label="Account menu"
                  className="grid h-8 w-8 place-items-center rounded-full bg-[#1A1A1A] text-xs font-semibold text-[#F0EDE8]"
                >
                  {initials}
                </button>
                {menuOpen ? (
                  <motion.div
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="absolute right-0 top-10 w-40 border border-[#F0EDE8]/20 bg-[#111111] p-2 text-[11px] uppercase tracking-[0.15em]"
                  >
                    <Link
                      href="/account"
                      className="block px-2 py-2 hover:bg-[#1A1A1A]"
                      onClick={() => setMenuOpen(false)}
                    >
                      My Orders
                    </Link>
                    <Link
                      href="/account"
                      className="block px-2 py-2 hover:bg-[#1A1A1A]"
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
                      className="block w-full px-2 py-2 text-left hover:bg-[#1A1A1A]"
                    >
                      Sign Out
                    </button>
                  </motion.div>
                ) : null}
              </div>
            ) : (
              <Link
                href="/auth/login"
                className="px-1 text-[11px] uppercase tracking-[0.18em] text-[#F0EDE8]/85 md:px-2"
              >
                Sign In
              </Link>
            )}
            <button
              aria-label="Search"
              onClick={() => {
                const term = window.prompt("Search the collection");
                if (!term || !term.trim()) return;
                trackEvent("search", { search_term: term.trim() });
                track("Search", { search_string: term.trim() });
                window.location.href = `/shop?search=${encodeURIComponent(term.trim())}`;
              }}
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
                <span className="absolute -right-2 -top-2 inline-flex min-h-5 min-w-5 items-center justify-center bg-[#1A1A1A] px-1 text-[10px] text-[#F0EDE8]">
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
        onClick={openPreferences}
        className="fixed bottom-3 left-3 z-[95] text-[10px] uppercase tracking-[0.16em] text-[#F0EDE8]/65 underline hover:text-[#F0EDE8]"
      >
        Cookie Preferences
      </button>
    </>
  );
}
