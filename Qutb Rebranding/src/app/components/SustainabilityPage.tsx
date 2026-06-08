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

const pillars = [
  {
    number: "01",
    title: "Longevity",
    headline: "The most sustainable garment is the one you never replace.",
    body: "QUTB does not design for a season. Every construction decision — seam placement, thread choice, hem weight — is made for what the garment looks like after 200 washes, not 20.",
    detail: "We believe durability is the most honest form of sustainability. If a garment lasts a decade, it replaces ten garments that don't.",
    img: IMG("photo-1441986300917-64674bd600d8", 900, 700),
    alt: "Durable fabric",
  },
  {
    number: "02",
    title: "Material Responsibility",
    headline: "We know where everything comes from.",
    body: "The cotton in QUTB garments is traced to its origin. We work with suppliers who can name the field, the farmer, and the gin. If we cannot trace it, we do not use it.",
    detail: "No blends that compromise recyclability. No chemical finishes that don't disclose their composition. Nothing we would be unwilling to publish.",
    img: IMG("photo-1470115636492-6d2b56f9146d", 900, 700),
    alt: "Cotton field",
  },
  {
    number: "03",
    title: "Production Ethics",
    headline: "Small batches. Honest prices.",
    body: "We do not overproduce. We do not hold liquidation sales. We make what we have orders for, and we make it well. What we make extra is held — not discounted.",
    detail: "Every person who makes a QUTB garment is paid above the living wage for their region. This is not a pledge. It is a condition of production.",
    img: IMG("photo-1606501126768-b78d4569d3f9", 900, 700),
    alt: "Production workshop",
  },
];

