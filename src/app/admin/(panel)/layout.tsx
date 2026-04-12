import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth-options";
import { getSessionVersion } from "@/lib/admin-security";
import { prisma } from "@/lib/prisma";
import { AdminShell } from "@/components/admin/admin-shell";

export default async function AdminPanelLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect("/admin/login");
  }

  const currentVersion = await getSessionVersion();
  const sessionVersion = String((session.user as any).sessionVersion || "0");

  if (sessionVersion !== currentVersion) {
    redirect("/admin/login?expired=1");
  }

  const pendingOrdersCount = await prisma.order.count({
    where: {
      orderStatus: { in: ["pending_confirmation", "pending_payment"] },
    },
  });

  return (
    <AdminShell
      username={String((session.user as any).username || session.user.name || "admin")}
      pendingOrdersCount={pendingOrdersCount}
      unreadCount={0}
      notifications={[]}
    >
      {children}
    </AdminShell>
  );
}
