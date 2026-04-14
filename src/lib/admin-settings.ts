import { prisma } from "@/lib/prisma";

export type DeliveryFeeRow = {
  governorate: string;
  fee: number;
};

export type AdminSettingsModel = {
  storeName: string;
  adminTelegramChatId: string;
  notificationEmail: string;
  orderNumberPrefix: string;
  currency: "EGP";
  cloudinaryUrl: string;
  telegramBotToken: string;
  telegramChatId: string;

  freeDeliveryGovernorate: string;
  deliveryFees: DeliveryFeeRow[];
  minimumOrderForFreeDelivery: number;

  telegramNotificationsEnabled: boolean;
  browserNotificationsEnabled: boolean;
  newOrderSoundEnabled: boolean;
  lowStockAlertThreshold: number;
  lowStockTelegramAlertEnabled: boolean;

  dashboardPaymentFailureWarningRate: number;
  dashboardPaymentFailureCriticalRate: number;
  dashboardStaleConfirmationWarningCount: number;
  dashboardStaleConfirmationCriticalCount: number;
  dashboardSecurityWarningCount: number;
  dashboardSecurityCriticalCount: number;

  showAnnouncementStrip: boolean;
  announcementStripText: string;
  maintenanceMode: boolean;
};

const SETTINGS_KEY = "admin_settings_v1";

export const defaultSettings: AdminSettingsModel = {
  storeName: "QUTB",
  adminTelegramChatId: process.env.TELEGRAM_CHAT_ID || "",
  notificationEmail: "",
  orderNumberPrefix: "QTB",
  currency: "EGP",
  cloudinaryUrl: process.env.CLOUDINARY_URL || "",
  telegramBotToken: process.env.TELEGRAM_BOT_TOKEN || "",
  telegramChatId: process.env.TELEGRAM_CHAT_ID || "",

  freeDeliveryGovernorate: "Alexandria",
  deliveryFees: [
    { governorate: "Alexandria", fee: 0 },
    { governorate: "Cairo", fee: 70 },
    { governorate: "Giza", fee: 70 },
    { governorate: "Other", fee: 90 },
  ],
  minimumOrderForFreeDelivery: 0,

  telegramNotificationsEnabled: true,
  browserNotificationsEnabled: true,
  newOrderSoundEnabled: true,
  lowStockAlertThreshold: 10,
  lowStockTelegramAlertEnabled: true,

  dashboardPaymentFailureWarningRate: 10,
  dashboardPaymentFailureCriticalRate: 18,
  dashboardStaleConfirmationWarningCount: 4,
  dashboardStaleConfirmationCriticalCount: 10,
  dashboardSecurityWarningCount: 6,
  dashboardSecurityCriticalCount: 15,

  showAnnouncementStrip: true,
  announcementStripText:
    "QUTB — ERA 99 — DROP 001 — ALEXANDRIA",
  maintenanceMode: false,
};

function sanitize(raw: any): AdminSettingsModel {
  const cloudinaryUrl = String(raw?.cloudinaryUrl || "").trim();

  const paymentWarning = Math.max(
    1,
    Number(
      raw?.dashboardPaymentFailureWarningRate ??
        defaultSettings.dashboardPaymentFailureWarningRate,
    ),
  );
  const paymentCriticalRaw = Math.max(
    1,
    Number(
      raw?.dashboardPaymentFailureCriticalRate ??
        defaultSettings.dashboardPaymentFailureCriticalRate,
    ),
  );
  const paymentCritical = Math.max(paymentWarning, paymentCriticalRaw);

  const staleWarning = Math.max(
    1,
    Number(
      raw?.dashboardStaleConfirmationWarningCount ??
        defaultSettings.dashboardStaleConfirmationWarningCount,
    ),
  );
  const staleCriticalRaw = Math.max(
    1,
    Number(
      raw?.dashboardStaleConfirmationCriticalCount ??
        defaultSettings.dashboardStaleConfirmationCriticalCount,
    ),
  );
  const staleCritical = Math.max(staleWarning, staleCriticalRaw);

  const securityWarning = Math.max(
    1,
    Number(
      raw?.dashboardSecurityWarningCount ??
        defaultSettings.dashboardSecurityWarningCount,
    ),
  );
  const securityCriticalRaw = Math.max(
    1,
    Number(
      raw?.dashboardSecurityCriticalCount ??
        defaultSettings.dashboardSecurityCriticalCount,
    ),
  );
  const securityCritical = Math.max(securityWarning, securityCriticalRaw);

  return {
    ...defaultSettings,
    ...raw,
    currency: "EGP",
    cloudinaryUrl,
    dashboardPaymentFailureWarningRate: paymentWarning,
    dashboardPaymentFailureCriticalRate: paymentCritical,
    dashboardStaleConfirmationWarningCount: staleWarning,
    dashboardStaleConfirmationCriticalCount: staleCritical,
    dashboardSecurityWarningCount: securityWarning,
    dashboardSecurityCriticalCount: securityCritical,
    deliveryFees: Array.isArray(raw?.deliveryFees)
      ? raw.deliveryFees
          .map((item: any) => ({
            governorate: String(item?.governorate || "").trim(),
            fee: Number(item?.fee || 0),
          }))
          .filter((item: DeliveryFeeRow) => item.governorate)
      : defaultSettings.deliveryFees,
  };
}

export async function getAdminSettings() {
  const row = await prisma.setting.findUnique({
    where: { key: SETTINGS_KEY },
    select: { value: true },
  });

  if (!row?.value) {
    await prisma.setting.upsert({
      where: { key: SETTINGS_KEY },
      create: { key: SETTINGS_KEY, value: JSON.stringify(defaultSettings) },
      update: { value: JSON.stringify(defaultSettings) },
    });
    return defaultSettings;
  }

  try {
    return sanitize(JSON.parse(row.value));
  } catch {
    return defaultSettings;
  }
}

export async function saveAdminSettings(input: Partial<AdminSettingsModel>) {
  const current = await getAdminSettings();
  const next = sanitize({ ...current, ...input });

  await prisma.setting.upsert({
    where: { key: SETTINGS_KEY },
    create: { key: SETTINGS_KEY, value: JSON.stringify(next) },
    update: { value: JSON.stringify(next) },
  });

  return next;
}

export async function getPublicStorefrontSettings() {
  const full = await getAdminSettings();
  return {
    showAnnouncementStrip: full.showAnnouncementStrip,
    announcementStripText: full.announcementStripText,
    maintenanceMode: full.maintenanceMode,
    storeName: full.storeName,
    orderNumberPrefix: full.orderNumberPrefix,
  };
}
