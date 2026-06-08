import { useState, useEffect } from "react";
import { CartProvider } from "./CartContext";
import { QutbNav } from "./components/QutbNav";
import { QutbHero } from "./components/QutbHero";
import { FabricFirst } from "./components/FabricFirst";
import { UniformCollection } from "./components/UniformCollection";
import { CottonJourney } from "./components/CottonJourney";
import { AlexandriaStory } from "./components/AlexandriaStory";
import { SaltJournal } from "./components/SaltJournal";
import { PackagingStory } from "./components/PackagingStory";
import { QutbFooter } from "./components/QutbFooter";
import { CollectionPage } from "./components/CollectionPage";
import { ProductPage } from "./components/ProductPage";
import { CottonJourneyPage } from "./components/CottonJourneyPage";
import { SaltJournalPage } from "./components/SaltJournalPage";
import { CartPage } from "./components/CartPage";
import { AlexandriaPage } from "./components/AlexandriaPage";
import { CartDrawer } from "./components/CartDrawer";
import { ManufacturingPage } from "./components/ManufacturingPage";
import { DesignPhilosophyPage } from "./components/DesignPhilosophyPage";
import { PackagingPage } from "./components/PackagingPage";
import { SustainabilityPage } from "./components/SustainabilityPage";
import { WholesalePage } from "./components/WholesalePage";
import { ContactPage } from "./components/ContactPage";
import { SignInPage } from "./components/SignInPage";
import { RegisterPage } from "./components/RegisterPage";
import { EarlyAccessPage } from "./components/EarlyAccessPage";
import { navigate } from "./nav";

type Page = "home" | "collection" | "product" | "journey" | "salt" | "cart" | "alex" | "manufacturing" | "philosophy" | "packaging" | "sustainability" | "wholesale" | "contact" | "signin" | "register" | "early";

function getPage(): Page {
  if (window.location.hash === "#collection") return "collection";
  if (window.location.hash === "#product") return "product";
  if (window.location.hash === "#journey") return "journey";
  if (window.location.hash === "#salt") return "salt";
  if (window.location.hash === "#cart") return "cart";
  if (window.location.hash === "#alex") return "alex";
  if (window.location.hash === "#manufacturing") return "manufacturing";
  if (window.location.hash === "#philosophy") return "philosophy";
  if (window.location.hash === "#packaging") return "packaging";
  if (window.location.hash === "#sustainability") return "sustainability";
  if (window.location.hash === "#wholesale") return "wholesale";
  if (window.location.hash === "#contact") return "contact";
  if (window.location.hash === "#signin") return "signin";
  if (window.location.hash === "#register") return "register";
  if (window.location.hash === "#early") return "early";
  return "home";
}

function AppInner() {
  const [page, setPage] = useState<Page>(getPage);

  useEffect(() => {
    const handler = () => setPage(getPage());
    window.addEventListener("hashchange", handler);
    return () => window.removeEventListener("hashchange", handler);
  }, []);

  return (
    <div style={{ backgroundColor: "#FAF8F4", fontFamily: '"DM Sans", sans-serif', overflowX: "hidden" }}>
      <CartDrawer />
      {page !== "signin" && page !== "register" && page !== "early" && <QutbNav page={page} />}
      {page === "home" ? (
        <>
          <QutbHero onShopClick={() => navigate("collection")} />
          <FabricFirst />
          <UniformCollection onViewAll={() => navigate("collection")} />
          <CottonJourney />
          <AlexandriaStory />
          <SaltJournal />
          <PackagingStory />
          <QutbFooter />
        </>
      ) : page === "collection" ? (
        <CollectionPage />
      ) : page === "product" ? (
        <ProductPage />
      ) : page === "journey" ? (
        <CottonJourneyPage />
      ) : page === "salt" ? (
        <SaltJournalPage />
      ) : page === "cart" ? (
        <CartPage />
      ) : page === "alex" ? (
        <AlexandriaPage />
      ) : page === "manufacturing" ? (
        <ManufacturingPage />
      ) : page === "philosophy" ? (
        <DesignPhilosophyPage />
      ) : page === "packaging" ? (
        <PackagingPage />
      ) : page === "sustainability" ? (
        <SustainabilityPage />
      ) : page === "wholesale" ? (
        <WholesalePage />
      ) : page === "contact" ? (
        <ContactPage />
      ) : page === "signin" ? (
        <SignInPage />
      ) : page === "register" ? (
        <RegisterPage />
      ) : page === "early" ? (
        <EarlyAccessPage />
      ) : (
        <SignInPage />
      )}

      {/* Dev button — navigate to early access page */}
      {page !== "early" && (
        <button
          onClick={() => navigate("early")}
          style={{
            position: "fixed", bottom: 20, right: 20,
            zIndex: 9999,
            backgroundColor: "#1A2332",
            color: "rgba(250,248,244,0.7)",
            border: "1px solid rgba(250,248,244,0.15)",
            borderRadius: 0,
            fontFamily: '"DM Sans", sans-serif',
            fontWeight: 300,
            fontSize: "0.6rem",
            letterSpacing: "0.18em",
            textTransform: "uppercase",
            padding: "7px 12px",
            cursor: "pointer",
            transition: "opacity 0.2s",
            opacity: 0.6,
          }}
          onMouseEnter={e => (e.currentTarget.style.opacity = "1")}
          onMouseLeave={e => (e.currentTarget.style.opacity = "0.6")}
        >
          Dev
        </button>
      )}
    </div>
  );
}

export default function App() {
  return (
    <CartProvider>
      <AppInner />
    </CartProvider>
  );
}
