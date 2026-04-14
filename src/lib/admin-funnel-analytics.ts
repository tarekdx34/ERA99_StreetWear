import { prisma } from "@/lib/prisma";

function startOfDay(date: Date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
}

function addDays(date: Date, days: number) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function dayKey(date: Date) {
  return date.toISOString().slice(0, 10);
}

export async function getFunnelAnalyticsData() {
  const now = new Date();
  const sevenDaysStart = startOfDay(addDays(now, -6));
  const thirtyDaysStart = startOfDay(addDays(now, -29));

  const allEvents = await prisma.analyticsEvent.findMany({
    orderBy: { createdAt: "asc" },
  });

  const funnelSteps = [
    "page_view",
    "view_item",
    "select_item",
    "add_to_cart",
    "view_cart",
    "begin_checkout",
    "add_shipping_info",
    "add_payment_info",
    "purchase",
  ];

  // Total counts per funnel step (all time)
  const funnelCounts: Record<string, number> = {};
  for (const step of funnelSteps) {
    funnelCounts[step] = 0;
  }
  for (const event of allEvents) {
    if (funnelCounts[event.event] !== undefined) {
      funnelCounts[event.event] += 1;
    }
  }

  // Last 30 days counts
  const recentFunnelCounts: Record<string, number> = {};
  for (const step of funnelSteps) {
    recentFunnelCounts[step] = 0;
  }
  const recentEvents = allEvents.filter((e) => e.createdAt >= thirtyDaysStart);
  for (const event of recentEvents) {
    if (recentFunnelCounts[event.event] !== undefined) {
      recentFunnelCounts[event.event] += 1;
    }
  }

  // Daily funnel for last 30 days
  const dailyFunnelMap: Record<string, Record<string, number>> = {};
  for (let i = 0; i < 30; i += 1) {
    const d = addDays(thirtyDaysStart, i);
    dailyFunnelMap[dayKey(d)] = {};
    for (const step of funnelSteps) {
      dailyFunnelMap[dayKey(d)][step] = 0;
    }
  }
  for (const event of recentEvents) {
    const key = dayKey(event.createdAt);
    if (dailyFunnelMap[key] && dailyFunnelMap[key][event.event] !== undefined) {
      dailyFunnelMap[key][event.event] += 1;
    }
  }

  const dailyFunnel = Object.entries(dailyFunnelMap).map(([date, counts]) => ({
    date,
    label: date.slice(5),
    ...counts,
  }));

  // Drop-off rates
  const dropoffRates: Array<{ step: string; count: number; rate: number; dropoffRate: number }> = [];
  const steps = funnelSteps.filter((s) => funnelCounts[s] > 0);
  for (let i = 0; i < steps.length; i++) {
    const step = steps[i];
    const count = funnelCounts[step];
    const prevCount = i === 0 ? count : funnelCounts[steps[i - 1]] || count;
    const rate = prevCount > 0 ? (count / prevCount) * 100 : 0;
    dropoffRates.push({
      step,
      count,
      rate,
      dropoffRate: i === 0 ? 0 : 100 - rate,
    });
  }

  // Cart abandonment: users who added to cart but didn't purchase
  const addToCartUsers = new Set<string>();
  const purchaseUsers = new Set<string>();

  const addToCartEvents = allEvents.filter((e) => e.event === "add_to_cart");
  const purchaseEvents = allEvents.filter((e) => e.event === "purchase");

  for (const e of addToCartEvents) {
    if (e.userId) addToCartUsers.add(e.userId);
    if (e.sessionId) addToCartUsers.add(`anon_${e.sessionId}`);
  }
  for (const e of purchaseEvents) {
    if (e.userId) purchaseUsers.add(e.userId);
    if (e.sessionId) purchaseUsers.add(`anon_${e.sessionId}`);
  }

  const cartAbandoners = [...addToCartUsers].filter((u) => !purchaseUsers.has(u));
  const cartAbandonmentRate = addToCartUsers.size > 0
    ? (cartAbandoners.length / addToCartUsers.size) * 100
    : 0;

  // Recent cart abandoners (last 7 days)
  const recentAddToCart = addToCartEvents.filter((e) => e.createdAt >= sevenDaysStart);
  const recentPurchaseUserIds = new Set(
    purchaseEvents.filter((e) => e.createdAt >= sevenDaysStart).map((e) => e.userId || `anon_${e.sessionId}`)
  );

  const recentAbandoners = recentAddToCart
    .filter((e) => {
      const key = e.userId || `anon_${e.sessionId}`;
      return !recentPurchaseUserIds.has(key);
    })
    .map((e) => ({
      userId: e.userId,
      sessionId: e.sessionId,
      page: e.page,
      value: e.value,
      createdAt: e.createdAt.toISOString(),
      data: e.data,
    }));

  return {
    funnel: {
      steps: funnelSteps,
      counts: funnelSteps.map((step) => ({
        step,
        count: funnelCounts[step] || 0,
        recentCount: recentFunnelCounts[step] || 0,
      })),
      dropoffRates,
      dailyFunnel,
    },
    cartAbandonment: {
      totalCartUsers: addToCartUsers.size,
      totalPurchasers: purchaseUsers.size,
      abandoners: cartAbandoners.length,
      rate: cartAbandonmentRate,
      recentAbandoners: recentAbandoners.slice(0, 50),
    },
  };
}
