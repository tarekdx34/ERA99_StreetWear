import { notFound } from "next/navigation";
import { ProductDetailClient } from "@/components/product-detail-client";
import { getCatalogProductBySlug, getCatalogProducts } from "@/lib/catalog";

export default async function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getCatalogProductBySlug(slug);

  if (!product) notFound();

  const allProducts = await getCatalogProducts();
  const relatedProducts = allProducts
    .filter((item) => item.id !== product.id)
    .slice(0, 4);

  return (
    <ProductDetailClient product={product} relatedProducts={relatedProducts} />
  );
}
