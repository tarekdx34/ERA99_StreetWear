"use client";

import { useCallback, useEffect, useState } from "react";
import { getAttributionCookieName, type AttributionData } from "@/lib/attribution";

function getCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp(`(^| )${name}=([^;]+)`));
  return match?.[2] || null;
}

export function useAttribution() {
  const [attribution, setAttribution] = useState<AttributionData | null>(null);

  useEffect(() => {
    const cookieValue = getCookie(getAttributionCookieName());
    if (cookieValue) {
      try {
        setAttribution(JSON.parse(decodeURIComponent(cookieValue)));
      } catch {
        setAttribution(null);
      }
    }
  }, []);

  const getSource = useCallback((): string => {
    if (!attribution) return "direct";
    if (attribution.source) return attribution.source;
    if (attribution.fbclid) return "facebook";
    if (attribution.gclid) return "google";
    if (attribution.ttclid) return "tiktok";
    return "direct";
  }, [attribution]);

  const getCampaign = useCallback((): string | undefined => {
    return attribution?.campaign;
  }, [attribution]);

  return { attribution, getSource, getCampaign };
}
