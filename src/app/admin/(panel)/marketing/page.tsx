import { AdminMarketingDashboard } from "@/components/admin/admin-marketing-dashboard";
import { getMarketingAnalyticsData } from "@/lib/admin-marketing-analytics";

export default async function MarketingPage() {
  const data = await getMarketingAnalyticsData();
  return <AdminMarketingDashboard data={data} />;
}
