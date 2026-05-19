import { QutbLanding } from "@/components/landing/qutb-landing";
import { getHomepageCatalogProducts } from "@/lib/catalog";

export default async function HomePage() {
  const products = await getHomepageCatalogProducts();
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify([
            {
              "@context": "https://schema.org",
              "@type": "Organization",
              name: "QUTB",
              url: "https://qutb.studio",
              logo: "https://qutb.studio/brand/qutb-logo-bone.png",
              foundingDate: "2026",
              address: {
                "@type": "PostalAddress",
                streetAddress: "Alexandria",
                addressCountry: "EG",
              },
              sameAs: [
                "https://instagram.com/qutbstudio",
                "https://tiktok.com/@qutbstudio",
              ],
            },
            {
              "@context": "https://schema.org",
              "@type": "WebSite",
              url: "https://qutb.studio",
              potentialAction: {
                "@type": "SearchAction",
                target: "https://qutb.studio/search?q={search_term_string}",
                "query-input": "required name=search_term_string",
              },
            },
          ]),
        }}
      />
      <QutbLanding products={products} />
    </>
  );
}
