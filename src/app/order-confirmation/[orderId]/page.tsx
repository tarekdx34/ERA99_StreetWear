import { notFound } from "next/navigation";
import { isDatabaseConfigured, prisma } from "@/lib/prisma";
import { OrderConfirmationClient } from "@/components/order-confirmation-client";

export default async function OrderConfirmationPage({
  params,
}: {
  params: Promise<{ orderId: string }>;
}) {
  const { orderId } = await params;
  const id = Number(orderId);

  if (Number.isNaN(id)) notFound();
  if (!isDatabaseConfigured()) notFound();

  const order = await prisma.order.findUnique({ where: { id } });
  if (!order) notFound();

  return (
    <OrderConfirmationClient
      orderId={order.id}
      orderNumber={order.orderNumber}
      paymentStatus={order.paymentStatus}
      paymentMethod={order.paymentMethod}
      total={order.total}
      address={order.address}
      city={order.city}
      governorate={order.governorate}
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
