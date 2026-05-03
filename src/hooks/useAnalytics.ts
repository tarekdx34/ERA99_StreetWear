"use client";

import { useConsent } from "@/contexts/consent-context";
import { useCallback } from "react";

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

export function useAnalytics() {
  const consent = useConsent();

  const track = useCallback((name: string, params?: Record<string, unknown>) => {
    if (!consent.analytics) return;
    if (typeof window === "undefined" || typeof window.gtag !== "function") return;
    window.gtag("event", name, params);
  }, [consent.analytics]);

  return { track, trackEvent: track };
}
