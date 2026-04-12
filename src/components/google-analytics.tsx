"use client";

import { GoogleAnalytics } from "@next/third-parties/google";
import { useConsent } from "@/contexts/consent-context";

export function GoogleAnalyticsGate() {
  const { analytics } = useConsent();
  const gaId = process.env.NEXT_PUBLIC_GA_ID;

  if (!analytics || !gaId) return null;
  return <GoogleAnalytics gaId={gaId} />;
}
