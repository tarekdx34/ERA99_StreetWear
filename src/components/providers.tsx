"use client";

import { usePathname } from "next/navigation";
import { CartProvider } from "@/contexts/cart-context";
import { ConsentProvider } from "@/contexts/consent-context";
import { CookieConsentBanner } from "@/components/cookie-consent-banner";
import { GoogleAnalyticsGate } from "@/components/google-analytics";
import MetaPixel from "@/components/MetaPixel";
import { RouteTracking } from "@/components/route-tracking";

export function Providers({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdminRoute = pathname?.startsWith("/admin");

  return (
    <ConsentProvider>
      <CartProvider>
        {children}
        {!isAdminRoute ? <RouteTracking /> : null}
        {!isAdminRoute ? <GoogleAnalyticsGate /> : null}
        {!isAdminRoute ? <MetaPixel /> : null}
        <CookieConsentBanner />
      </CartProvider>
    </ConsentProvider>
  );
}
