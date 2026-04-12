import { AdminAnalyticsDashboard } from "@/components/admin/admin-analytics-dashboard";
import { getAdminAnalyticsData } from "@/lib/admin-analytics";

export default async function AdminAnalyticsPage() {
  const data = await getAdminAnalyticsData();

  return <AdminAnalyticsDashboard data={data} />;
}
