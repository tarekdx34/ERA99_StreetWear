import { AdminFunnelAnalytics } from "@/components/admin/admin-funnel-analytics";
import { getFunnelAnalyticsData } from "@/lib/admin-funnel-analytics";

export default async function FunnelPage() {
  const data = await getFunnelAnalyticsData();
  return <AdminFunnelAnalytics data={data} />;
}
