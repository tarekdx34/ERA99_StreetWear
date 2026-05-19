import type { MetadataRoute } from "next";
import { isEarlyAccessActive } from "@/lib/early-access";

export default async function robots(): Promise<MetadataRoute.Robots> {
  const earlyAccessActive = await isEarlyAccessActive();
  return {
    rules: {
      userAgent: "*",
      allow: earlyAccessActive ? ["/", "/early-access"] : "/",
      disallow: earlyAccessActive
        ? ["/admin/", "/api/"]
        : ["/admin/", "/api/", "/early-access"],
    },
    sitemap: "https://qutb.studio/sitemap.xml",
  };
}
