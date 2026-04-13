"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { signOut } from "next-auth/react";
import { useEffect, useMemo, useState } from "react";
import {
  Bell,
  Box,
  ChartColumn,
  Grid2x2,
  Receipt,
  Settings,
  Users,
  X,
} from "lucide-react";

type AdminNotification = {
  id: number;
  type: string;
  message: string;
  read: boolean;
  createdAt: string;
};

type Props = {
  children: React.ReactNode;
  username: string;
  pendingOrdersCount: number;
  unreadCount: number;
  notifications: AdminNotification[];
};

const links = [
  { label: "DASHBOARD", href: "/admin/dashboard", icon: Grid2x2 },
  { label: "ORDERS", href: "/admin/orders", icon: Receipt, hasPending: true },
  { label: "PRODUCTS", href: "/admin/products", icon: Box },
  { label: "ANALYTICS", href: "/admin/analytics", icon: ChartColumn },
  { label: "CUSTOMERS", href: "/admin/customers", icon: Users },
  { label: "SETTINGS", href: "/admin/settings", icon: Settings },
];

export function AdminShell({
  children,
  username,
  pendingOrdersCount,
  unreadCount,
  notifications,
}: Props) {
  const pathname = usePathname();
  const router = useRouter();
  const [clock, setClock] = useState("");
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    const tick = () => {
      const now = new Date();
      setClock(
        now.toLocaleString("en-GB", {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          day: "2-digit",
          month: "short",
          year: "numeric",
        }),
      );
    };

    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, []);

  const pageTitle = useMemo(() => {
    const found = links.find((item) => pathname.startsWith(item.href));
    return found?.label || "ADMIN";
  }, [pathname]);

  return (
    <div className="min-h-screen bg-[#080808] text-[#F0EDE8]">
      <aside className="fixed left-0 top-0 z-40 h-screen w-[240px] border-r border-[#F0EDE8]/10 bg-[#0D0D0D]">
        <div className="px-5 pb-4 pt-6">
          <p className="font-anton text-4xl leading-none tracking-[16px] text-[#ede9e0]">
            QUTB
          </p>
          <p className="mt-2 text-[11px] font-medium uppercase tracking-[0.3em] text-[#555555]">
            QUTB ADMIN
          </p>
        </div>

        <nav className="mt-3 px-2">
          {links.map((item) => {
            const Icon = item.icon;
            const active =
              pathname === item.href || pathname.startsWith(`${item.href}/`);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`mb-1 flex items-center gap-3 border-l-2 px-3 py-3 text-xs font-medium uppercase tracking-[0.16em] transition-colors duration-200 ${
                  active
                    ? "border-l-[#F0EDE8] bg-[#1A1A1A] text-[#F0EDE8]"
                    : "border-l-transparent text-[#F0EDE8]/70 hover:bg-[#1A1A1A] hover:text-[#F0EDE8]"
                }`}
              >
                <Icon size={16} />
                <span>{item.label}</span>
                {item.hasPending && pendingOrdersCount > 0 ? (
                  <span className="ml-auto min-w-5 bg-[#F0EDE8] px-1 py-[2px] text-center text-[10px] leading-none text-[#080808]">
                    {pendingOrdersCount}
                  </span>
                ) : null}
              </Link>
            );
          })}
        </nav>

        <div className="absolute bottom-0 left-0 w-full border-t border-[#F0EDE8]/10 px-5 py-4">
          <p className="text-[11px] uppercase tracking-[0.16em] text-[#F0EDE8]/55">
            {username}
          </p>
          <button
            onClick={async () => {
              await signOut({ redirect: false });
              router.push("/admin/login");
            }}
            className="mt-3 w-full border border-[#F0EDE8]/20 px-3 py-2 text-xs uppercase tracking-[0.18em] text-[#F0EDE8]/75 transition-colors duration-200 hover:border-[#F0EDE8]/40 hover:text-[#F0EDE8]"
          >
            SIGN OUT
          </button>
        </div>
      </aside>

      <div className="ml-[240px] min-h-screen">
        <header className="sticky top-0 z-30 flex h-16 min-h-16 items-center justify-between border-b border-[#F0EDE8]/10 bg-[#080808] px-6">
          <h1 className="text-sm font-medium uppercase tracking-[0.24em] text-[#F0EDE8]/85">
            {pageTitle}
          </h1>

          <div className="flex items-center gap-4">
            <p className="text-[12px] uppercase tracking-[0.18em] text-[#F0EDE8]/55">
              {clock}
            </p>
            <button
              onClick={() => setDrawerOpen(true)}
              className="relative grid h-9 w-9 place-items-center border border-[#F0EDE8]/20 text-[#F0EDE8]/80 transition-colors duration-200 hover:border-[#F0EDE8]/45 hover:text-[#F0EDE8]"
              aria-label="Notifications"
            >
              <Bell size={16} />
              {unreadCount > 0 ? (
                <span className="absolute -right-2 -top-2 min-w-4 bg-[#F0EDE8] px-1 text-[10px] leading-4 text-[#080808]">
                  {unreadCount}
                </span>
              ) : null}
            </button>
          </div>
        </header>

        <main className="p-6">{children}</main>
      </div>

      {drawerOpen ? (
        <>
          <button
            className="fixed inset-0 z-40 bg-black/50"
            onClick={() => setDrawerOpen(false)}
            aria-label="Close notifications"
          />
          <aside className="fixed right-0 top-0 z-50 h-screen w-full max-w-[420px] border-l border-[#F0EDE8]/10 bg-[#0D0D0D] p-5">
            <div className="flex items-center justify-between border-b border-[#F0EDE8]/10 pb-3">
              <h2 className="text-xs uppercase tracking-[0.2em]">
                NOTIFICATIONS
              </h2>
              <button
                onClick={() => setDrawerOpen(false)}
                className="grid h-8 w-8 place-items-center border border-[#F0EDE8]/20"
                aria-label="Close"
              >
                <X size={14} />
              </button>
            </div>

            <div
              className="mt-4 space-y-2 overflow-y-auto pr-1"
              style={{ maxHeight: "calc(100vh - 90px)" }}
            >
              {notifications.length === 0 ? (
                <p className="text-sm text-[#F0EDE8]/50">
                  No notifications yet.
                </p>
              ) : (
                notifications.map((note) => (
                  <div
                    key={note.id}
                    className={`border px-3 py-3 ${
                      note.read
                        ? "border-[#F0EDE8]/12 bg-[#111111]"
                        : "border-[#F0EDE8]/30 bg-[#1A1A1A]"
                    }`}
                  >
                    <p className="text-[11px] uppercase tracking-[0.16em] text-[#F0EDE8]/55">
                      {note.type}
                    </p>
                    <p className="mt-1 text-sm text-[#F0EDE8]/85">
                      {note.message}
                    </p>
                    <p className="mt-2 text-[11px] text-[#F0EDE8]/45">
                      {new Date(note.createdAt).toLocaleString()}
                    </p>
                  </div>
                ))
              )}
            </div>
          </aside>
        </>
      ) : null}
    </div>
  );
}
