import { createHash } from "crypto";

type MetaEventName =
  | "PageView"
  | "ViewContent"
  | "AddToCart"
  | "InitiateCheckout"
  | "AddPaymentInfo"
  | "Purchase"
  | "Lead"
  | "CompleteRegistration"
  | "Search"
  | "Custom";

type MetaEventData = {
  event_name: MetaEventName;
  event_time: number;
  action_source: "website";
  event_source_url?: string;
  event_id?: string;
  user_data?: Record<string, string>;
  custom_data?: Record<string, any>;
};

type MetaPayload = {
  data: MetaEventData[];
  test_event_code?: string;
};

function hashValue(value: string | undefined): string | undefined {
  if (!value) return undefined;
  return createHash("sha256").update(value.trim().toLowerCase()).digest("hex");
}

function generateEventId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
}

export async function sendMetaEvents(
  events: Array<{
    eventName: MetaEventName;
    eventTime?: number;
    url?: string;
    userData?: {
      email?: string;
      phone?: string;
      firstName?: string;
      lastName?: string;
      clientIP?: string;
      clientUserAgent?: string;
      fbp?: string;
      fbc?: string;
    };
    customData?: Record<string, any>;
  }>,
): Promise<{ success: boolean; status: number; body: any }> {
  const accessToken = process.env.META_ACCESS_TOKEN;
  const pixelId = process.env.NEXT_PUBLIC_META_PIXEL_ID;

  if (!accessToken || !pixelId) {
    return { success: false, status: 0, body: { error: "Missing Meta credentials" } };
  }

  const payload: MetaPayload = {
    data: events.map((e) => {
      const userData: Record<string, string> = {};
      if (e.userData?.email) userData.em = hashValue(e.userData.email)!;
      if (e.userData?.phone) userData.ph = hashValue(e.userData.phone)!;
      if (e.userData?.firstName) userData.fn = hashValue(e.userData.firstName)!;
      if (e.userData?.lastName) userData.ln = hashValue(e.userData.lastName)!;
      if (e.userData?.clientIP) userData.client_ip_address = e.userData.clientIP;
      if (e.userData?.clientUserAgent) userData.client_user_agent = e.userData.clientUserAgent;
      if (e.userData?.fbp) userData.fbp = e.userData.fbp;
      if (e.userData?.fbc) userData.fbc = e.userData.fbc;

      return {
        event_name: e.eventName,
        event_time: e.eventTime || Math.floor(Date.now() / 1000),
        action_source: "website" as const,
        event_source_url: e.url,
        event_id: generateEventId(),
        user_data: Object.keys(userData).length > 0 ? userData : undefined,
        custom_data: e.customData,
      };
    }),
  };

  // Add test event code if in development
  if (process.env.NODE_ENV !== "production" && process.env.META_TEST_EVENT_CODE) {
    payload.test_event_code = process.env.META_TEST_EVENT_CODE;
  }

  try {
    const response = await fetch(
      `https://graph.facebook.com/v18.0/${pixelId}/events`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(payload),
      },
    );

    const body = await response.json();
    return { success: response.ok, status: response.status, body };
  } catch (error) {
    return {
      success: false,
      status: 0,
      body: { error: error instanceof Error ? error.message : "Unknown error" },
    };
  }
}
