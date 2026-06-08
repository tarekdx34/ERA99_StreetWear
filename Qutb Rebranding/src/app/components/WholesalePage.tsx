import { useEffect, useRef, useState } from "react";
import { QutbFooter } from "./QutbFooter";

function useInView(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold });
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, visible };
}

function FadeIn({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const { ref, visible } = useInView();
  return (
    <div ref={ref} style={{ opacity: visible ? 1 : 0, transform: visible ? "none" : "translateY(28px)", transition: `opacity 1s ease ${delay}s, transform 1s ease ${delay}s` }}>
      {children}
    </div>
  );
}

const IMG = (id: string, w = 1200, h = 800) =>
  `https://images.unsplash.com/${id}?w=${w}&h=${h}&fit=crop&auto=format&q=80`;

export function WholesalePage() {
  const [sent, setSent] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSent(true);
  }

  return (
    <div style={{ backgroundColor: "#FAF8F4", fontFamily: '"DM Sans", sans-serif', overflowX: "hidden" }}>

      {/* Hero */}
      <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", justifyContent: "flex-end", padding: "clamp(40px, 7vw, 100px)", paddingTop: 140, position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0 }}>
          <img
            src={IMG("photo-1441986300917-64674bd600d8", 2400, 1600)}
            alt="Store interior"
            style={{ width: "100%", height: "100%", objectFit: "cover", filter: "brightness(0.4) saturate(0.6)" }}
          />
        </div>
        <div style={{ position: "relative", zIndex: 1 }}>
          <p style={{ color: "rgba(250,248,244,0.4)", fontSize: "0.62rem", letterSpacing: "0.24em", textTransform: "uppercase", fontWeight: 300, marginBottom: 24 }}>
            Company — Trade
          </p>
          <h1 style={{ color: "#FAF8F4", fontFamily: '"Bodoni Moda", serif', fontSize: "clamp(3.5rem, 11vw, 10rem)", fontWeight: 400, letterSpacing: "0.03em", lineHeight: 0.88, margin: "0 0 36px" }}>
            WHOLE<br />SALE
          </h1>
          <p style={{ color: "rgba(250,248,244,0.55)", fontSize: "0.85rem", letterSpacing: "0.05em", fontWeight: 300, maxWidth: 420, lineHeight: 1.75 }}>
            QUTB is available to a small number of retail partners whose values align with ours. Not every store is the right environment for what we make.
          </p>
        </div>
      </div>

      {/* Section 01 — Brand Positioning */}
      <div style={{ padding: "clamp(80px, 12vw, 160px) clamp(24px, 8vw, 120px)" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "clamp(40px, 6vw, 100px)", alignItems: "start" }}>
          <FadeIn>
            <div>
              <p style={{ color: "#7C7C75", fontSize: "0.62rem", letterSpacing: "0.24em", textTransform: "uppercase", fontWeight: 300, marginBottom: 20 }}>
                01 — Brand Positioning
              </p>
              <h2 style={{ color: "#111111", fontFamily: '"Bodoni Moda", serif', fontSize: "clamp(2rem, 4vw, 3.5rem)", fontWeight: 400, letterSpacing: "0.03em", lineHeight: 1.1, marginBottom: 32 }}>
                Not every store<br />is the right place.
              </h2>
              <p style={{ color: "#7C7C75", fontSize: "0.88rem", lineHeight: 1.9, fontWeight: 300, maxWidth: 420, marginBottom: 24 }}>
                QUTB occupies a specific position: premium basics with Mediterranean provenance. Designed for customers who buy less and expect more. This is not a mass-market product.
              </p>
              <p style={{ color: "#7C7C75", fontSize: "0.88rem", lineHeight: 1.9, fontWeight: 300, maxWidth: 420 }}>
                We work with fewer stockists than we receive requests from. The environment in which a garment is sold affects how it is perceived and worn. We take that seriously.
              </p>
            </div>
          </FadeIn>
          <FadeIn delay={0.2}>
            <img
              src={IMG("photo-1558171813-34cef1a3aad2", 900, 1100)}
              alt="Retail environment"
              style={{ width: "100%", aspectRatio: "3/4", objectFit: "cover", display: "block" }}
            />
          </FadeIn>
        </div>
      </div>

      {/* Section 02 — Requirements */}
      <div style={{ backgroundColor: "#F5F0E8", padding: "clamp(80px, 12vw, 160px) clamp(24px, 8vw, 120px)" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto" }}>
          <FadeIn>
            <p style={{ color: "#7C7C75", fontSize: "0.62rem", letterSpacing: "0.24em", textTransform: "uppercase", fontWeight: 300, marginBottom: 20, textAlign: "center" }}>
              02 — Requirements
            </p>
            <h2 style={{ color: "#111111", fontFamily: '"Bodoni Moda", serif', fontSize: "clamp(2.5rem, 6vw, 5rem)", fontWeight: 400, letterSpacing: "0.04em", lineHeight: 1, textAlign: "center", marginBottom: "clamp(60px, 8vw, 100px)" }}>
              What we look for.
            </h2>
          </FadeIn>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "clamp(24px, 3vw, 48px)", maxWidth: 900, margin: "0 auto" }}>
            {[
              { label: "Curation", body: "Your store carries a narrow, considered selection. Not every category. Not every price point. A clear editorial eye." },
              { label: "Alignment", body: "Your customers understand quality through restraint. They are not looking for discounts — they are looking for the right thing." },
              { label: "Display", body: "QUTB garments require space. Not a crowded rail. Adequate light. Room for the fabric to communicate its weight and drape." },
              { label: "Relationship", body: "We expect to know who is selling our product. A wholesale relationship at QUTB is a conversation, not a purchase order." },
            ].map((item, i) => (
              <FadeIn key={item.label} delay={i * 0.1}>
                <div style={{ borderTop: "1px solid rgba(17,17,17,0.12)", paddingTop: 28 }}>
                  <p style={{ color: "#111111", fontSize: "0.72rem", letterSpacing: "0.18em", textTransform: "uppercase", fontWeight: 400, marginBottom: 14 }}>{item.label}</p>
                  <p style={{ color: "#7C7C75", fontSize: "0.85rem", lineHeight: 1.85, fontWeight: 300 }}>{item.body}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </div>

      {/* Section 03 — Contact */}
      <div style={{ padding: "clamp(80px, 12vw, 160px) clamp(24px, 8vw, 120px)" }}>
        <div style={{ maxWidth: 760, margin: "0 auto" }}>
          <FadeIn>
            <p style={{ color: "#7C7C75", fontSize: "0.62rem", letterSpacing: "0.24em", textTransform: "uppercase", fontWeight: 300, marginBottom: 20, textAlign: "center" }}>
              03 — Wholesale Inquiry
            </p>
            <h2 style={{ color: "#111111", fontFamily: '"Bodoni Moda", serif', fontSize: "clamp(2rem, 4vw, 3rem)", fontWeight: 400, letterSpacing: "0.03em", lineHeight: 1.1, textAlign: "center", marginBottom: 48 }}>
              Tell us about your store.
            </h2>
          </FadeIn>

          {sent ? (
            <FadeIn>
              <div style={{ textAlign: "center", padding: "60px 0" }}>
                <p style={{ color: "#111111", fontFamily: '"Bodoni Moda", serif', fontSize: "1.5rem", fontStyle: "italic", marginBottom: 16 }}>Received.</p>
                <p style={{ color: "#7C7C75", fontSize: "0.82rem", lineHeight: 1.75, fontWeight: 300 }}>We will review your inquiry and respond if there is alignment.</p>
              </div>
            </FadeIn>
          ) : (
            <FadeIn delay={0.1}>
              <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 24 }}>
                {[
                  { id: "store", label: "Store Name", type: "text", placeholder: "Your store name" },
                  { id: "location", label: "Location", type: "text", placeholder: "City, Country" },
                  { id: "website", label: "Website", type: "url", placeholder: "https://" },
                  { id: "email", label: "Email", type: "email", placeholder: "wholesale@yourstore.com" },
                ].map((field) => (
                  <div key={field.id} style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    <label htmlFor={field.id} style={{ color: "#111111", fontSize: "0.68rem", letterSpacing: "0.18em", textTransform: "uppercase", fontWeight: 400 }}>
                      {field.label}
                    </label>
                    <input
                      id={field.id}
                      type={field.type}
                      placeholder={field.placeholder}
                      style={{ backgroundColor: "transparent", border: "none", borderBottom: "1px solid rgba(17,17,17,0.2)", padding: "10px 0", color: "#111111", fontFamily: '"DM Sans", sans-serif', fontSize: "0.88rem", fontWeight: 300, outline: "none", transition: "border-color 0.2s" }}
                      onFocus={(e) => (e.target.style.borderBottomColor = "#111111")}
                      onBlur={(e) => (e.target.style.borderBottomColor = "rgba(17,17,17,0.2)")}
                    />
                  </div>
                ))}
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  <label htmlFor="about" style={{ color: "#111111", fontSize: "0.68rem", letterSpacing: "0.18em", textTransform: "uppercase", fontWeight: 400 }}>
                    About Your Store
                  </label>
                  <textarea
                    id="about"
                    rows={5}
                    placeholder="Tell us about your customers, your curation, and why QUTB makes sense in your environment."
                    style={{ backgroundColor: "transparent", border: "1px solid rgba(17,17,17,0.15)", padding: "14px 16px", color: "#111111", fontFamily: '"DM Sans", sans-serif', fontSize: "0.85rem", fontWeight: 300, outline: "none", resize: "vertical", lineHeight: 1.75, transition: "border-color 0.2s" }}
                    onFocus={(e) => (e.target.style.borderColor = "#111111")}
                    onBlur={(e) => (e.target.style.borderColor = "rgba(17,17,17,0.15)")}
                  />
                </div>
                <div style={{ paddingTop: 16 }}>
                  <button
                    type="submit"
                    style={{ backgroundColor: "#111111", color: "#FAF8F4", border: "none", padding: "16px 48px", fontFamily: '"DM Sans", sans-serif', fontSize: "0.7rem", letterSpacing: "0.2em", textTransform: "uppercase", cursor: "pointer", fontWeight: 400, transition: "opacity 0.2s" }}
                    className="hover:opacity-70"
                  >
                    Submit Inquiry
                  </button>
                </div>
              </form>
            </FadeIn>
          )}
        </div>
      </div>

      {/* Closing */}
      <div style={{ backgroundColor: "#111111", padding: "clamp(80px, 10vw, 140px) clamp(24px, 8vw, 120px)", textAlign: "center" }}>
        <FadeIn>
          <p style={{ color: "#FAF8F4", fontFamily: '"Bodoni Moda", serif', fontSize: "clamp(1.2rem, 2.5vw, 2rem)", fontWeight: 400, fontStyle: "italic", letterSpacing: "0.01em", lineHeight: 1.6 }}>
            Distribution is not expansion.<br />It is alignment.
          </p>
        </FadeIn>
      </div>
      <QutbFooter />
    </div>
  );
}
