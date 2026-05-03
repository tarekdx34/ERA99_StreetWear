import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { isDatabaseConfigured, prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth-options";
import { OrderConfirmationClient } from "@/components/order-confirmation-client";
import { verifySignedOrderToken } from "@/lib/order-tokens";

export default async function OrderConfirmationPage({
  params,
  searchParams,
}: {
  params: Promise<{ orderId: string }>;
  searchParams: Promise<{ token?: string }>;
}) {
  const { orderId } = await params;
  const { token } = await searchParams;
  const id = Number(orderId);

  if (Number.isNaN(id)) notFound();
  if (!isDatabaseConfigured()) notFound();

  const order = await prisma.order.findUnique({ where: { id } });
  if (!order) notFound();

  const session = await getServerSession(authOptions);
  const role = (session?.user as any)?.role;
  const userId = (session?.user as any)?.id as string | undefined;
  const isLoggedIn = role === "shopper";
  const isOwner = Boolean(userId && order.userId === userId);
  const hasValidToken = verifySignedOrderToken({
    token,
    purpose: "view",
    orderId: order.id,
    createdAt: order.createdAt,
  });

  if (!isOwner && !hasValidToken) {
    notFound();
  }

  return (
    <OrderConfirmationClient
      orderId={order.id}
      claimToken={token || ""}
      orderNumber={order.orderNumber}
      paymentStatus={order.paymentStatus}
      paymentMethod={order.paymentMethod}
      total={order.total}
      address={order.address}
      city={order.city}
      governorate={order.governorate}
      isLoggedIn={isLoggedIn}
      items={
        order.items as Array<{
          name: string;
          color: string;
          size: string;
          qty: number;
          unitPrice: number;
        }>
      }
    />
  );
}
