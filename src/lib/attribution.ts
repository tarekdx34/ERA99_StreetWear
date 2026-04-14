const ATTRIBUTION_COOKIE_NAME = "qutb_attribution";
const ATTRIBUTION_MAX_AGE = 60 * 60 * 24 * 90; // 90 days for attribution window

const UTM_PARAMS = ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term"];
const CLICK_IDS = ["fbclid", "gclid", "ttclid", "msclkid"];

export type AttributionData = {
  source?: string;
  medium?: string;
  campaign?: string;
  content?: string;
  term?: string;
  fbclid?: string;
  gclid?: string;
  ttclid?: string;
  msclkid?: string;
  firstVisitAt: string;
  landingPage?: string;
};

export function extractAttributionFromUrl(url: string): AttributionData {
  const parsed = new URL(url, "https://dummy.base");
  const attribution: AttributionData = {
    firstVisitAt: new Date().toISOString(),
    landingPage: parsed.pathname + parsed.search,
  };

  for (const param of UTM_PARAMS) {
    const value = parsed.searchParams.get(param);
    if (value) {
      (attribution as any)[param.replace("utm_", "")] = value;
    }
  }

  for (const clickId of CLICK_IDS) {
    const value = parsed.searchParams.get(clickId);
    if (value) {
      (attribution as any)[clickId] = value;
    }
  }

  return attribution;
}

export function hasAttribution(data: AttributionData): boolean {
  return !!(
    data.source ||
    data.campaign ||
    data.fbclid ||
    data.gclid ||
    data.ttclid ||
    data.msclkid
  );
}

export function getAttributionCookieName(): string {
  return ATTRIBUTION_COOKIE_NAME;
}

export function getAttributionMaxAge(): number {
  return ATTRIBUTION_MAX_AGE;
}
