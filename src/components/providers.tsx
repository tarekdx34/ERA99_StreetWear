"use client";

import { CartProvider } from "@/contexts/cart-context";
import { ConsentProvider } from "@/contexts/consent-context";
import { CookieConsentBanner } from "@/components/cookie-consent-banner";
import { GoogleAnalyticsGate } from "@/components/google-analytics";
import MetaPixel from "@/components/MetaPixel";
import { RouteTracking } from "@/components/route-tracking";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ConsentProvider>
      <CartProvider>
        {children}
        <RouteTracking />
        <GoogleAnalyticsGate />
        <MetaPixel />
        <CookieConsentBanner />
      </CartProvider>
    </ConsentProvider>
  );
}
