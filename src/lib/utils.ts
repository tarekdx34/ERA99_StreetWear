export function formatEGP(amount: number) {
  return `${amount.toFixed(0)} EGP`;
}

export function isEgyptPhone(value: string) {
  return /^(010|011|012|015)\d{8}$/.test(value);
}

export function orderNumberFromId(id: number) {
  return `99-${String(id).padStart(5, "0")}`;
}

export function orderNumberFromIdWithPrefix(id: number, prefix: string) {
  const cleanPrefix = (prefix || "99").trim() || "99";
  return `${cleanPrefix}-${String(id).padStart(5, "0")}`;
}

export type CloudinaryUrlParts = {
  cloudName: string;
  apiKey: string;
  apiSecret: string;
};

export function parseCloudinaryUrl(value: string): CloudinaryUrlParts | null {
  const raw = String(value || "").trim();
  if (!raw) return null;

  try {
    const parsed = new URL(raw);
    if (parsed.protocol !== "cloudinary:") return null;

    const cloudName = parsed.hostname;
    const apiKey = decodeURIComponent(parsed.username || "");
    const apiSecret = decodeURIComponent(parsed.password || "");

    if (!cloudName || !apiKey || !apiSecret) return null;
    return { cloudName, apiKey, apiSecret };
  } catch {
    return null;
  }
}
