import { SixStreetLanding } from "@/components/landing/sixstreet-landing";
import { getHomepageCatalogProducts } from "@/lib/catalog";

export default async function HomePage() {
  const products = await getHomepageCatalogProducts();
  return <SixStreetLanding products={products} />;
}
