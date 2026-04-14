import { notFound } from "next/navigation";
import { AdminProductForm } from "@/components/admin/admin-product-form";
import {
  getCatalogCollections,
  getCatalogProductByIdRaw,
  getProductQuickStats,
} from "@/lib/catalog";

export default async function AdminEditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [product, collections, quickStats] = await Promise.all([
    getCatalogProductByIdRaw(id),
    getCatalogCollections(),
    getProductQuickStats(id),
  ]);

  if (!product) notFound();

  return (
    <section>
      <div className="mb-4">
        <p className="text-[12px] uppercase tracking-[0.28em] text-[#F0EDE8]/55">
          99 - PRODUCTS
        </p>
        <h1 className="mt-3 font-blackletter text-4xl md:text-5xl">Edit Product</h1>
      </div>

      <AdminProductForm
        mode="edit"
        initialProduct={product}
        collections={collections}
        quickStats={quickStats}
      />
    </section>
  );
}
