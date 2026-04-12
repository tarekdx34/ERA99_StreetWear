import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { AccountPageClient } from "@/components/account-page-client";
import { authOptions } from "@/lib/auth-options";

export default async function AccountPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user || (session.user as any).role !== "shopper") {
    redirect("/auth/login?next=/account");
  }

  return <AccountPageClient />;
}
