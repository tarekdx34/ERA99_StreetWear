import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth-options";
import { getSessionVersion } from "@/lib/admin-security";
import { getAdminSettings, saveAdminSettings } from "@/lib/admin-settings";

const settingsSchema = z.object({
  storeName: z.string().min(1),
  adminWhatsappNumber: z.string(),
  notificationEmail: z.string(),
  orderNumberPrefix: z.string().min(1),
  currency: z.literal("EGP"),
  cloudinaryUrl: z.string(),
  twilioAccountSid: z.string(),
  twilioAuthToken: z.string(),
  twilioWhatsappFrom: z.string(),

  freeDeliveryGovernorate: z.string().min(1),
  deliveryFees: z.array(
    z.object({ governorate: z.string().min(1), fee: z.number().nonnegative() }),
  ),
  minimumOrderForFreeDelivery: z.number().nonnegative(),

  whatsappNotificationsEnabled: z.boolean(),
  browserNotificationsEnabled: z.boolean(),
  newOrderSoundEnabled: z.boolean(),
  lowStockAlertThreshold: z.number().int().positive(),
  lowStockWhatsappAlertEnabled: z.boolean(),
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

async function ensureAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return { ok: false as const, status: 401, message: "Unauthorized" };
  }

  const currentVersion = await getSessionVersion();
  const sessionVersion = String((session.user as any).sessionVersion || "0");
  if (sessionVersion !== currentVersion) {
    return { ok: false as const, status: 401, message: "Session expired" };
  }

  return { ok: true as const };
}

export async function GET() {
  const auth = await ensureAdmin();
  if (!auth.ok)
    return NextResponse.json(
      { message: auth.message },
      { status: auth.status },
    );

  const settings = await getAdminSettings();
  return NextResponse.json(settings);
}

export async function PATCH(req: Request) {
  const auth = await ensureAdmin();
  if (!auth.ok)
    return NextResponse.json(
      { message: auth.message },
      { status: auth.status },
    );

  try {
    const payload = settingsSchema.parse(await req.json());
    const saved = await saveAdminSettings(payload);
    return NextResponse.json(saved);
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
