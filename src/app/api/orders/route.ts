import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { isDatabaseConfigured, prisma } from "@/lib/prisma";
import { orderNumberFromIdWithPrefix } from "@/lib/utils";
import { getAdminSettings } from "@/lib/admin-settings";
import { sendAdminTelegramNotification } from "@/lib/telegram";
import { sendOrderConfirmation } from "@/lib/email";
import { getShopperSessionUserId } from "@/lib/shopper-auth";
import { requireCsrf } from "@/lib/csrf-middleware";
import { resolveOrderPricingAndItems, OrderValidationError } from "@/lib/order-checkout";
import { reserveInventoryForOrder } from "@/lib/catalog";
import { createSignedOrderToken } from "@/lib/order-tokens";
import { enforceRateLimit } from "@/lib/rate-limit";

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
  email: z.string().trim().toLowerCase().email().optional().or(z.literal("")),
  governorate: z.string().min(2),
  city: z.string().min(2),
  address: z.string().min(2),
  building: z.string().optional().or(z.literal("")),
  notes: z.string().optional().or(z.literal("")),
  items: z.array(itemSchema).min(1),
  paymentMethod: z.literal("COD"),
});

export async function POST(req: NextRequest) {
  const csrfError = await requireCsrf(req);
  if (csrfError) return csrfError;

  const rateLimitError = enforceRateLimit(req, {
    keyPrefix: "orders-create",
    limit: 10,
    windowMs: 10 * 60 * 1000,
  });
  if (rateLimitError) return rateLimitError;

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
    const pricing = await resolveOrderPricingAndItems({
      items: parsed.items,
      governorate: parsed.governorate,
    });

    const created = await prisma.$transaction(async (tx) => {
      await reserveInventoryForOrder(
        pricing.items.map((item) => ({
          productId: item.productId,
          size: item.size,
          qty: item.qty,
          color: item.color,
        })),
      );

      return tx.order.create({
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
          items: pricing.items,
          subtotal: pricing.subtotal,
          deliveryFee: pricing.deliveryFee,
          total: pricing.total,
          paymentMethod: "COD",
          paymentStatus: "pending",
          orderStatus: "pending_confirmation",
        },
      });
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
          paymentMethod: "COD",
          itemCount: pricing.items.length,
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
          items: pricing.items.map((item) => ({
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
      ).catch((error) => {
        console.error("[ORDER_TELEGRAM_ERROR]", error);
      });
    }

    if (parsed.email) {
      await sendOrderConfirmation({
        orderNumber: updated.orderNumber,
        customerName: updated.customerName,
        customerEmail: parsed.email,
        phone: updated.phone,
        address: updated.address,
        city: updated.city,
        governorate: updated.governorate,
        items: pricing.items.map((item) => ({
          name: item.name,
          size: item.size,
          quantity: item.qty,
          unitPrice: item.unitPrice,
        })),
        subtotal: updated.subtotal,
        deliveryFee: updated.deliveryFee,
        total: updated.total,
        notes: updated.notes || undefined,
      }).catch((error) => {
        console.error("[ORDER_EMAIL_ERROR]", error);
      });
    }

    return NextResponse.json({
      orderId: updated.id,
      orderNumber: updated.orderNumber,
      orderToken: createSignedOrderToken({
        purpose: "view",
        orderId: updated.id,
        createdAt: updated.createdAt,
        ttlSeconds: 60 * 60 * 24 * 7,
      }),
    });
  } catch (error) {
    if (error instanceof OrderValidationError) {
      return NextResponse.json(
        { message: error.message, code: error.code },
        { status: 409 },
      );
    }

    console.error(error);
    return NextResponse.json(
      { message: "Invalid or failed order submission" },
      { status: 400 },
    );
  }
}
