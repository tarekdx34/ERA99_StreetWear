"use client";

import { useConsent } from "@/contexts/consent-context";
import { useCallback } from "react";

declare global {
  interface Window {
    fbq?: (...args: any[]) => void;
  }
}

function getFbp(): string | undefined {
  if (typeof document === "undefined") return undefined;
  const match = document.cookie.match(/_fbp=([^;]+)/);
  return match?.[1];
}

function getFbc(): string | undefined {
  if (typeof document === "undefined") return undefined;
  const match = document.cookie.match(/_fbc=([^;]+)/);
  return match?.[1];
}

export function useMetaPixel() {
  const consent = useConsent();

  const track = useCallback((event: string, data?: Record<string, any>) => {
    if (!consent.marketing) return;
    if (typeof window === "undefined") return;

    // Client-side pixel event
    if (typeof window.fbq === "function") {
      window.fbq("track", event, data || {});
    }

    // Server-side CAPI event
    const eventName = event as
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

    void fetch("/api/analytics/meta-event", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        events: [
          {
            eventName,
            url: window.location.href,
            userData: {
              clientIP: undefined, // Server will extract from request
              clientUserAgent: navigator.userAgent,
              fbp: getFbp(),
              fbc: getFbc(),
            },
            customData: data,
          },
        ],
      }),
    }).catch(() => undefined);
  }, [consent.marketing]);

  return { track };
}
