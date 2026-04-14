import Link from "next/link";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { AdminOrdersTable } from "@/components/admin/admin-orders-table";

const PAGE_SIZE = 20;

const FILTER_STATUSES = [
  "all",
  "pending_confirmation",
  "pending_payment",
  "paid",
  "preparing",
  "shipped",
  "delivered",
  "payment_failed",
  "cancelled",
] as const;

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-EG", {
    style: "currency",
    currency: "EGP",
    maximumFractionDigits: 0,
  }).format(value);
}

function parseDateInput(input: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(input)) {
    return null;
  }
  const parsed = new Date(`${input}T00:00:00.000Z`);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string;
    status?: string;
    page?: string;
    from?: string;
    to?: string;
  }>;
}) {
  const resolvedSearch = await searchParams;
  const query = (resolvedSearch.q || "").trim();
  const from = (resolvedSearch.from || "").trim();
  const to = (resolvedSearch.to || "").trim();
  const requestedStatus = (resolvedSearch.status || "all").trim();
  const status = FILTER_STATUSES.includes(requestedStatus as any)
    ? requestedStatus
    : "all";

  const pageNum = Number(resolvedSearch.page || "1");
  const page =
    Number.isFinite(pageNum) && pageNum > 0 ? Math.floor(pageNum) : 1;

  const fromDate = from ? parseDateInput(from) : null;
  const toDate = to ? parseDateInput(to) : null;
  const toDateExclusive = toDate
    ? new Date(toDate.getTime() + 24 * 60 * 60 * 1000)
    : null;

  const where: Prisma.OrderWhereInput = {
    ...(status !== "all" ? { orderStatus: status } : {}),
    ...(fromDate || toDateExclusive
      ? {
          createdAt: {
            ...(fromDate ? { gte: fromDate } : {}),
            ...(toDateExclusive ? { lt: toDateExclusive } : {}),
          },
        }
      : {}),
    ...(query
      ? {
          OR: [
            { orderNumber: { contains: query, mode: "insensitive" } },
            { customerName: { contains: query, mode: "insensitive" } },
            { phone: { contains: query, mode: "insensitive" } },
            { city: { contains: query, mode: "insensitive" } },
          ],
        }
      : {}),
  };

  const [totalCount, orders] = await Promise.all([
    prisma.order.count({ where }),
    prisma.order.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      select: {
        id: true,
        orderNumber: true,
        customerName: true,
        phone: true,
        city: true,
        total: true,
        paymentMethod: true,
        paymentStatus: true,
        orderStatus: true,
        createdAt: true,
      },
    }),
  ]);

  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);

  const makePageHref = (nextPage: number) => {
    const params = new URLSearchParams();
    if (query) params.set("q", query);
    if (status !== "all") params.set("status", status);
    if (from) params.set("from", from);
    if (to) params.set("to", to);
    params.set("page", String(nextPage));
    return `/admin/orders?${params.toString()}`;
  };

  return (
    <section>
      <p className="text-[12px] uppercase tracking-[0.28em] text-[#F0EDE8]/55">
        99 - ORDERS
      </p>
      <h1 className="mt-2 font-blackletter text-4xl md:text-5xl">Orders</h1>
      <p className="mt-3 text-sm text-[#F0EDE8]/70">
        Search, filter, and process order flow with inline status updates.
      </p>

      <form className="mt-4 grid gap-3 border border-[#F0EDE8]/12 bg-[#111111] p-3 md:mt-6 md:grid-cols-[minmax(260px,1fr)_220px_170px_170px_auto]">
        <input
          name="q"
          defaultValue={query}
          placeholder="Search order number, customer, phone, city"
          className="w-full border border-[#F0EDE8]/20 bg-[#0E0E0E] px-3 py-2 text-sm outline-none placeholder:text-[#F0EDE8]/40 focus:border-[#F0EDE8]/45"
        />
        <select
          name="status"
          defaultValue={status}
          className="min-w-[220px] border border-[#F0EDE8]/20 bg-[#0E0E0E] px-3 py-2 text-xs uppercase tracking-[0.08em]"
        >
          {FILTER_STATUSES.map((item) => (
            <option key={item} value={item}>
              {item === "all" ? "all statuses" : item.replaceAll("_", " ")}
            </option>
          ))}
        </select>
        <input
          type="date"
          name="from"
          defaultValue={from}
          className="border border-[#F0EDE8]/20 bg-[#0E0E0E] px-3 py-2 text-xs uppercase tracking-[0.08em]"
        />
        <input
          type="date"
          name="to"
          defaultValue={to}
          className="border border-[#F0EDE8]/20 bg-[#0E0E0E] px-3 py-2 text-xs uppercase tracking-[0.08em]"
        />
        <button
          type="submit"
          className="border border-[#F0EDE8]/25 px-4 py-2 text-xs uppercase tracking-[0.18em] transition-colors duration-200 hover:border-[#F0EDE8]/45"
        >
          Apply
        </button>
      </form>

      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-[11px] uppercase tracking-[0.15em] text-[#F0EDE8]/55">
        <p>
          Showing {(safePage - 1) * PAGE_SIZE + (orders.length ? 1 : 0)}-
          {(safePage - 1) * PAGE_SIZE + orders.length} of {totalCount}
        </p>
        <p>
          Page {safePage} / {totalPages}
        </p>
      </div>

      <AdminOrdersTable
        orders={orders.map((order) => ({
          ...order,
          createdAt: order.createdAt.toISOString(),
          totalLabel: formatCurrency(order.total),
        }))}
      />

      <div className="mt-4 flex items-center justify-end gap-2">
        <Link
          href={makePageHref(Math.max(1, safePage - 1))}
          aria-disabled={safePage <= 1}
          className={`border px-3 py-2 text-xs uppercase tracking-[0.16em] ${
            safePage <= 1
              ? "pointer-events-none border-[#F0EDE8]/10 text-[#F0EDE8]/35"
              : "border-[#F0EDE8]/25 text-[#F0EDE8]/75 hover:border-[#F0EDE8]/45"
          }`}
        >
          Previous
        </Link>
        <Link
          href={makePageHref(Math.min(totalPages, safePage + 1))}
          aria-disabled={safePage >= totalPages}
          className={`border px-3 py-2 text-xs uppercase tracking-[0.16em] ${
            safePage >= totalPages
              ? "pointer-events-none border-[#F0EDE8]/10 text-[#F0EDE8]/35"
              : "border-[#F0EDE8]/25 text-[#F0EDE8]/75 hover:border-[#F0EDE8]/45"
          }`}
        >
          Next
        </Link>
      </div>
    </section>
  );
}
