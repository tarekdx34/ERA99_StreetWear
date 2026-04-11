import type { Metadata } from "next";
import { Space_Grotesk, UnifrakturMaguntia } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import { SiteChrome } from "@/components/site-chrome";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
});

const unifraktur = UnifrakturMaguntia({
  variable: "--font-unifraktur",
  weight: "400",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "QUTB Ordering",
  description: "QUTB streetwear ordering flow",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${spaceGrotesk.variable} ${unifraktur.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-[#080808] text-[#F0EDE8]">
        <Providers>
          <SiteChrome />
          {children}
        </Providers>
      </body>
    </html>
  );
}
