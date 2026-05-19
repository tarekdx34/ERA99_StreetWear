import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ProductDetailClient } from "@/components/product-detail-client";
import { getCatalogProductBySlug, getCatalogProducts } from "@/lib/catalog";
import { formatEGP } from "@/lib/utils";

type ProductPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getCatalogProductBySlug(slug);
  if (!product) return {};

  return {
    title: `${product.name} — QUTB | ${product.color} | Alexandria Streetwear`,
    description: `${product.name} in ${product.color}. ${product.weightGsm} GSM garment dyed cotton. Enzyme washed. Built in Alexandria. ${product.price} EGP. ERA 99.`,
    alternates: {
      canonical: `https://qutb.studio/products/${product.slug}`,
    },
    openGraph: {
      title: `${product.name} — QUTB`,
      description: `${product.weightGsm} GSM. Garment dyed. ${formatEGP(product.price)}.`,
      images: product.images.map((image) => ({
        url: image,
        width: 1200,
        height: 1600,
        alt: `QUTB ${product.name} in ${product.color} — 100% COTTON garment dyed tee, ${product.price} EGP`,
      })),
    },
  };
}

export default async function ProductPage({
  params,
}: ProductPageProps) {
  const { slug } = await params;
  const product = await getCatalogProductBySlug(slug);

  if (!product) notFound();

  const allProducts = await getCatalogProducts();
  const relatedProducts = allProducts
    .filter((item) => item.id !== product.id)
    .slice(0, 4);

  const inStock = Object.values(product.stockBySize).some(Boolean);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([
            {
              "@context": "https://schema.org",
              "@type": "Product",
              name: product.name,
              description: `${product.name} in ${product.color}. ${product.weightGsm} GSM garment dyed cotton. Enzyme washed. Built in Alexandria.`,
              image: product.images.map((image) => `https://qutb.studio${image}`),
              brand: { "@type": "Brand", name: "QUTB" },
              material: "100% Cotton, 100% COTTON Garment Dyed",
              offers: {
                "@type": "Offer",
                priceCurrency: "EGP",
                price: product.price,
                availability: inStock
                  ? "https://schema.org/InStock"
                  : "https://schema.org/OutOfStock",
                seller: { "@type": "Organization", name: "QUTB" },
              },
            },
            {
              "@context": "https://schema.org",
              "@type": "BreadcrumbList",
              itemListElement: [
                {
                  "@type": "ListItem",
                  position: 1,
                  name: "Home",
                  item: "https://qutb.studio",
                },
                {
                  "@type": "ListItem",
                  position: 2,
                  name: "Shop",
                  item: "https://qutb.studio/shop",
                },
                {
                  "@type": "ListItem",
                  position: 3,
                  name: product.name,
                  item: `https://qutb.studio/products/${product.slug}`,
                },
              ],
            },
          ]),
        }}
      />
      <ProductDetailClient product={product} relatedProducts={relatedProducts} />
    </>
  );
}
