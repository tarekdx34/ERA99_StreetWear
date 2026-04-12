import { QutbLanding } from "@/components/landing/qutb-landing";
import { getHomepageCatalogProducts } from "@/lib/catalog";

export default async function HomePage() {
  const products = await getHomepageCatalogProducts();
  return <QutbLanding products={products} />;
}
