import type { Metadata } from "next";
import { Archivo_Black, Space_Grotesk } from "next/font/google";
import { headers } from "next/headers";
import "./globals.css";
import { Providers } from "@/components/providers";
import { SiteChrome } from "@/components/site-chrome";
import { getPublicStorefrontSettings } from "@/lib/admin-settings";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
});

const bigShoulders = Archivo_Black({
  variable: "--font-big-shoulders",
  weight: "400",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "6 STREET Ordering",
  description: "6 STREET 99 — Alexandria streetwear",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const requestHeaders = await headers();
  const isAdminArea = requestHeaders.get("x-admin-area") === "1";
  const pathname = requestHeaders.get("x-pathname") || "";
  const isApiRoute = pathname.startsWith("/api/");
  const publicSettings = await getPublicStorefrontSettings();
  const showMaintenance =
    publicSettings.maintenanceMode && !isAdminArea && !isApiRoute;

  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${spaceGrotesk.variable} ${bigShoulders.variable} h-full antialiased`}
    >
      <body
        suppressHydrationWarning
        className="min-h-full bg-[#080808] text-[#F0EDE8]"
      >
        <Providers>
          {!isAdminArea ? (
            <SiteChrome
              showAnnouncementStrip={publicSettings.showAnnouncementStrip}
              announcementText={publicSettings.announcementStripText}
            />
          ) : null}

          {showMaintenance ? (
            <main className="min-h-screen bg-[#080808] px-6 py-24 text-[#F0EDE8]">
              <div className="mx-auto max-w-2xl border border-[#F0EDE8]/15 bg-[#111111] p-8 text-center">
                <p className="font-blackletter display-logo text-6xl leading-none">
                  6 STREET
                </p>
                <p className="mt-2 text-xs uppercase tracking-[0.28em] text-[#F0EDE8]/55">
                  99
                </p>
                <h1 className="mt-8 text-xl uppercase tracking-[0.2em]">
                  Coming Soon
                </h1>
                <p className="mt-4 text-sm text-[#F0EDE8]/70">
                  {publicSettings.storeName} is currently in maintenance mode.
                  We are updating the store and will be back shortly.
                </p>
              </div>
            </main>
          ) : (
            children
          )}
        </Providers>
      </body>
    </html>
  );
}
