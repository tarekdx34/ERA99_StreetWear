"use client";

import { useConsent } from "@/contexts/consent-context";
import { useCallback } from "react";

declare global {
  interface Window {
    fbq?: (...args: any[]) => void;
  }
}

export function useMetaPixel() {
  const consent = useConsent();

  const track = useCallback((event: string, data?: Record<string, any>) => {
    if (!consent.marketing) return;
    if (typeof window === "undefined" || typeof window.fbq !== "function") return;
    window.fbq("track", event, data || {});
  }, [consent.marketing]);

  return { track };
}
