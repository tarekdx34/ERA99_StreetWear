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

export async function getAdsAnalyticsData() {
  const now = new Date();
  const thirtyDaysStart = startOfDay(addDays(now, -29));
  const sevenDaysStart = startOfDay(addDays(now, -6));

  // Meta events from marketing_events table
  const allMetaEvents = await prisma.marketingEvent.findMany({
    orderBy: { sentAt: "asc" },
  });

  const recentMetaEvents = allMetaEvents.filter((e) => e.createdAt >= thirtyDaysStart);

  // Daily Meta events
  const dailyMetaMap: Record<string, Record<string, number>> = {};
  for (let i = 0; i < 30; i += 1) {
    const d = addDays(thirtyDaysStart, i);
    dailyMetaMap[dayKey(d)] = {};
  }
  for (const event of recentMetaEvents) {
    const key = dayKey(event.sentAt);
    if (dailyMetaMap[key]) {
      dailyMetaMap[key][event.eventName] = (dailyMetaMap[key][event.eventName] || 0) + 1;
    }
  }

  const dailyMeta = Object.entries(dailyMetaMap).map(([date, events]) => ({
    date,
    label: date.slice(5),
    total: Object.values(events).reduce((s, v) => s + v, 0),
    ...events,
  }));

  // Event type breakdown
  const metaBreakdown: Record<string, number> = {};
  for (const e of recentMetaEvents) {
    metaBreakdown[e.eventName] = (metaBreakdown[e.eventName] || 0) + 1;
  }

  // Attribution: events from ads (fbclid, gclid sources)
  const allEvents = await prisma.analyticsEvent.findMany({
    where: { createdAt: { gte: thirtyDaysStart } },
  });

  const adAttributedEvents = allEvents.filter((e) => {
    const attr = e.attribution as Record<string, any> | null;
    if (!attr) return false;
    return attr.fbclid || attr.gclid || attr.ttclid || attr.msclkid || attr.source === "facebook" || attr.source === "google";
  });

  const purchaseFromAds = adAttributedEvents.filter((e) => e.event === "purchase");
  const totalAdRevenue = purchaseFromAds.reduce((sum, e) => sum + (e.value || 0), 0);

  // Revenue by source
  const revenueBySource: Record<string, number> = {};
  for (const e of adAttributedEvents) {
    const attr = e.attribution as Record<string, any> | null;
    const source = attr?.source || (attr?.fbclid ? "facebook" : attr?.gclid ? "google" : attr?.ttclid ? "tiktok" : "other");
    if (e.event === "purchase") {
      revenueBySource[source] = (revenueBySource[source] || 0) + (e.value || 0);
    }
  }

  // Success rate of CAPI events
  const successCount = recentMetaEvents.filter((e) => e.success).length;
  const failCount = recentMetaEvents.filter((e) => !e.success).length;
  const successRate = recentMetaEvents.length > 0 ? (successCount / recentMetaEvents.length) * 100 : 0;

  return {
    meta: {
      total: recentMetaEvents.length,
      successCount,
      failCount,
      successRate,
      breakdown: Object.entries(metaBreakdown)
        .sort(([, a], [, b]) => b - a)
        .map(([event, count]) => ({ event, count })),
      dailyMeta,
    },
    attribution: {
      adAttributedEvents: adAttributedEvents.length,
      purchaseFromAds: purchaseFromAds.length,
      totalAdRevenue,
      revenueBySource: Object.entries(revenueBySource)
        .sort(([, a], [, b]) => b - a)
        .map(([source, revenue]) => ({ source, revenue })),
    },
  };
}
