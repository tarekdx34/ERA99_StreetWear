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

export async function getMarketingAnalyticsData() {
  const now = new Date();
  const thirtyDaysStart = startOfDay(addDays(now, -29));
  const sevenDaysStart = startOfDay(addDays(now, -6));

  // Get all analytics events
  const allEvents = await prisma.analyticsEvent.findMany({
    orderBy: { createdAt: "asc" },
  });

  // Events in last 30 days
  const recentEvents = allEvents.filter((e) => e.createdAt >= thirtyDaysStart);

  // Event type breakdown
  const eventBreakdown: Record<string, number> = {};
  const recentEventBreakdown: Record<string, number> = {};
  for (const event of allEvents) {
    eventBreakdown[event.event] = (eventBreakdown[event.event] || 0) + 1;
  }
  for (const event of recentEvents) {
    recentEventBreakdown[event.event] = (recentEventBreakdown[event.event] || 0) + 1;
  }

  // Events per day chart
  const dailyEventsMap: Record<string, Record<string, number>> = {};
  for (let i = 0; i < 30; i += 1) {
    const d = addDays(thirtyDaysStart, i);
    dailyEventsMap[dayKey(d)] = {};
  }
  for (const event of recentEvents) {
    const key = dayKey(event.createdAt);
    if (dailyEventsMap[key]) {
      dailyEventsMap[key][event.event] = (dailyEventsMap[key][event.event] || 0) + 1;
    }
  }

  const dailyEvents = Object.entries(dailyEventsMap).map(([date, events]) => ({
    date,
    label: date.slice(5),
    ...events,
  }));

  // Attribution / traffic sources
  const sourceBreakdown: Record<string, number> = {};
  const campaignBreakdown: Record<string, number> = {};
  for (const event of allEvents) {
    const attr = event.attribution as Record<string, any> | null;
    if (attr) {
      const source = attr.source || (attr.fbclid ? "facebook" : attr.gclid ? "google" : attr.ttclid ? "tiktok" : "direct");
      sourceBreakdown[source] = (sourceBreakdown[source] || 0) + 1;
      if (attr.campaign) {
        campaignBreakdown[attr.campaign] = (campaignBreakdown[attr.campaign] || 0) + 1;
      }
    } else {
      sourceBreakdown["direct"] = (sourceBreakdown["direct"] || 0) + 1;
    }
  }

  // Top pages
  const pageViews: Record<string, number> = {};
  for (const event of allEvents) {
    if (event.page) {
      pageViews[event.page] = (pageViews[event.page] || 0) + 1;
    }
  }
  const topPages = Object.entries(pageViews)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 15)
    .map(([page, views]) => ({ page, views }));

  // Search terms
  const searchTerms: Record<string, number> = {};
  for (const event of allEvents) {
    if (event.event === "search" && event.data) {
      try {
        const data = event.data as any;
        const term = data.search_term || data.search_string;
        if (term) {
          searchTerms[String(term)] = (searchTerms[String(term)] || 0) + 1;
        }
      } catch {
        // ignore
      }
    }
  }
  const topSearchTerms = Object.entries(searchTerms)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 20)
    .map(([term, count]) => ({ term, count }));

  // Marketing events (Meta CAPI)
  const marketingEvents = await prisma.marketingEvent.findMany({
    orderBy: { sentAt: "desc" },
    take: 100,
  });

  const metaEventBreakdown: Record<string, number> = {};
  for (const me of marketingEvents) {
    metaEventBreakdown[me.eventName] = (metaEventBreakdown[me.eventName] || 0) + 1;
  }

  const successCount = marketingEvents.filter((e) => e.success).length;
  const failCount = marketingEvents.filter((e) => !e.success).length;

  return {
    events: {
      total: allEvents.length,
      last30Days: recentEvents.length,
      last7Days: allEvents.filter((e) => e.createdAt >= sevenDaysStart).length,
      breakdown: Object.entries(eventBreakdown)
        .sort(([, a], [, b]) => b - a)
        .map(([event, count]) => ({ event, count })),
      recentBreakdown: Object.entries(recentEventBreakdown)
        .sort(([, a], [, b]) => b - a)
        .map(([event, count]) => ({ event, count })),
      dailyEvents,
    },
    attribution: {
      sources: Object.entries(sourceBreakdown)
        .sort(([, a], [, b]) => b - a)
        .map(([source, count]) => ({ source, count })),
      campaigns: Object.entries(campaignBreakdown)
        .sort(([, a], [, b]) => b - a)
        .map(([campaign, count]) => ({ campaign, count })),
    },
    pages: {
      topPages,
      topSearchTerms,
    },
    meta: {
      total: marketingEvents.length,
      successCount,
      failCount,
      breakdown: Object.entries(metaEventBreakdown)
        .sort(([, a], [, b]) => b - a)
        .map(([event, count]) => ({ event, count })),
      recent: marketingEvents.slice(0, 20).map((e) => ({
        id: e.id,
        eventName: e.eventName,
        sentAt: e.sentAt.toISOString(),
        success: e.success,
        statusCode: e.statusCode,
      })),
    },
  };
}
