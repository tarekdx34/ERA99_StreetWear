import { prisma } from "@/lib/prisma";
import { getAdminCatalogCardProducts } from "@/lib/catalog";

type OrderLite = {
  id: number;
  orderNumber: string;
  customerName: string;
  phone: string;
  governorate: string;
  total: number;
  paymentMethod: string;
  orderStatus: string;
  createdAt: Date;
  items: unknown;
};

function startOfDay(date: Date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function addDays(date: Date, days: number) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function addMonths(date: Date, months: number) {
  const d = new Date(date);
  d.setMonth(d.getMonth() + months);
  return d;
}

function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function percentChange(current: number, previous: number) {
  if (previous === 0 && current === 0) return 0;
  if (previous === 0) return 100;
  return ((current - previous) / previous) * 100;
}

function dayKey(date: Date) {
  return date.toISOString().slice(0, 10);
}

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

type ProductRollup = {
  productId: string;
  name: string;
  units: number;
  revenue: number;
};

function parseItems(items: unknown): Array<any> {
  return Array.isArray(items) ? items : [];
}

export async function getAdminAnalyticsData() {
  const now = new Date();
  const todayStart = startOfDay(now);
  const weekStart = addDays(todayStart, -6);
  const monthStart = startOfMonth(now);
  const lastMonthStart = startOfMonth(addMonths(now, -1));
  const nextMonthStart = startOfMonth(addMonths(now, 1));
  const ninetyDaysStart = addDays(todayStart, -89);

  const orders = (await prisma.order.findMany({
    where: {
      createdAt: { gte: ninetyDaysStart },
    },
    select: {
      id: true,
      orderNumber: true,
      customerName: true,
      phone: true,
      governorate: true,
      total: true,
      paymentMethod: true,
      orderStatus: true,
      createdAt: true,
      items: true,
    },
    orderBy: { createdAt: "asc" },
  })) as OrderLite[];

  const allOrders = (await prisma.order.findMany({
    select: {
      id: true,
      orderNumber: true,
      customerName: true,
      phone: true,
      governorate: true,
      total: true,
      paymentMethod: true,
      orderStatus: true,
      createdAt: true,
      items: true,
    },
    orderBy: { createdAt: "asc" },
  })) as OrderLite[];

  const totalRevenueAllTime = allOrders.reduce(
    (sum, order) => sum + order.total,
    0,
  );
  const revenueThisMonth = allOrders
    .filter((order) => order.createdAt >= monthStart)
    .reduce((sum, order) => sum + order.total, 0);
  const revenueThisWeek = allOrders
    .filter((order) => order.createdAt >= weekStart)
    .reduce((sum, order) => sum + order.total, 0);

  const revenueLastMonth = allOrders
    .filter(
      (order) =>
        order.createdAt >= lastMonthStart && order.createdAt < monthStart,
    )
    .reduce((sum, order) => sum + order.total, 0);

  const avgOrderValue = allOrders.length
    ? totalRevenueAllTime / allOrders.length
    : 0;

  const codRevenue = allOrders
    .filter((order) => order.paymentMethod === "COD")
    .reduce((sum, order) => sum + order.total, 0);
  const onlineRevenue = allOrders
    .filter((order) => order.paymentMethod !== "COD")
    .reduce((sum, order) => sum + order.total, 0);

  const totalOrdersAllTime = allOrders.length;
  const totalOrdersThisMonth = allOrders.filter(
    (order) => order.createdAt >= monthStart,
  ).length;
  const totalOrdersThisWeek = allOrders.filter(
    (order) => order.createdAt >= weekStart,
  ).length;
  const totalOrdersToday = allOrders.filter((order) =>
    isSameDay(order.createdAt, now),
  ).length;

  const statusMap: Record<string, number> = {};
  for (const order of allOrders) {
    statusMap[order.orderStatus] = (statusMap[order.orderStatus] || 0) + 1;
  }

  const cancelledCount = statusMap.cancelled || 0;
  const returnCount = Object.entries(statusMap)
    .filter(([key]) => key.toLowerCase().includes("return"))
    .reduce((sum, [, value]) => sum + value, 0);

  const hourlyMap: Record<number, number> = {};
  const weekdayMap: Record<number, number> = {};
  for (const order of allOrders) {
    const hour = order.createdAt.getHours();
    const day = order.createdAt.getDay();
    hourlyMap[hour] = (hourlyMap[hour] || 0) + 1;
    weekdayMap[day] = (weekdayMap[day] || 0) + 1;
  }

  const dailyRevenue90Map: Record<string, number> = {};
  for (let i = 0; i < 90; i += 1) {
    const d = addDays(ninetyDaysStart, i);
    dailyRevenue90Map[dayKey(d)] = 0;
  }
  for (const order of orders) {
    const key = dayKey(order.createdAt);
    if (dailyRevenue90Map[key] !== undefined) {
      dailyRevenue90Map[key] += order.total;
    }
  }

  const dailyRevenue = Object.entries(dailyRevenue90Map).map(
    ([date, revenue]) => ({
      date,
      label: date.slice(5),
      revenue,
    }),
  );

  const productMap: Record<string, ProductRollup> = {};
  const sizeMap: Record<string, number> = {};
  const customerSpendMap: Record<string, { name: string; spend: number }> = {};
  const governorateMap: Record<string, number> = {};
  const governoratePaymentMap: Record<string, { cod: number; online: number }> =
    {};

  const customerOrderCount: Record<string, number> = {};
  const customerFirstOrderDate: Record<string, Date> = {};

  for (const order of allOrders) {
    const customerKey = order.phone;
    customerSpendMap[customerKey] = {
      name: order.customerName,
      spend: (customerSpendMap[customerKey]?.spend || 0) + order.total,
    };

    customerOrderCount[customerKey] =
      (customerOrderCount[customerKey] || 0) + 1;
    if (
      !customerFirstOrderDate[customerKey] ||
      customerFirstOrderDate[customerKey] > order.createdAt
    ) {
      customerFirstOrderDate[customerKey] = order.createdAt;
    }

    const govRaw = order.governorate?.trim() || "Other";
    const govLower = govRaw.toLowerCase();
    const governorate = govLower.includes("alex")
      ? "Alexandria"
      : govLower.includes("cairo")
        ? "Cairo"
        : govLower.includes("giza")
          ? "Giza"
          : "Other";

    governorateMap[governorate] = (governorateMap[governorate] || 0) + 1;
    if (!governoratePaymentMap[governorate]) {
      governoratePaymentMap[governorate] = { cod: 0, online: 0 };
    }
    if (order.paymentMethod === "COD") {
      governoratePaymentMap[governorate].cod += 1;
    } else {
      governoratePaymentMap[governorate].online += 1;
    }

    for (const item of parseItems(order.items)) {
      const productId = String(
        item?.productId || item?.slug || item?.name || "unknown",
      );
      const name = String(item?.name || item?.slug || "Unknown Product");
      const qty = Number(item?.qty || 0);
      const unitPrice = Number(item?.unitPrice || 0);
      if (!productMap[productId]) {
        productMap[productId] = { productId, name, units: 0, revenue: 0 };
      }
      productMap[productId].units += qty;
      productMap[productId].revenue += qty * unitPrice;

      const size = String(item?.size || "Unknown");
      sizeMap[size] = (sizeMap[size] || 0) + qty;
    }
  }

  const productRows = Object.values(productMap).sort(
    (a, b) => b.units - a.units,
  );
  const bestSelling = productRows.slice(0, 8);
  const worstPerforming = [...productRows].reverse().slice(0, 8);

  const sizeDistribution = Object.entries(sizeMap)
    .map(([size, units]) => ({ size, units }))
    .sort((a, b) => b.units - a.units);

  const catalogCards = await getAdminCatalogCardProducts();
  const lowStockAlerts = catalogCards.filter(
    (item) => item.totalStock > 0 && item.totalStock < 10,
  );
  const outOfStock = catalogCards.filter(
    (item) => item.totalStock <= 0 && item.active,
  );

  const estimatedLostRevenue = outOfStock.reduce(
    (sum, item) => sum + item.price * 5,
    0,
  );

  const uniqueCustomers = Object.keys(customerOrderCount).length;
  const repeatCustomers = Object.values(customerOrderCount).filter(
    (count) => count > 1,
  ).length;
  const repeatCustomerRate = uniqueCustomers
    ? (repeatCustomers / uniqueCustomers) * 100
    : 0;

  const newCustomersThisMonth = Object.values(customerFirstOrderDate).filter(
    (date) => date >= monthStart && date < nextMonthStart,
  ).length;

  const topCustomersBySpend = Object.entries(customerSpendMap)
    .map(([phone, data]) => ({
      phone,
      name: data.name,
      spend: data.spend,
      orders: customerOrderCount[phone] || 0,
    }))
    .sort((a, b) => b.spend - a.spend)
    .slice(0, 10);

  const ordersByGovernorate = ["Alexandria", "Cairo", "Giza", "Other"].map(
    (name) => ({
      governorate: name,
      orders: governorateMap[name] || 0,
    }),
  );

  const preferenceByGovernorate = ["Alexandria", "Cairo", "Giza", "Other"].map(
    (name) => ({
      governorate: name,
      cod: governoratePaymentMap[name]?.cod || 0,
      online: governoratePaymentMap[name]?.online || 0,
    }),
  );

  // Marketing events data
  const allEvents = await prisma.analyticsEvent.findMany({
    orderBy: { createdAt: "asc" },
  });
  const recentEvents = allEvents.filter((e) => e.createdAt >= ninetyDaysStart);

  const eventBreakdown: Record<string, number> = {};
  const dailyEventsMap: Record<string, number> = {};
  for (let i = 0; i < 90; i += 1) {
    const d = addDays(ninetyDaysStart, i);
    dailyEventsMap[dayKey(d)] = 0;
  }
  for (const event of recentEvents) {
    eventBreakdown[event.event] = (eventBreakdown[event.event] || 0) + 1;
    const key = dayKey(event.createdAt);
    if (dailyEventsMap[key] !== undefined) {
      dailyEventsMap[key] += 1;
    }
  }

  const dailyEvents = Object.entries(dailyEventsMap).map(([date, count]) => ({
    date,
    label: date.slice(5),
    count,
  }));

  const marketingEvents = await prisma.marketingEvent.findMany({
    orderBy: { sentAt: "desc" },
    take: 50,
  });

  return {
    revenue: {
      totalAllTime: totalRevenueAllTime,
      totalThisMonth: revenueThisMonth,
      totalThisWeek: revenueThisWeek,
      monthVsLastMonthPercent: percentChange(
        revenueThisMonth,
        revenueLastMonth,
      ),
      averageOrderValue: avgOrderValue,
      byPaymentMethod: {
        cod: codRevenue,
        online: onlineRevenue,
      },
      dailyRevenue,
    },
    orders: {
      totalAllTime: totalOrdersAllTime,
      totalThisMonth: totalOrdersThisMonth,
      totalThisWeek: totalOrdersThisWeek,
      totalToday: totalOrdersToday,
      statusBreakdown: Object.entries(statusMap).map(([status, count]) => ({
        status,
        count,
      })),
      cancellationRate: totalOrdersAllTime
        ? (cancelledCount / totalOrdersAllTime) * 100
        : 0,
      returnRate: totalOrdersAllTime
        ? (returnCount / totalOrdersAllTime) * 100
        : 0,
      peakHours: Array.from({ length: 24 }, (_, hour) => ({
        hour: `${hour.toString().padStart(2, "0")}:00`,
        orders: hourlyMap[hour] || 0,
      })),
      peakDays: Array.from({ length: 7 }, (_, day) => ({
        day: DAY_NAMES[day],
        orders: weekdayMap[day] || 0,
      })),
    },
    products: {
      bestSelling,
      worstPerforming,
      sizeDistribution,
      lowStockAlerts: lowStockAlerts.map((item) => ({
        id: item.id,
        name: item.name,
        stock: item.totalStock,
      })),
      outOfStock: outOfStock.map((item) => ({
        id: item.id,
        name: item.name,
        stock: item.totalStock,
      })),
      estimatedLostRevenue,
    },
    customers: {
      totalUnique: uniqueCustomers,
      repeatCustomerRate,
      newCustomersThisMonth,
      topCustomersBySpend,
      ordersByGovernorate,
      preferenceByGovernorate,
    },
    marketing: {
      totalEvents: allEvents.length,
      recentEvents: recentEvents.length,
      eventBreakdown: Object.entries(eventBreakdown)
        .sort(([, a], [, b]) => b - a)
        .map(([event, count]) => ({ event, count })),
      dailyEvents,
      recentMarketingEvents: marketingEvents.map((e) => ({
        id: e.id,
        eventName: e.eventName,
        sentAt: e.sentAt.toISOString(),
        success: e.success,
      })),
    },
  };
}
