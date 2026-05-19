import { MetadataRoute } from "next";
import { getCatalogProducts } from "@/lib/catalog";
import { isEarlyAccessActive } from "@/lib/early-access";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [products, earlyAccessActive] = await Promise.all([
    getCatalogProducts().catch((error) => {
      console.error("Unable to build product sitemap entries", error);
      return [];
    }),
    isEarlyAccessActive(),
  ]);
  const base: MetadataRoute.Sitemap = [
    {
      url: "https://qutb.studio",
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: "https://qutb.studio/story",
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.9,
    },
    {
      url: "https://qutb.studio/era-99",
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: "https://qutb.studio/fabric",
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    },
  ];

  const productEntries = products.map((product) => ({
    url: `https://qutb.studio/product/${product.slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  if (earlyAccessActive) {
    base.push({
      url: "https://qutb.studio/early-access",
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.6,
    });
  }

  return [...base, ...productEntries];
}
