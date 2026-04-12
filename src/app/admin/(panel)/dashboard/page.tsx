import Link from "next/link";
import { prisma } from "@/lib/prisma";
import {
  getAdminCatalogCardProducts,
  getAdminCatalogProducts,
} from "@/lib/catalog";
import { getAdminSettings } from "@/lib/admin-settings";
import { getRecentLoginAttempts } from "@/lib/admin-security";
import { AdminDashboardLive } from "@/components/admin/admin-dashboard-live";
import { AdminActivityFeed } from "@/components/admin/admin-activity-feed";
import { AdminDashboardInsights } from "@/components/admin/admin-dashboard-insights";

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
  const weekStart = new Date(todayStart);
  weekStart.setDate(weekStart.getDate() - 6);
  const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);
  const sixHoursAgo = new Date(Date.now() - 6 * 60 * 60 * 1000);
  const thirtyMinutesAgo = new Date(Date.now() - 30 * 60 * 1000);

  const [
    totalOrders,
    totalOrdersThisWeek,
    totalOrdersToday,
    pendingConfirmation,
    pendingPayment,
    failedPayments,
    todayRevenue,
    weekRevenue,
    pendingHighValueCount,
    stalePendingConfirmation,
    stalePendingPayment,
    agingCodQueue,
    recentOrders,
    recentPaymentEvents,
    recentLoginAttempts,
    failedPayments24h,
    paidOrders24h,
    loginFailures24h,
    catalogCards,
    catalogProducts,
    adminSettings,
  ] = await Promise.all([
    prisma.order.count(),
    prisma.order.count({ where: { createdAt: { gte: weekStart } } }),
    prisma.order.count({ where: { createdAt: { gte: todayStart } } }),
    prisma.order.count({ where: { orderStatus: "pending_confirmation" } }),
    prisma.order.count({ where: { orderStatus: "pending_payment" } }),
    prisma.order.count({ where: { orderStatus: "payment_failed" } }),
    prisma.order.aggregate({
      _sum: { total: true },
      where: {
        orderStatus: "paid",
        createdAt: { gte: todayStart },
      },
    }),
    prisma.order.aggregate({
      _sum: { total: true },
      where: {
        orderStatus: "paid",
        createdAt: { gte: weekStart },
      },
    }),
    prisma.order.count({
      where: {
        orderStatus: "pending_confirmation",
        total: { gte: 2000 },
      },
    }),
    prisma.order.count({
      where: {
        orderStatus: "pending_confirmation",
        createdAt: { lt: twoHoursAgo },
      },
    }),
    prisma.order.count({
      where: {
        orderStatus: "pending_payment",
        createdAt: { lt: sixHoursAgo },
      },
    }),
    prisma.order.count({
      where: {
        orderStatus: "pending_confirmation",
        paymentMethod: "cod",
        createdAt: { lt: thirtyMinutesAgo },
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
    prisma.order.findMany({
      take: 8,
      where: {
        orderStatus: { in: ["paid", "payment_failed"] },
      },
      orderBy: { updatedAt: "desc" },
      select: {
        id: true,
        orderNumber: true,
        orderStatus: true,
        total: true,
        updatedAt: true,
      },
    }),
    getRecentLoginAttempts(8),
    prisma.order.count({
      where: {
        orderStatus: "payment_failed",
        createdAt: { gte: dayAgo },
      },
    }),
    prisma.order.count({
      where: {
        orderStatus: "paid",
        createdAt: { gte: dayAgo },
      },
    }),
    prisma.loginAttempt.count({
      where: {
        success: false,
        createdAt: { gte: dayAgo },
      },
    }),
    getAdminCatalogCardProducts(),
    getAdminCatalogProducts(),
    getAdminSettings(),
  ]);

  const lowStockCount = catalogCards.filter(
    (item) => item.totalStock > 0 && item.totalStock < 10,
  ).length;
  const outOfStockCount = catalogCards.filter(
    (item) => item.active && item.totalStock === 0,
  ).length;
  const paymentFailureRate24h =
    failedPayments24h + paidOrders24h > 0
      ? (failedPayments24h / (failedPayments24h + paidOrders24h)) * 100
      : 0;

  const orderEvents = recentOrders.map((order) => ({
    id: `order-${order.id}`,
    type: "order" as const,
    title: `New order ${order.orderNumber} from ${order.customerName}`,
    subtitle: `${formatCurrency(order.total)} • ${order.paymentMethod} • ${order.orderStatus.replaceAll("_", " ")}`,
    at: order.createdAt,
    href: `/admin/orders?q=${order.orderNumber}`,
  }));

  const paymentEvents = recentPaymentEvents.map((order) => ({
    id: `payment-${order.id}-${order.updatedAt.toISOString()}`,
    type: "payment" as const,
    title: `Payment ${order.orderStatus === "paid" ? "succeeded" : "failed"} for ${order.orderNumber}`,
    subtitle: `${formatCurrency(order.total)} • ${order.orderStatus.replaceAll("_", " ")}`,
    at: order.updatedAt,
    href: `/admin/orders?q=${order.orderNumber}`,
  }));

  const securityEvents = recentLoginAttempts.map((attempt) => ({
    id: `security-${attempt.id}`,
    type: "security" as const,
    title: `Admin login ${attempt.success ? "success" : "failure"}`,
    subtitle: `${attempt.ip}${attempt.username ? ` • ${attempt.username}` : ""}`,
    at: attempt.createdAt,
    href: "/admin/settings",
  }));

  const inventoryEvents = [...catalogProducts]
    .sort(
      (a, b) =>
        new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
    )
    .slice(0, 6)
    .map((product) => ({
      id: `inventory-${product.id}-${product.updatedAt}`,
      type: "inventory" as const,
      title: `Product updated: ${product.name}`,
      subtitle: `${formatCurrency(product.price)} • ${product.collection}`,
      at: new Date(product.updatedAt),
      href: `/admin/products/${product.id}/edit`,
    }));

  const activityFeed = [
    ...orderEvents,
    ...paymentEvents,
    ...securityEvents,
    ...inventoryEvents,
  ]
    .sort((a, b) => b.at.getTime() - a.at.getTime())
    .slice(0, 14)
    .map((item) => ({
      ...item,
      at: item.at.toLocaleString("en-GB", {
        day: "2-digit",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      }),
    }));

  const alertRules = [
    {
      id: "a1",
      label: "Payment Failure Rate (24h)",
      value: `${paymentFailureRate24h.toFixed(1)}%`,
      detail: `${failedPayments24h} failures out of ${failedPayments24h + paidOrders24h} completed payment attempts.`,
      severity:
        paymentFailureRate24h >=
        adminSettings.dashboardPaymentFailureCriticalRate
          ? "critical"
          : paymentFailureRate24h >=
              adminSettings.dashboardPaymentFailureWarningRate
            ? "warning"
            : "info",
      href: "/admin/orders?status=payment_failed",
    },
    {
      id: "a2",
      label: "Aging Pending Confirmation",
      value: `${stalePendingConfirmation}`,
      detail: "Orders pending for more than 2 hours.",
      severity:
        stalePendingConfirmation >=
        adminSettings.dashboardStaleConfirmationCriticalCount
          ? "critical"
          : stalePendingConfirmation >=
              adminSettings.dashboardStaleConfirmationWarningCount
            ? "warning"
            : "info",
      href: "/admin/orders?status=pending_confirmation",
    },
    {
      id: "a3",
      label: "Stock Risk",
      value: `${outOfStockCount} out / ${lowStockCount} low`,
      detail: "Active products that need replenishment.",
      severity:
        outOfStockCount >= 3 || lowStockCount >= 10
          ? "critical"
          : outOfStockCount >= 1 || lowStockCount >= 5
            ? "warning"
            : "info",
      href: "/admin/products",
    },
    {
      id: "a4",
      label: "Security Signal",
      value: `${loginFailures24h}`,
      detail: "Failed admin login attempts in the last 24 hours.",
      severity:
        loginFailures24h >= adminSettings.dashboardSecurityCriticalCount
          ? "critical"
          : loginFailures24h >= adminSettings.dashboardSecurityWarningCount
            ? "warning"
            : "info",
      href: "/admin/settings",
    },
  ] as const;

  const recommendations = [
    {
      id: "r1",
      title: `Clear COD backlog (${agingCodQueue})`,
      description:
        "Auto-confirm or manually review COD orders waiting over 30 minutes.",
      href: "/admin/orders?status=pending_confirmation",
      actionLabel: "Open queue",
      active: agingCodQueue > 0,
    },
    {
      id: "r2",
      title: "Investigate failed payments",
      description:
        "Check gateway/provider issues and retry outreach for failed payment orders.",
      href: "/admin/orders?status=payment_failed",
      actionLabel: "Review failures",
      active: failedPayments24h > 0,
    },
    {
      id: "r3",
      title: "Replenish low-stock products",
      description:
        "Prioritize active items that can block conversion during checkout.",
      href: "/admin/products",
      actionLabel: "Manage inventory",
      active: outOfStockCount > 0 || lowStockCount > 0,
    },
    {
      id: "r4",
      title: "Review security activity",
      description:
        "Inspect unusual admin login failures and rotate credentials if needed.",
      href: "/admin/settings",
      actionLabel: "Open security settings",
      active: loginFailures24h >= 3,
    },
  ]
    .filter((item) => item.active)
    .slice(0, 4)
    .map(({ active: _active, ...item }) => item);

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
          <p className="text-[11px] uppercase tracking-[0.18em] text-[#F0EDE8]/55">
            TOTAL ORDERS
          </p>
          <p className="mt-3 text-3xl font-semibold">{totalOrders}</p>
        </div>
        <div className="border border-[#8B0000]/45 bg-[#8B0000]/10 p-4">
          <p className="text-[11px] uppercase tracking-[0.18em] text-[#F0EDE8]/55">
            PENDING CONFIRMATION
          </p>
          <p className="mt-3 text-3xl font-semibold">{pendingConfirmation}</p>
        </div>
        <div className="border border-[#F0EDE8]/12 bg-[#121212] p-4">
          <p className="text-[11px] uppercase tracking-[0.18em] text-[#F0EDE8]/55">
            PENDING PAYMENT
          </p>
          <p className="mt-3 text-3xl font-semibold">{pendingPayment}</p>
        </div>
        <div className="border border-[#F0EDE8]/12 bg-[#121212] p-4">
          <p className="text-[11px] uppercase tracking-[0.18em] text-[#F0EDE8]/55">
            TODAY PAID REVENUE
          </p>
          <p className="mt-3 text-3xl font-semibold">
            {formatCurrency(todayRevenue._sum.total || 0)}
          </p>
        </div>
      </div>

      <div className="mt-3 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <div className="border border-[#F0EDE8]/12 bg-[#121212] p-4">
          <p className="text-[11px] uppercase tracking-[0.18em] text-[#F0EDE8]/55">
            TODAY ORDERS
          </p>
          <p className="mt-3 text-2xl font-semibold">{totalOrdersToday}</p>
        </div>
        <div className="border border-[#F0EDE8]/12 bg-[#121212] p-4">
          <p className="text-[11px] uppercase tracking-[0.18em] text-[#F0EDE8]/55">
            WEEK ORDERS
          </p>
          <p className="mt-3 text-2xl font-semibold">{totalOrdersThisWeek}</p>
        </div>
        <div className="border border-[#F0EDE8]/12 bg-[#121212] p-4">
          <p className="text-[11px] uppercase tracking-[0.18em] text-[#F0EDE8]/55">
            WEEK REVENUE
          </p>
          <p className="mt-3 text-2xl font-semibold">
            {formatCurrency(weekRevenue._sum.total || 0)}
          </p>
        </div>
        <div className="border border-[#F0EDE8]/12 bg-[#121212] p-4">
          <p className="text-[11px] uppercase tracking-[0.18em] text-[#F0EDE8]/55">
            FAILED PAYMENTS
          </p>
          <p className="mt-3 text-2xl font-semibold">{failedPayments}</p>
        </div>
      </div>

      <AdminDashboardLive
        pendingConfirmation={pendingConfirmation}
        pendingPayment={pendingPayment}
        lowStockCount={lowStockCount}
        failedPayments={failedPayments}
        highValuePendingCount={pendingHighValueCount}
      />

      <AdminDashboardInsights
        alerts={[...alertRules]}
        recommendations={recommendations}
      />

      <div className="mt-8 border border-[#F0EDE8]/12 bg-[#111111] p-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xs uppercase tracking-[0.22em] text-[#F0EDE8]/75">
            Recent Orders
          </h2>
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
                <tr
                  key={order.id}
                  className="border-t border-[#F0EDE8]/10 text-[#F0EDE8]/88"
                >
                  <td className="py-3 pr-3 font-medium">{order.orderNumber}</td>
                  <td className="py-3 pr-3">{order.customerName}</td>
                  <td className="py-3 pr-3">{formatCurrency(order.total)}</td>
                  <td className="py-3 pr-3">{order.paymentMethod}</td>
                  <td className="py-3 pr-3 uppercase tracking-[0.08em] text-[#F0EDE8]/70">
                    {order.orderStatus.replaceAll("_", " ")}
                  </td>
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

      <AdminActivityFeed items={activityFeed} />
    </section>
  );
}
