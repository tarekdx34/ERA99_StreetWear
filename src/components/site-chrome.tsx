"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Menu, Search, ShoppingBag, X } from "lucide-react";
import { signOut } from "next-auth/react";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { BrandLogo } from "@/components/brand";
import { CartDrawer } from "@/components/cart-drawer";
import { useCart } from "@/contexts/cart-context";
import { useConsent } from "@/contexts/consent-context";

const defaultStripText =
  "QUTB - Modern Mediterranean essentials - Alexandria, Egypt";

const navItems = [
  { label: "The Uniform", href: "/shop", match: ["/shop", "/product"] },
  { label: "Cotton Journey", href: "/story#cotton", match: ["/story"] },
  { label: "Alexandria", href: "/story#alexandria", match: ["/story"] },
  { label: "Salt Journal", href: "/story#salt-journal", match: ["/story"] },
];

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
  const [scrolled, setScrolled] = useState(false);
  const [user, setUser] = useState<{
    firstName?: string;
    role?: string;
  } | null>(null);
  const [accountOpen, setAccountOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

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
    setAccountOpen(false);
    setMobileOpen(false);
  }, [pathname]);

  const initials = useMemo(() => {
    const first = user?.firstName?.trim() || "U";
    return first.slice(0, 1).toUpperCase();
  }, [user?.firstName]);

  const isAdminRoute = pathname?.startsWith("/admin");
  if (isAdminRoute) return null;

  const homeLike = pathname === "/" || pathname === "";
  const solid = !homeLike || scrolled || mobileOpen;
  const textColor = solid ? "#111111" : "#FAF8F4";
  const stripCopy = dropModeActive
    ? "The Uniform is live - QUTB Alexandria"
    : announcementText || defaultStripText;

  return (
    <>
      {showAnnouncementStrip ? (
        <div
          className={`fixed left-0 top-0 z-50 h-7 w-full overflow-hidden border-b text-[10px] uppercase tracking-[0.18em] transition-colors duration-500 ${
            solid
              ? "border-[#111111]/10 bg-[#F5F0E8] text-[#7C7C75]"
              : "border-[#FAF8F4]/10 bg-[#111111]/25 text-[#FAF8F4]/75"
          }`}
        >
          <motion.div
            className="flex h-full min-w-max items-center gap-12 px-6"
            animate={{ x: ["0%", "-50%"] }}
            transition={{ duration: 52, ease: "linear", repeat: Infinity }}
          >
            <span>{stripCopy}</span>
            <span>{stripCopy}</span>
            <span>{stripCopy}</span>
            <span>{stripCopy}</span>
          </motion.div>
        </div>
      ) : null}

      <header
        className={`fixed left-0 right-0 z-50 transition-all duration-500 ${
          showAnnouncementStrip ? "top-7" : "top-0"
        } ${
          solid
            ? "border-b border-[#111111]/10 bg-[#FAF8F4]"
            : "border-b border-transparent bg-transparent"
        }`}
      >
        <div className="mx-auto flex h-[72px] max-w-[1440px] items-center justify-between px-6 md:px-12">
          <Link
            href="/"
            aria-label="QUTB Home"
            className="transition-opacity hover:opacity-70"
            style={{ color: textColor }}
          >
            <BrandLogo className="text-[29px] transition-colors duration-500" />
          </Link>

          <nav className="hidden items-center gap-10 md:flex">
            {navItems.map((item) => {
              const active = item.match.some((prefix) =>
                pathname?.startsWith(prefix),
              );
              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className={`border-b py-1 text-[12px] font-light uppercase tracking-[0.12em] transition-opacity hover:opacity-60 ${
                    active ? "border-current" : "border-transparent"
                  }`}
                  style={{ color: textColor }}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-4" style={{ color: textColor }}>
            {user ? (
              <div className="relative hidden md:block">
                <button
                  onClick={() => setAccountOpen((value) => !value)}
                  aria-label="Account menu"
                  className="grid h-8 w-8 place-items-center border border-current/20 text-[11px] uppercase tracking-[0.08em] transition-opacity hover:opacity-60"
                >
                  {initials}
                </button>
                {accountOpen ? (
                  <motion.div
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="absolute right-0 top-11 w-44 border border-[#111111]/10 bg-[#FAF8F4] p-3 text-[11px] uppercase tracking-[0.14em] text-[#111111] shadow-[0_18px_50px_rgba(17,17,17,0.08)]"
                  >
                    <Link
                      href="/account/orders"
                      className="block py-2 text-[#7C7C75] hover:text-[#111111]"
                    >
                      My Orders
                    </Link>
                    <Link
                      href="/account"
                      className="block py-2 text-[#7C7C75] hover:text-[#111111]"
                    >
                      Account
                    </Link>
                    <button
                      onClick={async () => {
                        await signOut({ redirect: false });
                        setAccountOpen(false);
                        location.href = "/";
                      }}
                      className="block w-full py-2 text-left text-[#7C7C75] hover:text-[#111111]"
                    >
                      Sign Out
                    </button>
                  </motion.div>
                ) : null}
              </div>
            ) : (
              <Link
                href="/auth/login"
                className="hidden text-[12px] font-light uppercase tracking-[0.14em] transition-opacity hover:opacity-60 md:block"
              >
                Sign In
              </Link>
            )}

            <Link
              href="/shop"
              aria-label="Search products"
              className="hidden transition-opacity hover:opacity-60 md:inline-flex"
            >
              <Search size={17} strokeWidth={1.5} />
            </Link>

            <button
              aria-label="Cart"
              onClick={openCart}
              className="flex items-center gap-1.5 transition-opacity hover:opacity-60"
            >
              <ShoppingBag size={18} strokeWidth={1.5} />
              <span className="min-w-3 text-left text-[11px] tracking-[0.08em]">
                {count}
              </span>
            </button>

            <button
              type="button"
              aria-label={mobileOpen ? "Close menu" : "Open menu"}
              onClick={() => setMobileOpen((value) => !value)}
              className="transition-opacity hover:opacity-60 md:hidden"
            >
              {mobileOpen ? (
                <X size={19} strokeWidth={1.5} />
              ) : (
                <Menu size={19} strokeWidth={1.5} />
              )}
            </button>
          </div>
        </div>

        {mobileOpen ? (
          <motion.nav
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            className="border-t border-[#111111]/10 bg-[#FAF8F4] px-6 py-8 md:hidden"
          >
            <div className="flex flex-col gap-6">
              {navItems.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className="text-left text-[13px] font-light uppercase tracking-[0.14em] text-[#7C7C75] hover:text-[#111111]"
                >
                  {item.label}
                </Link>
              ))}
              <Link
                href={user ? "/account" : "/auth/login"}
                className="text-left text-[13px] font-light uppercase tracking-[0.14em] text-[#111111]"
              >
                {user ? "Account" : "Sign In"}
              </Link>
            </div>
          </motion.nav>
        ) : null}
      </header>

      <CartDrawer />

      <button
        type="button"
        onClick={resetConsentDecision}
        className="fixed bottom-3 left-3 z-[95] text-[10px] uppercase tracking-[0.16em] text-[#7C7C75] underline underline-offset-4 transition-colors hover:text-[#111111]"
      >
        Cookie Preferences
      </button>
    </>
  );
}
