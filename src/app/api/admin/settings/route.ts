import { NextResponse } from "next/server";

import { z } from "zod";

import { requireAdminRole } from "@/lib/admin-security";
import {
  getAdminSettings,
  saveAdminSettings,
  toSafeAdminSettings,
} from "@/lib/admin-settings";

const settingsSchema = z.object({
  storeName: z.string().min(1),
  adminTelegramChatId: z.string(),
  notificationEmail: z.string(),
  orderNumberPrefix: z.string().min(1),
  currency: z.literal("EGP"),
  cloudinaryUrl: z.string(),
  telegramBotToken: z.string(),
  telegramChatId: z.string(),

  freeDeliveryGovernorate: z.string().min(1),
  deliveryFees: z.array(
    z.object({ governorate: z.string().min(1), fee: z.number().nonnegative() }),
  ),
  minimumOrderForFreeDelivery: z.number().nonnegative(),

  telegramNotificationsEnabled: z.boolean(),
  browserNotificationsEnabled: z.boolean(),
  newOrderSoundEnabled: z.boolean(),
  lowStockAlertThreshold: z.number().int().positive(),
  lowStockTelegramAlertEnabled: z.boolean(),
  dashboardPaymentFailureWarningRate: z.number().positive(),
  dashboardPaymentFailureCriticalRate: z.number().positive(),
  dashboardStaleConfirmationWarningCount: z.number().int().positive(),
  dashboardStaleConfirmationCriticalCount: z.number().int().positive(),
  dashboardSecurityWarningCount: z.number().int().positive(),
  dashboardSecurityCriticalCount: z.number().int().positive(),

  showAnnouncementStrip: z.boolean(),
  announcementStripText: z.string(),
  maintenanceMode: z.boolean(),
});

export async function GET() {
  const auth = await requireAdminRole();
  if (!auth.ok)
    return NextResponse.json(
      { message: auth.message },
      { status: auth.status },
    );

  const settings = await getAdminSettings();
  return NextResponse.json(toSafeAdminSettings(settings));
}

export async function PATCH(req: Request) {
  const auth = await requireAdminRole();
  if (!auth.ok)
    return NextResponse.json(
      { message: auth.message },
      { status: auth.status },
    );

  try {
    const payload = settingsSchema.parse(await req.json());
    const saved = await saveAdminSettings(payload);
    return NextResponse.json(toSafeAdminSettings(saved));
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: "Invalid settings payload" },
        { status: 400 },
      );
    }
    return NextResponse.json(
      { message: "Failed to save settings" },
      { status: 500 },
    );
  }
}
