import Link from "next/link";
import { getAdminCatalogCardProducts } from "@/lib/catalog";
import { AdminProductsGrid } from "@/components/admin/admin-products-grid";

export default async function AdminProductsPage() {
  const products = await getAdminCatalogCardProducts();

  return (
    <section>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-blackletter text-4xl md:text-5xl">PRODUCTS</h1>
        <Link
          href="/admin/products/new"
          className="border border-[#EDE9E0]/25 px-4 py-2 text-xs uppercase tracking-[0.2em] text-[#EDE9E0]/85 hover:border-[#EDE9E0]/45"
        >
          + ADD PRODUCT
        </Link>
      </div>

      <p className="mt-3 text-sm text-[#EDE9E0]/70 md:mt-4">
        Manage product visibility, featured placement, and stock directly from
        cards.
      </p>

      <AdminProductsGrid products={products} />
    </section>
  );
}
