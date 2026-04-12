import { prisma } from "@/lib/prisma";

export type DeliveryFeeRow = {
  governorate: string;
  fee: number;
};

export type AdminSettingsModel = {
  storeName: string;
  adminWhatsappNumber: string;
  notificationEmail: string;
  orderNumberPrefix: string;
  currency: "EGP";
  cloudinaryCloudName: string;
  cloudinaryUploadPreset: string;
  twilioAccountSid: string;
  twilioAuthToken: string;
  twilioWhatsappFrom: string;

  freeDeliveryGovernorate: string;
  deliveryFees: DeliveryFeeRow[];
  minimumOrderForFreeDelivery: number;

  whatsappNotificationsEnabled: boolean;
  browserNotificationsEnabled: boolean;
  newOrderSoundEnabled: boolean;
  lowStockAlertThreshold: number;
  lowStockWhatsappAlertEnabled: boolean;

  showAnnouncementStrip: boolean;
  announcementStripText: string;
  maintenanceMode: boolean;
};

const SETTINGS_KEY = "admin_settings_v1";

export const defaultSettings: AdminSettingsModel = {
  storeName: "QUTB 99",
  adminWhatsappNumber: process.env.ADMIN_WHATSAPP_TO || "",
  notificationEmail: "",
  orderNumberPrefix: "99",
  currency: "EGP",
  cloudinaryCloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "",
  cloudinaryUploadPreset: process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "",
  twilioAccountSid: process.env.TWILIO_ACCOUNT_SID || "",
  twilioAuthToken: process.env.TWILIO_AUTH_TOKEN || "",
  twilioWhatsappFrom: process.env.TWILIO_WHATSAPP_FROM || "",

  freeDeliveryGovernorate: "Alexandria",
  deliveryFees: [
    { governorate: "Alexandria", fee: 0 },
    { governorate: "Cairo", fee: 70 },
    { governorate: "Giza", fee: 70 },
    { governorate: "Other", fee: 90 },
  ],
  minimumOrderForFreeDelivery: 0,

  whatsappNotificationsEnabled: true,
  browserNotificationsEnabled: true,
  newOrderSoundEnabled: true,
  lowStockAlertThreshold: 10,
  lowStockWhatsappAlertEnabled: true,

  showAnnouncementStrip: true,
  announcementStripText:
    "QUTB - 99 - ALEXANDRIA - THE AXIS - NINETY NINE - EVERYTHING REVOLVES - 99",
  maintenanceMode: false,
};

function sanitize(raw: any): AdminSettingsModel {
  return {
    ...defaultSettings,
    ...raw,
    currency: "EGP",
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
