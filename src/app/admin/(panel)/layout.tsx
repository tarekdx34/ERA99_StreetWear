import { redirect } from "next/navigation";
import { requireAdminRole } from "@/lib/admin-security";
import { prisma } from "@/lib/prisma";
import { AdminShell } from "@/components/admin/admin-shell";

export default async function AdminPanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const auth = await requireAdminRole();
  if (!auth.ok) {
    if (auth.status === 401 && auth.message === "Session expired") {
      redirect("/admin/login?expired=1");
    }
    redirect("/admin/login");
  }
  const session = auth.session;
  const username =
    typeof (session.user as Record<string, unknown>).username === "string"
      ? String((session.user as Record<string, unknown>).username)
      : session.user?.name || "admin";

  let pendingOrdersCount = 0;
  try {
    pendingOrdersCount = await prisma.order.count({
      where: {
        orderStatus: { in: ["pending_confirmation", "pending_payment"] },
      },
    });
  } catch {
    pendingOrdersCount = 0;
  }

  return (
    <AdminShell
      username={username}
      pendingOrdersCount={pendingOrdersCount}
      unreadCount={0}
      notifications={[]}
    >
      {children}
    </AdminShell>
  );
}
