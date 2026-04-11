import { notFound } from "next/navigation";
import { ProductDetailClient } from "@/components/product-detail-client";
import { getProductBySlug } from "@/lib/products";

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = getProductBySlug(slug);

  if (!product) notFound();

  return <ProductDetailClient product={product} />;
}
