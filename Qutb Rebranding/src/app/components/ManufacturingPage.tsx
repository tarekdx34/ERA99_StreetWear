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

function FadeIn({ children, delay = 0, className = "" }: { children: React.ReactNode; delay?: number; className?: string }) {
  const { ref, visible } = useInView();
  return (
    <div ref={ref} className={className} style={{ opacity: visible ? 1 : 0, transform: visible ? "none" : "translateY(28px)", transition: `opacity 1s ease ${delay}s, transform 1s ease ${delay}s` }}>
      {children}
    </div>
  );
}

const IMG = (id: string, w = 1200, h = 800) =>
  `https://images.unsplash.com/${id}?w=${w}&h=${h}&fit=crop&auto=format&q=80`;

export function ManufacturingPage() {
  return (
    <div style={{ backgroundColor: "#FAF8F4", fontFamily: '"DM Sans", sans-serif', overflowX: "hidden" }}>

      {/* Hero */}
      <div style={{ position: "relative", height: "100vh", minHeight: 600, overflow: "hidden" }}>
        <img
          src={IMG("photo-1770910195240-ddec777b77f6", 2400, 1600)}
          alt="Manufacturing workshop"
          style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center" }}
        />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to bottom, rgba(0,0,0,0.18) 0%, rgba(0,0,0,0.55) 100%)" }} />
        <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", justifyContent: "flex-end", padding: "clamp(40px, 7vw, 100px)" }}>
          <p style={{ color: "rgba(250,248,244,0.55)", fontSize: "0.65rem", letterSpacing: "0.22em", textTransform: "uppercase", fontFamily: '"DM Sans", sans-serif', fontWeight: 300, marginBottom: 24 }}>
            Salt Journal — Craft
          </p>
          <h1 style={{ color: "#FAF8F4", fontFamily: '"Bodoni Moda", serif', fontSize: "clamp(3.5rem, 11vw, 10rem)", fontWeight: 400, letterSpacing: "0.04em", lineHeight: 0.9, margin: 0 }}>
            MANU<br />FACTU<br />RING
          </h1>
          <p style={{ color: "rgba(250,248,244,0.6)", fontSize: "0.78rem", letterSpacing: "0.1em", fontWeight: 300, marginTop: 32, maxWidth: 360 }}>
            The human act of making — not scaled, not automated. A record of what it takes to build a garment that stays.
          </p>
        </div>
      </div>

      {/* Section 01 — Origin of Making */}
      <div style={{ padding: "clamp(80px, 12vw, 160px) clamp(24px, 8vw, 120px)" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "clamp(40px, 6vw, 100px)", alignItems: "center" }}>
          <FadeIn>
            <div>
              <p style={{ color: "#7C7C75", fontSize: "0.62rem", letterSpacing: "0.24em", textTransform: "uppercase", fontWeight: 300, marginBottom: 20 }}>
                01 — Origin of Making
              </p>
              <h2 style={{ color: "#111111", fontFamily: '"Bodoni Moda", serif', fontSize: "clamp(2rem, 4vw, 3.5rem)", fontWeight: 400, letterSpacing: "0.04em", lineHeight: 1.1, marginBottom: 32 }}>
                Human<br />craft.
              </h2>
              <p style={{ color: "#7C7C75", fontSize: "0.88rem", lineHeight: 1.9, fontWeight: 300, maxWidth: 420 }}>
                Every QUTB garment begins with a person. A pattern cutter. A seamstress. Someone who has spent years understanding how cloth moves, where it gives, where it resists.
              </p>
              <div style={{ width: 32, height: 1, backgroundColor: "#111111", margin: "36px 0" }} />
              <p style={{ color: "#7C7C75", fontSize: "0.82rem", lineHeight: 1.85, fontWeight: 300, maxWidth: 420 }}>
                We do not automate the decisions that define quality. The machine finishes the seam — the person decides where the seam lives.
              </p>
            </div>
          </FadeIn>
          <FadeIn delay={0.2}>
            <img
              src={IMG("photo-1606501126768-b78d4569d3f9", 900, 1100)}
              alt="Person sewing"
              style={{ width: "100%", aspectRatio: "3/4", objectFit: "cover", display: "block" }}
            />
          </FadeIn>
        </div>
      </div>

      {/* Wide image break */}
      <div style={{ height: "65vh", minHeight: 400, overflow: "hidden", position: "relative" }}>
        <img
          src={IMG("photo-1672302255324-28009cc288b2", 2400, 1000)}
          alt="Fabric and craft"
          style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center 30%" }}
        />
        <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.12)" }} />
        <div style={{ position: "absolute", bottom: "clamp(32px, 5vw, 60px)", left: "clamp(24px, 8vw, 120px)" }}>
          <p style={{ color: "rgba(250,248,244,0.7)", fontFamily: '"Bodoni Moda", serif', fontSize: "clamp(1rem, 2.5vw, 1.8rem)", fontWeight: 400, fontStyle: "italic" }}>
            "The pattern is not a guide. It is a decision."
          </p>
        </div>
      </div>

      {/* Section 02 — Cutting & Construction */}
      <div style={{ padding: "clamp(80px, 12vw, 160px) clamp(24px, 8vw, 120px)", backgroundColor: "#F5F0E8" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto" }}>
          <FadeIn>
            <p style={{ color: "#7C7C75", fontSize: "0.62rem", letterSpacing: "0.24em", textTransform: "uppercase", fontWeight: 300, marginBottom: 20, textAlign: "center" }}>
              02 — Cutting & Construction
            </p>
            <h2 style={{ color: "#111111", fontFamily: '"Bodoni Moda", serif', fontSize: "clamp(2.5rem, 6vw, 5.5rem)", fontWeight: 400, letterSpacing: "0.04em", lineHeight: 1, textAlign: "center", marginBottom: "clamp(60px, 8vw, 100px)" }}>
              Pattern as intention.
            </h2>
          </FadeIn>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "clamp(16px, 2vw, 32px)" }}>
            <FadeIn delay={0.1}>
              <img
                src={IMG("photo-1623578059518-bbdb071eab81", 900, 700)}
                alt="Sewing machine"
                style={{ width: "100%", aspectRatio: "4/3", objectFit: "cover", display: "block" }}
              />
            </FadeIn>
            <FadeIn delay={0.25}>
              <div style={{ padding: "clamp(32px, 4vw, 60px)", display: "flex", flexDirection: "column", justifyContent: "center" }}>
                <p style={{ color: "#7C7C75", fontSize: "0.88rem", lineHeight: 1.9, fontWeight: 300, marginBottom: 28 }}>
                  A garment's structure begins before the needle touches the cloth. Cutting is not trimming excess — it is defining the intention of each panel.
                </p>
                <p style={{ color: "#7C7C75", fontSize: "0.88rem", lineHeight: 1.9, fontWeight: 300, marginBottom: 28 }}>
                  The seams are placed where stress will travel. The hem is considered for how it will fall after years of wear, not just after it leaves the iron.
                </p>
                <p style={{ color: "#111111", fontFamily: '"Bodoni Moda", serif', fontSize: "clamp(1rem, 1.8vw, 1.4rem)", fontWeight: 400, fontStyle: "italic", lineHeight: 1.5 }}>
                  Sewing is structure building — not assembly.
                </p>
              </div>
            </FadeIn>
          </div>
        </div>
      </div>

      {/* Thread detail — full bleed */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", minHeight: "70vh" }}>
        <div style={{ overflow: "hidden" }}>
          <img
            src={IMG("photo-1568288796918-03e7d93306bd", 900, 1100)}
            alt="White thread"
            style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
          />
        </div>
        <div style={{ backgroundColor: "#111111", display: "flex", alignItems: "center", padding: "clamp(40px, 6vw, 80px)" }}>
          <FadeIn>
            <div>
              <p style={{ color: "rgba(250,248,244,0.4)", fontSize: "0.62rem", letterSpacing: "0.24em", textTransform: "uppercase", fontWeight: 300, marginBottom: 24 }}>
                Material note
              </p>
              <p style={{ color: "#FAF8F4", fontFamily: '"Bodoni Moda", serif', fontSize: "clamp(1.5rem, 3vw, 2.5rem)", fontWeight: 400, lineHeight: 1.3, marginBottom: 32 }}>
                Thread weight matters. Color matching matters. A seam that fades differently than the base cloth is a seam that fails.
              </p>
              <p style={{ color: "rgba(250,248,244,0.55)", fontSize: "0.82rem", lineHeight: 1.85, fontWeight: 300 }}>
                Every thread used in QUTB garments is selected to age alongside the fabric — not to outlast it or give way before it.
              </p>
            </div>
          </FadeIn>
        </div>
      </div>

      {/* Section 03 — Quality Control */}
      <div style={{ padding: "clamp(80px, 12vw, 160px) clamp(24px, 8vw, 120px)" }}>
        <div style={{ maxWidth: 1280, margin: "0 auto", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "clamp(40px, 6vw, 100px)", alignItems: "start" }}>
          <FadeIn delay={0.2}>
            <img
              src={IMG("photo-1628565428823-516b4cb4f590", 900, 1100)}
              alt="Scissors and tools"
              style={{ width: "100%", aspectRatio: "3/4", objectFit: "cover", display: "block" }}
            />
          </FadeIn>
          <FadeIn>
            <div style={{ paddingTop: "clamp(0px, 4vw, 60px)" }}>
              <p style={{ color: "#7C7C75", fontSize: "0.62rem", letterSpacing: "0.24em", textTransform: "uppercase", fontWeight: 300, marginBottom: 20 }}>
                03 — Quality Control
              </p>
              <h2 style={{ color: "#111111", fontFamily: '"Bodoni Moda", serif', fontSize: "clamp(2rem, 4vw, 3.5rem)", fontWeight: 400, letterSpacing: "0.04em", lineHeight: 1.1, marginBottom: 32 }}>
                Stability<br />over perfection.
              </h2>
              <p style={{ color: "#7C7C75", fontSize: "0.88rem", lineHeight: 1.9, fontWeight: 300, maxWidth: 420, marginBottom: 24 }}>
                Quality control at QUTB is not a pass/fail obsession. It is a reading of the garment — checking that every decision made in production has held its intention.
              </p>
              <p style={{ color: "#7C7C75", fontSize: "0.88rem", lineHeight: 1.9, fontWeight: 300, maxWidth: 420, marginBottom: 24 }}>
                We look for: seam stability, tension consistency, hem weight, and how the cloth behaves when pulled. Not how it looks standing still.
              </p>
              <div style={{ borderLeft: "1px solid rgba(17,17,17,0.15)", paddingLeft: 24, marginTop: 36 }}>
                <p style={{ color: "#111111", fontSize: "0.82rem", lineHeight: 1.7, fontWeight: 300, fontStyle: "italic" }}>
                  A garment can look perfect and still fail in six months. A garment can look plain and last a decade. We check for the second.
                </p>
              </div>
            </div>
          </FadeIn>
        </div>
      </div>

      {/* Section 04 — Final Form */}
      <div style={{ backgroundColor: "#1D2635", padding: "clamp(80px, 12vw, 160px) clamp(24px, 8vw, 120px)" }}>
        <div style={{ maxWidth: 960, margin: "0 auto", textAlign: "center" }}>
          <FadeIn>
            <p style={{ color: "rgba(250,248,244,0.4)", fontSize: "0.62rem", letterSpacing: "0.24em", textTransform: "uppercase", fontWeight: 300, marginBottom: 24 }}>
              04 — Final Form
            </p>
            <h2 style={{ color: "#FAF8F4", fontFamily: '"Bodoni Moda", serif', fontSize: "clamp(2.5rem, 6vw, 5rem)", fontWeight: 400, letterSpacing: "0.04em", lineHeight: 1, marginBottom: 48 }}>
              The garment becomes<br />wearable identity.
            </h2>
            <p style={{ color: "rgba(250,248,244,0.6)", fontSize: "0.9rem", lineHeight: 1.9, fontWeight: 300, maxWidth: 560, margin: "0 auto 40px" }}>
              When it leaves the workshop, a QUTB garment is not finished — it is released. It will finish itself in the years that follow. The creases you give it. The softness that comes from washing. The shape it takes from being yours.
            </p>
            <p style={{ color: "rgba(250,248,244,0.4)", fontSize: "0.82rem", lineHeight: 1.75, fontWeight: 300 }}>
              We make the beginning. You make the rest.
            </p>
          </FadeIn>
        </div>
      </div>

      {/* Mannequin image */}
      <div style={{ height: "70vh", minHeight: 480, overflow: "hidden", position: "relative" }}>
        <img
          src={IMG("photo-1770910195240-ddec777b77f6", 2400, 1200)}
          alt="Workshop mannequins"
          style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center 20%" }}
        />
        <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.3)" }} />
      </div>

      {/* Closing */}
      <div style={{ padding: "clamp(80px, 10vw, 140px) clamp(24px, 8vw, 120px)", textAlign: "center" }}>
        <FadeIn>
          <p style={{ color: "#111111", fontFamily: '"Bodoni Moda", serif', fontSize: "clamp(1.5rem, 3vw, 2.5rem)", fontWeight: 400, fontStyle: "italic", letterSpacing: "0.02em" }}>
            Every stitch is a decision.
          </p>
        </FadeIn>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .mfg-grid-2 { grid-template-columns: 1fr !important; }
          .mfg-split { grid-template-columns: 1fr !important; }
        }
      `}</style>
      <QutbFooter />
    </div>
  );
}
