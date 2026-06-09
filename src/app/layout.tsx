import type { Metadata } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import {
  Anton,
  Bodoni_Moda,
  Cormorant_Garamond,
  DM_Sans,
  Gwendolyn,
} from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import { SiteChrome } from "@/components/site-chrome";
import { getPublicStorefrontSettings } from "@/lib/admin-settings";
import { getEarlyAccessState } from "@/lib/early-access";

const anton = Anton({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-anton-google",
  display: "swap",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500"],
  variable: "--font-dm-sans",
  display: "swap",
});

const bodoni = Bodoni_Moda({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-bodoni",
  display: "swap",
});

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  style: ["normal", "italic"],
  variable: "--font-cormorant",
  display: "swap",
});

const gwendolyn = Gwendolyn({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-gwendolyn",
  display: "swap",
});

export const metadata: Metadata = {
  title: "QUTB — Modern Mediterranean Essentials | Alexandria, Egypt",
  description:
    "QUTB makes modern Mediterranean essentials from cotton, craft, and the quiet rhythm of Alexandria.",
  metadataBase: new URL("https://qutb.studio"),
  alternates: {
    canonical: "https://qutb.studio",
    languages: {
      "en-EG": "https://qutb.studio",
      "ar-EG": "https://qutb.studio/ar",
      "x-default": "https://qutb.studio",
    },
  },
  openGraph: {
    title: "QUTB — Modern Mediterranean Essentials",
    description:
      "Quiet luxury essentials born by the Mediterranean in Alexandria.",
    url: "https://qutb.studio",
    siteName: "QUTB",
    images: [
      {
        url: "/og/homepage.jpg",
        width: 1200,
        height: 630,
        alt: "QUTB — Not A Brand. A Position.",
      },
    ],
    locale: "en_EG",
    alternateLocale: ["ar_EG"],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "QUTB — Modern Mediterranean Essentials",
    description: "Cotton essentials shaped by Alexandria and the sea.",
    images: ["/og/homepage.jpg"],
  },
  other: {
    "geo.region": "EG-ALX",
    "geo.placename": "Alexandria, Egypt",
    "geo.position": "31.2001;29.9187",
    ICBM: "31.2001, 29.9187",
    "description:ar":
      "QUTB. قطن 100%. مصبوغ بالكامل. مغسول بالإنزيم. صُنع في الإسكندرية. ERA 99 — Drop 001.",
  },
};

export const viewport = {
  themeColor: "#080808",
};
export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const requestHeaders = await headers();
  const pathname = requestHeaders.get("x-pathname") || "";
  const isAdminArea =
    requestHeaders.get("x-admin-area") === "1" ||
    pathname.startsWith("/admin");
  const isApiRoute = pathname.startsWith("/api/");
  const [publicSettings, earlyAccessState] = await Promise.all([
    getPublicStorefrontSettings(),
    getEarlyAccessState(),
  ]);
  const { dropModeActive, earlyAccessActive } = earlyAccessState;

  const isEarlyAccessPage = pathname === "/early-access";
  const isStaticAsset =
    pathname.startsWith("/_next/") || pathname.startsWith("/public/");
  const shouldRedirectToEarlyAccess =
    Boolean(pathname) &&
    earlyAccessActive &&
    !isAdminArea &&
    !isEarlyAccessPage &&
    !isApiRoute &&
    !isStaticAsset;

  if (shouldRedirectToEarlyAccess) {
    redirect("/early-access");
  }

  const showMaintenance =
    publicSettings.maintenanceMode && !isAdminArea && !isApiRoute;

  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`h-full antialiased ${anton.variable}`}
    >
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link rel="dns-prefetch" href="//fonts.googleapis.com" />
        <style>{`
          body{background:#FAF8F4;color:#111111;font-family:var(--font-dm-sans),Arial,sans-serif}
          .font-anton{font-family:var(--font-anton-google),Anton,Arial,sans-serif;font-weight:400;text-transform:uppercase;letter-spacing:0.12em}
          .font-blackletter,.display-hero{font-family:var(--font-bodoni),Georgia,serif;font-weight:500;letter-spacing:0}
        `}</style>
      </head>
      <body
        suppressHydrationWarning
        className={`min-h-full overflow-x-hidden bg-[#FAF8F4] text-[#111111] ${dmSans.variable} ${bodoni.variable} ${cormorant.variable} ${gwendolyn.variable} ${anton.variable}`}
      >
        <Providers>
          {!isAdminArea && !isEarlyAccessPage ? (
            <SiteChrome
              showAnnouncementStrip={publicSettings.showAnnouncementStrip}
              announcementText={publicSettings.announcementStripText}
              dropModeActive={dropModeActive}
            />
          ) : null}

          {showMaintenance ? (
            <main className="min-h-screen bg-[#080808] px-6 py-24 text-[#EDE9E0]">
              <div className="mx-auto max-w-2xl border border-[#EDE9E0]/15 bg-[#080808] p-8 text-center">
                <p className="font-anton text-6xl leading-none tracking-[16px] text-[#EDE9E0]">
                  QUTB
                </p>
                <p className="mt-2 text-xs uppercase tracking-[0.28em] text-[#555555]">
                  THE AXIS
                </p>
                <h1 className="mt-8 text-xl uppercase tracking-[0.2em]">
                  Coming Soon
                </h1>
                <p className="mt-4 text-sm text-[#EDE9E0]/70">
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
