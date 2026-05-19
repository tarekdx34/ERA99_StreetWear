import { isDatabaseConfigured, markDatabaseUnavailable, prisma } from "@/lib/prisma";

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
const SECRET_MASK = "********";

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
  if (!isDatabaseConfigured()) return defaultSettings;

  let row: { value: string } | null = null;
  try {
    row = await prisma.setting.findUnique({
      where: { key: SETTINGS_KEY },
      select: { value: true },
    });
  } catch (error) {
    markDatabaseUnavailable(error);
    console.warn("Unable to read admin settings; using defaults.");
    return defaultSettings;
  }

  if (!row?.value) {
    try {
      await prisma.setting.upsert({
        where: { key: SETTINGS_KEY },
        create: { key: SETTINGS_KEY, value: JSON.stringify(defaultSettings) },
        update: { value: JSON.stringify(defaultSettings) },
      });
    } catch (error) {
      markDatabaseUnavailable(error);
      console.warn("Unable to initialize admin settings; skipping init.");
    }
    return defaultSettings;
  }

  try {
    return sanitize(JSON.parse(row.value));
  } catch {
    return defaultSettings;
  }
}

export async function saveAdminSettings(input: Partial<AdminSettingsModel>) {
  if (!isDatabaseConfigured()) {
    return sanitize({
      ...defaultSettings,
      ...input,
      cloudinaryUrl:
        input.cloudinaryUrl === undefined
          ? defaultSettings.cloudinaryUrl
          : input.cloudinaryUrl === SECRET_MASK
            ? defaultSettings.cloudinaryUrl
            : String(input.cloudinaryUrl).trim(),
      telegramBotToken:
        input.telegramBotToken === undefined
          ? defaultSettings.telegramBotToken
          : input.telegramBotToken === SECRET_MASK
            ? defaultSettings.telegramBotToken
            : String(input.telegramBotToken).trim(),
    });
  }

  const current = await getAdminSettings();
  const next = sanitize({
    ...current,
    ...input,
    cloudinaryUrl:
      input.cloudinaryUrl === undefined
        ? current.cloudinaryUrl
        : input.cloudinaryUrl === SECRET_MASK
          ? current.cloudinaryUrl
          : String(input.cloudinaryUrl).trim(),
    telegramBotToken:
      input.telegramBotToken === undefined
        ? current.telegramBotToken
        : input.telegramBotToken === SECRET_MASK
          ? current.telegramBotToken
          : String(input.telegramBotToken).trim(),
  });

  try {
    await prisma.setting.upsert({
      where: { key: SETTINGS_KEY },
      create: { key: SETTINGS_KEY, value: JSON.stringify(next) },
      update: { value: JSON.stringify(next) },
    });
  } catch (error) {
    markDatabaseUnavailable(error);
    console.warn("Unable to save admin settings; skipping write.");
  }

  return next;
}

export function toSafeAdminSettings(settings: AdminSettingsModel) {
  return {
    ...settings,
    cloudinaryUrl: settings.cloudinaryUrl ? SECRET_MASK : "",
    telegramBotToken: settings.telegramBotToken ? SECRET_MASK : "",
  };
}

export async function getPublicStorefrontSettings() {
  const full = await getAdminSettings();
  return {
    showAnnouncementStrip: full.showAnnouncementStrip,
    announcementStripText:
      process.env.ANNOUNCEMENT_TEXT || full.announcementStripText,
    maintenanceMode: full.maintenanceMode,
    storeName: full.storeName,
    orderNumberPrefix: full.orderNumberPrefix,
  };
}
