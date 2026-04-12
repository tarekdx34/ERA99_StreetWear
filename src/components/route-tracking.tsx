"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { useAnalytics } from "@/hooks/useAnalytics";

export function RouteTracking() {
  const pathname = usePathname();
  const { trackEvent } = useAnalytics();

  useEffect(() => {
    trackEvent("page_view", {
      page_path: pathname,
      page_title: typeof document !== "undefined" ? document.title : "",
    });
  }, [pathname, trackEvent]);

  return null;
}
