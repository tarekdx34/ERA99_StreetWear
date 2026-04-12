import { AdminCustomersTable } from "@/components/admin/admin-customers-table";
import { getAdminCustomersData } from "@/lib/admin-customers";

export default async function AdminCustomersPage() {
  const customers = await getAdminCustomersData();

  return <AdminCustomersTable customers={customers} />;
}
