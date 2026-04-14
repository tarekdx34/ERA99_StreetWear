import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { isDatabaseConfigured, prisma } from "@/lib/prisma";
import { orderNumberFromIdWithPrefix } from "@/lib/utils";
import { getAdminSettings } from "@/lib/admin-settings";
import { sendAdminTelegramNotification } from "@/lib/telegram";
import { getShopperSessionUserId } from "@/lib/shopper-auth";
import { requireCsrf } from "@/lib/csrf-middleware";

const itemSchema = z.object({
  productId: z.string(),
  slug: z.string(),
  name: z.string(),
  color: z.string(),
  size: z.string(),
  qty: z.number().int().positive(),
  unitPrice: z.number().positive(),
  image: z.string(),
});

const orderSchema = z.object({
  customerName: z.string().min(2),
  phone: z.string().regex(/^(010|011|012|015)\d{8}$/),
  governorate: z.string().min(2),
  city: z.string().min(2),
  address: z.string().min(2),
  building: z.string().optional().or(z.literal("")),
  notes: z.string().optional().or(z.literal("")),
  items: z.array(itemSchema).min(1),
  subtotal: z.number().nonnegative(),
  deliveryFee: z.number().nonnegative(),
  total: z.number().nonnegative(),
  paymentMethod: z.enum(["COD", "ONLINE"]),
});

export async function POST(req: NextRequest) {
  const csrfError = await requireCsrf(req);
  if (csrfError) return csrfError;

  try {
    if (!isDatabaseConfigured()) {
      return NextResponse.json(
        { message: "Server configuration error: DATABASE_URL is missing" },
        { status: 500 },
      );
    }

    const json = await req.json();
    const parsed = orderSchema.parse(json);
    const userId = await getShopperSessionUserId();

    const created = await prisma.order.create({
      data: {
        userId,
        orderNumber: "TEMP",
        customerName: parsed.customerName,
        phone: parsed.phone,
        governorate: parsed.governorate,
        city: parsed.city,
        address: parsed.address,
        building: parsed.building || null,
        notes: parsed.notes || null,
        items: parsed.items,
        subtotal: parsed.subtotal,
        deliveryFee: parsed.deliveryFee,
        total: parsed.total,
        paymentMethod: parsed.paymentMethod,
        paymentStatus: parsed.paymentMethod === "COD" ? "pending" : "initiated",
        orderStatus:
          parsed.paymentMethod === "COD"
            ? "pending_confirmation"
            : "pending_payment",
      },
    });

    const adminSettings = await getAdminSettings();
    const orderNumber = orderNumberFromIdWithPrefix(
      created.id,
      adminSettings.orderNumberPrefix,
    );
    const updated = await prisma.order.update({
      where: { id: created.id },
      data: { orderNumber },
    });

    await prisma.analyticsEvent.create({
      data: {
        event: "checkout_start",
        userId,
        orderId: updated.id,
        value: updated.total,
        page: "/checkout",
        data: {
          paymentMethod: parsed.paymentMethod,
          itemCount: parsed.items.length,
        },
      },
    });

    if (adminSettings.telegramNotificationsEnabled) {
      await sendAdminTelegramNotification(
        {
          id: updated.id,
          orderNumber: updated.orderNumber,
          customerName: updated.customerName,
          phone: updated.phone,
          governorate: updated.governorate,
          city: updated.city,
          address: updated.address,
          building: updated.building,
          notes: updated.notes,
          items: parsed.items.map((item) => ({
            name: item.name,
            color: item.color,
            size: item.size,
            qty: item.qty,
            unitPrice: item.unitPrice,
          })),
          subtotal: updated.subtotal,
          deliveryFee: updated.deliveryFee,
          total: updated.total,
          paymentMethod: updated.paymentMethod,
          createdAt: updated.createdAt?.toISOString(),
        },
        {
          botToken: adminSettings.telegramBotToken,
          chatId: adminSettings.telegramChatId,
        },
      );
    }

    return NextResponse.json({
      orderId: updated.id,
      orderNumber: updated.orderNumber,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { message: "Invalid or failed order submission" },
      { status: 400 },
    );
  }
}
