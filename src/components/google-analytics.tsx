"use client";

import { useEffect } from "react";
import { GoogleAnalytics } from "@next/third-parties/google";
import { useConsent } from "@/contexts/consent-context";

export function GoogleAnalyticsGate() {
  const { analytics, marketing, decided } = useConsent();
  const gaId = process.env.NEXT_PUBLIC_GA_ID;

  // Set default consent state on mount
  useEffect(() => {
    if (typeof window === "undefined" || typeof window.gtag !== "function") return;

    // Default: deny everything
    window.gtag("consent", "default", {
      analytics_storage: "denied",
      ad_storage: "denied",
      ad_user_data: "denied",
      ad_personalization: "denied",
      wait_for_update: 500,
    });
  }, []);

  // Update consent when user makes a decision
  useEffect(() => {
    if (!decided || typeof window === "undefined" || typeof window.gtag !== "function") return;

    window.gtag("consent", "update", {
      analytics_storage: analytics ? "granted" : "denied",
      ad_storage: marketing ? "granted" : "denied",
      ad_user_data: marketing ? "granted" : "denied",
      ad_personalization: marketing ? "granted" : "denied",
    });
  }, [decided, analytics, marketing]);

  if (!gaId) return null;
  return <GoogleAnalytics gaId={gaId} />;
}
