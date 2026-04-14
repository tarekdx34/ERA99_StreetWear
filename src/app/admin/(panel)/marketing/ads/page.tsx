import { AdminAdsDashboard } from "@/components/admin/admin-ads-dashboard";
import { getAdsAnalyticsData } from "@/lib/admin-ads-analytics";

export default async function AdsPage() {
  const data = await getAdsAnalyticsData();
  return <AdminAdsDashboard data={data} />;
}