export function SustainabilityPage() {
  return (
    <div style={{ backgroundColor: "#FAF8F4", fontFamily: '"DM Sans", sans-serif', overflowX: "hidden" }}>

      {/* Hero */}
      <div style={{ minHeight: "100vh", position: "relative", display: "flex", flexDirection: "column", justifyContent: "flex-end", padding: "clamp(40px, 7vw, 100px)", overflow: "hidden" }}>
        <div style={{ position: "absolute", inset: 0 }}>
          <img
            src={IMG("photo-1470115636492-6d2b56f9146d", 2400, 1600)}
            alt="Cotton field"
            style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center 40%" }}
          />
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.6) 100%)" }} />
        </div>
        <div style={{ position: "relative", zIndex: 1 }}>
          <p style={{ color: "rgba(250,248,244,0.5)", fontSize: "0.62rem", letterSpacing: "0.24em", textTransform: "uppercase", fontWeight: 300, marginBottom: 24 }}>
            Company — Values
          </p>
          <h1 style={{ color: "#FAF8F4", fontFamily: '"Bodoni Moda", serif', fontSize: "clamp(3.5rem, 11vw, 10rem)", fontWeight: 400, letterSpacing: "0.03em", lineHeight: 0.88, margin: "0 0 36px" }}>
            SUSTAIN<br />ABILITY
          </h1>
          <p style={{ color: "rgba(250,248,244,0.55)", fontSize: "0.85rem", letterSpacing: "0.05em", fontWeight: 300, maxWidth: 420, lineHeight: 1.75 }}>
            Not a campaign. Not a certification. A way of making things.
          </p>
        </div>
      </div>

      {/* Opening statement */}
      <div style={{ padding: "clamp(80px, 10vw, 140px) clamp(24px, 8vw, 120px)", backgroundColor: "#F5F0E8" }}>
        <div style={{ maxWidth: 800, margin: "0 auto", textAlign: "center" }}>
          <FadeIn>
            <p style={{ color: "#111111", fontFamily: '"Bodoni Moda", serif', fontSize: "clamp(1.5rem, 3.5vw, 2.8rem)", fontWeight: 400, fontStyle: "italic", lineHeight: 1.45, letterSpacing: "0.01em", marginBottom: 36 }}>
              "The least sustainable thing we can do is make something people will replace."
            </p>
            <div style={{ width: 24, height: 1, backgroundColor: "rgba(17,17,17,0.25)", margin: "0 auto 32px" }} />
            <p style={{ color: "#7C7C75", fontSize: "0.85rem", lineHeight: 1.85, fontWeight: 300 }}>
              The fashion industry has made sustainability a story. QUTB is not interested in the story — only in the outcome. Fewer garments made. Better garments kept.
            </p>
          </FadeIn>
        </div>
      </div>

      {/* Three pillars */}
      {pillars.map((pillar, i) => (
        <div key={pillar.number} style={{ backgroundColor: i % 2 === 1 ? "#FAF8F4" : "#FAF8F4", borderTop: "1px solid rgba(17,17,17,0.06)" }}>
          <div style={{ padding: "clamp(60px, 9vw, 120px) clamp(24px, 8vw, 120px)", maxWidth: 1280, margin: "0 auto" }}>
            <div style={{ display: "grid", gridTemplateColumns: i % 2 === 0 ? "1fr 1fr" : "1fr 1fr", gap: "clamp(40px, 6vw, 100px)", alignItems: "center" }}>
              {i % 2 === 0 ? (
                <>
                  <FadeIn>
                    <div>
                      <p style={{ color: "#7C7C75", fontSize: "0.62rem", letterSpacing: "0.24em", textTransform: "uppercase", fontWeight: 300, marginBottom: 16 }}>
                        {pillar.number} — {pillar.title}
                      </p>
                      <h2 style={{ color: "#111111", fontFamily: '"Bodoni Moda", serif', fontSize: "clamp(1.8rem, 3.5vw, 3rem)", fontWeight: 400, letterSpacing: "0.03em", lineHeight: 1.15, marginBottom: 28 }}>
                        {pillar.headline}
                      </h2>
                      <p style={{ color: "#7C7C75", fontSize: "0.88rem", lineHeight: 1.9, fontWeight: 300, maxWidth: 420, marginBottom: 20 }}>
                        {pillar.body}
                      </p>
                      <div style={{ borderLeft: "1px solid rgba(17,17,17,0.15)", paddingLeft: 20 }}>
                        <p style={{ color: "#111111", fontSize: "0.82rem", lineHeight: 1.7, fontWeight: 300, fontStyle: "italic" }}>
                          {pillar.detail}
                        </p>
                      </div>
                    </div>
                  </FadeIn>
                  <FadeIn delay={0.2}>
                    <img src={pillar.img} alt={pillar.alt} style={{ width: "100%", aspectRatio: "4/3", objectFit: "cover", display: "block" }} />
                  </FadeIn>
                </>
              ) : (
                <>
                  <FadeIn delay={0.2}>
                    <img src={pillar.img} alt={pillar.alt} style={{ width: "100%", aspectRatio: "4/3", objectFit: "cover", display: "block" }} />
                  </FadeIn>
                  <FadeIn>
                    <div>
                      <p style={{ color: "#7C7C75", fontSize: "0.62rem", letterSpacing: "0.24em", textTransform: "uppercase", fontWeight: 300, marginBottom: 16 }}>
                        {pillar.number} — {pillar.title}
                      </p>
                      <h2 style={{ color: "#111111", fontFamily: '"Bodoni Moda", serif', fontSize: "clamp(1.8rem, 3.5vw, 3rem)", fontWeight: 400, letterSpacing: "0.03em", lineHeight: 1.15, marginBottom: 28 }}>
                        {pillar.headline}
                      </h2>
                      <p style={{ color: "#7C7C75", fontSize: "0.88rem", lineHeight: 1.9, fontWeight: 300, maxWidth: 420, marginBottom: 20 }}>
                        {pillar.body}
                      </p>
                      <div style={{ borderLeft: "1px solid rgba(17,17,17,0.15)", paddingLeft: 20 }}>
                        <p style={{ color: "#111111", fontSize: "0.82rem", lineHeight: 1.7, fontWeight: 300, fontStyle: "italic" }}>
                          {pillar.detail}
                        </p>
                      </div>
                    </div>
                  </FadeIn>
                </>
              )}
            </div>
          </div>
        </div>
      ))}

      {/* Stats band */}
      <div style={{ backgroundColor: "#1D2635", padding: "clamp(60px, 8vw, 100px) clamp(24px, 8vw, 120px)" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "clamp(32px, 4vw, 64px)", textAlign: "center" }}>
          {[
            { number: "100%", label: "Traceable cotton origin" },
            { number: "0", label: "Liquidation sales since founding" },
            { number: "3×", label: "Living wage above regional minimum" },
          ].map((stat, i) => (
            <FadeIn key={stat.label} delay={i * 0.15}>
              <div>
                <p style={{ color: "#FAF8F4", fontFamily: '"Bodoni Moda", serif', fontSize: "clamp(2.5rem, 5vw, 4.5rem)", fontWeight: 400, letterSpacing: "0.04em", marginBottom: 12 }}>
                  {stat.number}
                </p>
                <p style={{ color: "rgba(250,248,244,0.45)", fontSize: "0.72rem", letterSpacing: "0.14em", textTransform: "uppercase", fontWeight: 300 }}>
                  {stat.label}
                </p>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>

      {/* Closing */}
      <div style={{ padding: "clamp(100px, 12vw, 160px) clamp(24px, 8vw, 120px)", textAlign: "center" }}>
        <FadeIn>
          <p style={{ color: "#111111", fontFamily: '"Bodoni Moda", serif', fontSize: "clamp(1.2rem, 2.5vw, 2rem)", fontWeight: 400, fontStyle: "italic", letterSpacing: "0.01em", lineHeight: 1.6 }}>
            Less production. More permanence.
          </p>
        </FadeIn>
      </div>
      <QutbFooter />
    </div>
  );
}
