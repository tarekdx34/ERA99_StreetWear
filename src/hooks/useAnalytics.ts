"use client";

import { useConsent } from "@/contexts/consent-context";
import { useCallback } from "react";

declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
  }
}

export function useAnalytics() {
  const consent = useConsent();

  const trackEvent = useCallback((name: string, params?: Record<string, any>) => {
    const payload = params || {};

    void fetch("/api/analytics/event", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        event: name,
        page:
          typeof window !== "undefined"
            ? window.location.pathname + window.location.search
            : undefined,
        value: typeof payload.value === "number" ? payload.value : undefined,
        data: payload,
      }),
    }).catch(() => undefined);

    if (!consent.analytics) return;
    if (typeof window === "undefined" || typeof window.gtag !== "function") return;
    window.gtag("event", name, payload);
  }, [consent.analytics]);

  return { trackEvent };
}
