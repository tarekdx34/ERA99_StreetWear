import type { Metadata } from "next";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { Anton } from "next/font/google";
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

export const metadata: Metadata = {
  title: "QUTB — Not A Brand. A Position. | Alexandria, Egypt",
  description:
    "QUTB. 100% COTTON. Garment dyed. Enzyme washed. Built in Alexandria. ERA 99 — Drop 001. Everything revolves. We are the point it revolves around.",
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
    title: "QUTB — Not A Brand. A Position.",
    description:
      "100% COTTON. Garment dyed. Built in Alexandria. ERA 99 is live.",
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
    title: "QUTB — Not A Brand. A Position.",
    description: "100% COTTON. Garment dyed. Built in Alexandria.",
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
        <link rel="preload" as="style" href="https://fonts.googleapis.com/css2?family=Anton&text=QUTBERA0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ%20.&display=swap" />
        <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Anton&text=QUTBERA0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ%20.&display=swap" />
        <link rel="dns-prefetch" href="//fonts.googleapis.com" />
        <style>{`
          body{background:#080808;color:#EDE9E0;font-family:Arial,"Barlow Condensed",sans-serif}
          .font-anton,.font-blackletter,.display-hero{font-family:var(--font-anton-google),Anton,Arial,sans-serif;font-weight:400;text-transform:uppercase;letter-spacing:16px}
        `}</style>
      </head>
      <body
        suppressHydrationWarning
        className="min-h-full overflow-x-hidden bg-[#080808] text-[#EDE9E0]"
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
