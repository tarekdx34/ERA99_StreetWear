import Link from "next/link";
import { prisma } from "@/lib/prisma";

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-EG", {
    style: "currency",
    currency: "EGP",
    maximumFractionDigits: 0,
  }).format(value);
}

export default async function AdminDashboardPage() {
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  const [
    totalOrders,
    pendingConfirmation,
    pendingPayment,
    todayRevenue,
    recentOrders,
  ] = await Promise.all([
    prisma.order.count(),
    prisma.order.count({ where: { orderStatus: "pending_confirmation" } }),
    prisma.order.count({ where: { orderStatus: "pending_payment" } }),
    prisma.order.aggregate({
      _sum: { total: true },
      where: {
        orderStatus: "paid",
        createdAt: { gte: todayStart },
      },
    }),
    prisma.order.findMany({
      take: 8,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        orderNumber: true,
        customerName: true,
        total: true,
        paymentMethod: true,
        orderStatus: true,
        createdAt: true,
      },
    }),
  ]);

  return (
    <section>
      <p className="text-[12px] uppercase tracking-[0.28em] text-[#F0EDE8]/55">
        99 - OPERATIONS
      </p>
      <h1 className="mt-4 font-blackletter text-5xl">Dashboard</h1>
      <p className="mt-4 text-sm text-[#F0EDE8]/70">
        Live snapshot of order flow and revenue so you can triage quickly.
      </p>

      <div className="mt-6 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <div className="border border-[#F0EDE8]/12 bg-[#121212] p-4">
          <p className="text-[11px] uppercase tracking-[0.18em] text-[#F0EDE8]/55">TOTAL ORDERS</p>
          <p className="mt-3 text-3xl font-semibold">{totalOrders}</p>
        </div>
        <div className="border border-[#8B0000]/45 bg-[#8B0000]/10 p-4">
          <p className="text-[11px] uppercase tracking-[0.18em] text-[#F0EDE8]/55">PENDING CONFIRMATION</p>
          <p className="mt-3 text-3xl font-semibold">{pendingConfirmation}</p>
        </div>
        <div className="border border-[#F0EDE8]/12 bg-[#121212] p-4">
          <p className="text-[11px] uppercase tracking-[0.18em] text-[#F0EDE8]/55">PENDING PAYMENT</p>
          <p className="mt-3 text-3xl font-semibold">{pendingPayment}</p>
        </div>
        <div className="border border-[#F0EDE8]/12 bg-[#121212] p-4">
          <p className="text-[11px] uppercase tracking-[0.18em] text-[#F0EDE8]/55">TODAY PAID REVENUE</p>
          <p className="mt-3 text-3xl font-semibold">{formatCurrency(todayRevenue._sum.total || 0)}</p>
        </div>
      </div>

      <div className="mt-8 border border-[#F0EDE8]/12 bg-[#111111] p-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xs uppercase tracking-[0.22em] text-[#F0EDE8]/75">Recent Orders</h2>
          <Link
            href="/admin/orders"
            className="text-xs uppercase tracking-[0.18em] text-[#F0EDE8]/70 transition-colors hover:text-[#F0EDE8]"
          >
            View All
          </Link>
        </div>

        <div className="mt-3 overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="text-[11px] uppercase tracking-[0.18em] text-[#F0EDE8]/50">
              <tr>
                <th className="py-2 pr-3">Order</th>
                <th className="py-2 pr-3">Customer</th>
                <th className="py-2 pr-3">Total</th>
                <th className="py-2 pr-3">Payment</th>
                <th className="py-2 pr-3">Status</th>
                <th className="py-2">Created</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.map((order) => (
                <tr key={order.id} className="border-t border-[#F0EDE8]/10 text-[#F0EDE8]/88">
                  <td className="py-3 pr-3 font-medium">{order.orderNumber}</td>
                  <td className="py-3 pr-3">{order.customerName}</td>
                  <td className="py-3 pr-3">{formatCurrency(order.total)}</td>
                  <td className="py-3 pr-3">{order.paymentMethod}</td>
                  <td className="py-3 pr-3 uppercase tracking-[0.08em] text-[#F0EDE8]/70">{order.orderStatus.replaceAll("_", " ")}</td>
                  <td className="py-3 text-[#F0EDE8]/55">
                    {order.createdAt.toLocaleString("en-GB", {
                      day: "2-digit",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
