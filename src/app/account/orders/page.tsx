import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { AccountOrdersClient } from "@/components/account-orders-client";
import { authOptions } from "@/lib/auth-options";

export default async function AccountOrdersPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user || (session.user as any).role !== "shopper") {
    redirect("/auth/login?next=/account/orders");
  }

  return <AccountOrdersClient />;
}
