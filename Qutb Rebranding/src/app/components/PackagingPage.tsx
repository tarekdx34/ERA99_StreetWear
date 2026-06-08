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

export function PackagingPage() {
  return (
    <div style={{ backgroundColor: "#FAF8F4", fontFamily: '"DM Sans", sans-serif', overflowX: "hidden" }}>

      {/* Hero — typographic, minimal */}
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", textAlign: "center", padding: "clamp(120px, 12vw, 180px) clamp(24px, 8vw, 120px) clamp(80px, 8vw, 120px)", position: "relative" }}>
        <div style={{ position: "absolute", inset: 0, zIndex: 0 }}>
          <img
            src={IMG("photo-1558171813-34cef1a3aad2", 2400, 1600)}
            alt="Texture"
            style={{ width: "100%", height: "100%", objectFit: "cover", filter: "brightness(0.08) saturate(0.3)" }}
          />
        </div>
        <div style={{ position: "relative", zIndex: 1 }}>
          <p style={{ color: "rgba(250,248,244,0.4)", fontSize: "0.62rem", letterSpacing: "0.24em", textTransform: "uppercase", fontWeight: 300, marginBottom: 32 }}>
            Company — Craft
          </p>
          <h1 style={{ color: "#FAF8F4", fontFamily: '"Bodoni Moda", serif', fontSize: "clamp(4rem, 13vw, 12rem)", fontWeight: 400, letterSpacing: "0.05em", lineHeight: 0.9, margin: "0 0 48px" }}>
            PACK<br />AGING
          </h1>
          <p style={{ color: "rgba(250,248,244,0.5)", fontSize: "0.85rem", letterSpacing: "0.06em", fontWeight: 300, maxWidth: 400, margin: "0 auto", lineHeight: 1.75 }}>
            The first physical encounter with QUTB. It should feel like the beginning of something, not the end of a transaction.
          </p>
        </div>
      </div>

      {/* Section 01 — Unboxing Experience */}
      <div style={{ padding: "clamp(80px, 12vw, 160px) clamp(24px, 8vw, 120px)" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "clamp(40px, 6vw, 100px)", alignItems: "center" }}>
          <FadeIn>
            <div>
              <p style={{ color: "#7C7C75", fontSize: "0.62rem", letterSpacing: "0.24em", textTransform: "uppercase", fontWeight: 300, marginBottom: 20 }}>
                01 — Unboxing Experience
              </p>
              <h2 style={{ color: "#111111", fontFamily: '"Bodoni Moda", serif', fontSize: "clamp(2rem, 4vw, 3.5rem)", fontWeight: 400, letterSpacing: "0.03em", lineHeight: 1.1, marginBottom: 32 }}>
                Slowness<br />by design.
              </h2>
              <p style={{ color: "#7C7C75", fontSize: "0.88rem", lineHeight: 1.9, fontWeight: 300, maxWidth: 420, marginBottom: 24 }}>
                QUTB packaging is not designed to be impressive at first glance. It is designed to reveal itself slowly. The texture before the structure. The color before the contents. The weight before the opening.
              </p>
              <p style={{ color: "#7C7C75", fontSize: "0.88rem", lineHeight: 1.9, fontWeight: 300, maxWidth: 420 }}>
                We believe unboxing should feel like reading the first page of something worth finishing.
              </p>
            </div>
          </FadeIn>
          <FadeIn delay={0.2}>
            <img
              src={IMG("photo-1583736902935-6b52b2b2359e", 900, 1100)}
              alt="Packaging texture"
              style={{ width: "100%", aspectRatio: "3/4", objectFit: "cover", display: "block" }}
            />
          </FadeIn>
        </div>
      </div>

      {/* Wide typographic band */}
      <div style={{ backgroundColor: "#F5F0E8", padding: "clamp(60px, 8vw, 100px) clamp(24px, 8vw, 120px)" }}>
        <FadeIn>
          <p style={{ color: "#111111", fontFamily: '"Bodoni Moda", serif', fontSize: "clamp(1.8rem, 5vw, 4.5rem)", fontWeight: 400, fontStyle: "italic", lineHeight: 1.15, maxWidth: 900, margin: "0 auto", textAlign: "center", letterSpacing: "0.01em" }}>
            "Packaging is not protection. It is introduction."
          </p>
        </FadeIn>
      </div>

      {/* Section 02 — Materials */}
      <div style={{ padding: "clamp(80px, 12vw, 160px) clamp(24px, 8vw, 120px)" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto" }}>
          <FadeIn>
            <p style={{ color: "#7C7C75", fontSize: "0.62rem", letterSpacing: "0.24em", textTransform: "uppercase", fontWeight: 300, marginBottom: 20, textAlign: "center" }}>
              02 — Materials
            </p>
            <h2 style={{ color: "#111111", fontFamily: '"Bodoni Moda", serif', fontSize: "clamp(2.5rem, 6vw, 5rem)", fontWeight: 400, letterSpacing: "0.04em", lineHeight: 1, textAlign: "center", marginBottom: "clamp(60px, 8vw, 100px)" }}>
              Nothing wasteful.
            </h2>
          </FadeIn>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "clamp(24px, 3vw, 48px)" }}>
            {[
              { label: "Box", detail: "Uncoated kraft board, 450gsm. No laminate. No gloss. Pressed with a single die-cut indent for the QUTB mark.", img: IMG("photo-1558171813-34cef1a3aad2", 600, 750) },
              { label: "Tissue", detail: "Unbleached cotton tissue, acid-free. Wraps the garment in a single fold. Sealed with a wax stamp, not adhesive.", img: IMG("photo-1558769132-cb1aea458c5e", 600, 750) },
              { label: "Insert", detail: "A single card on seeded paper. Includes a handwritten production number. Can be planted — the card grows wildflowers.", img: IMG("photo-1541963463532-d68292c34b19", 600, 750) },
            ].map((item, i) => (
              <FadeIn key={item.label} delay={i * 0.15}>
                <div>
                  <img src={item.img} alt={item.label} style={{ width: "100%", aspectRatio: "4/5", objectFit: "cover", display: "block", marginBottom: 20 }} />
                  <p style={{ color: "#111111", fontSize: "0.72rem", letterSpacing: "0.18em", textTransform: "uppercase", fontWeight: 400, marginBottom: 10 }}>{item.label}</p>
                  <p style={{ color: "#7C7C75", fontSize: "0.8rem", lineHeight: 1.75, fontWeight: 300 }}>{item.detail}</p>
                </div>
              </FadeIn>
            ))}
          </div>
        </div>
      </div>

      {/* Section 03 — Brand Marking */}
      <div style={{ backgroundColor: "#111111", padding: "clamp(80px, 12vw, 160px) clamp(24px, 8vw, 120px)" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "clamp(40px, 6vw, 100px)", alignItems: "center" }}>
          <FadeIn delay={0.2}>
            <img
              src={IMG("photo-1628565428823-516b4cb4f590", 900, 1100)}
              alt="Brand marking"
              style={{ width: "100%", aspectRatio: "3/4", objectFit: "cover", display: "block" }}
            />
          </FadeIn>
          <FadeIn>
            <div>
              <p style={{ color: "rgba(250,248,244,0.4)", fontSize: "0.62rem", letterSpacing: "0.24em", textTransform: "uppercase", fontWeight: 300, marginBottom: 20 }}>
                03 — Brand Marking
              </p>
              <h2 style={{ color: "#FAF8F4", fontFamily: '"Bodoni Moda", serif', fontSize: "clamp(2rem, 4vw, 3.5rem)", fontWeight: 400, letterSpacing: "0.03em", lineHeight: 1.1, marginBottom: 32 }}>
                One mark.<br />No explanation.
              </h2>
              <p style={{ color: "rgba(250,248,244,0.55)", fontSize: "0.88rem", lineHeight: 1.9, fontWeight: 300, marginBottom: 24 }}>
                The QUTB mark appears once on the exterior — debossed into the box, no print, no color. The wax seal closes the tissue inside. Nothing else.
              </p>
              <p style={{ color: "rgba(250,248,244,0.55)", fontSize: "0.88rem", lineHeight: 1.9, fontWeight: 300 }}>
                We do not print the brand across the packaging. The mark is not a billboard. It is a signal for those who already know.
              </p>
            </div>
          </FadeIn>
        </div>
      </div>

      {/* Closing */}
      <div style={{ padding: "clamp(100px, 12vw, 160px) clamp(24px, 8vw, 120px)", textAlign: "center" }}>
        <FadeIn>
          <p style={{ color: "#111111", fontFamily: '"Bodoni Moda", serif', fontSize: "clamp(1.2rem, 2.5vw, 2rem)", fontWeight: 400, fontStyle: "italic", letterSpacing: "0.01em", lineHeight: 1.6 }}>
            Packaging is the first touch of permanence.
          </p>
        </FadeIn>
      </div>
      <QutbFooter />
    </div>
  );
}
