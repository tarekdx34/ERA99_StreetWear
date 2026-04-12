import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth-options";

export async function getShopperSessionUserId() {
  const session = await getServerSession(authOptions);
  const role = (session?.user as any)?.role;
  const userId = (session?.user as any)?.id as string | undefined;

  if (!session?.user || role !== "shopper" || !userId) return null;
  return userId;
}
