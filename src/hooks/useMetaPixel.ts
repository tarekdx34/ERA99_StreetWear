"use client";

import { useConsent } from "@/contexts/consent-context";
import { useCallback } from "react";

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
  }
}

export function useMetaPixel() {
  const consent = useConsent();

  const track = useCallback((event: string, data?: Record<string, unknown>) => {
    if (!consent.marketing) return;
    if (typeof window === "undefined") return;

    if (typeof window.fbq === "function") {
      window.fbq("track", event, data || {});
    }
  }, [consent.marketing]);

  return { track };
}
