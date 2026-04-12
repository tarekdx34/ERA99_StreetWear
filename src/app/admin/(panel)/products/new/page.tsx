import { AdminProductForm } from "@/components/admin/admin-product-form";
import { buildDefaultVariant, getCatalogCollections, type CatalogProduct } from "@/lib/catalog";

function createBlankProduct(): CatalogProduct {
  const now = new Date().toISOString();
  const id = `p-${Date.now()}`;
  return {
    id,
    slug: "",
    name: "",
    price: 0,
    compareAtPrice: null,
    collection: "Drop 001",
    shortDescription: "",
    fullDescription: "<p></p>",
    fabricComposition: "",
    fitType: "Boxy",
    careInstructions: "",
    weightGsm: 220,
    active: true,
    featured: false,
    newArrival: true,
    metaTitle: "",
    metaDescription: "",
    mainImageAlt: "",
    colorVariants: [buildDefaultVariant(id, "Default", "#F0EDE8")],
    createdAt: now,
    updatedAt: now,
  };
}

export default async function AdminNewProductPage() {
  const collections = await getCatalogCollections();
  const initial = createBlankProduct();
  if (collections.length > 0) {
    initial.collection = collections[0];
  }

  return (
    <section>
      <div className="mb-4">
        <p className="text-[12px] uppercase tracking-[0.28em] text-[#F0EDE8]/55">99 - PRODUCTS</p>
        <h1 className="mt-3 font-blackletter text-5xl">New Product</h1>
      </div>

      <AdminProductForm mode="new" initialProduct={initial} collections={collections} />
    </section>
  );
}
