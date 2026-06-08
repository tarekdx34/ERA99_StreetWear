import { useEffect, useRef, useState } from "react";
import { QutbFooter } from "./QutbFooter";

function useInView(threshold = 0.12) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) setVisible(true); },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, visible };
}

function FadeIn({ children, delay = 0, className = "" }: { children: React.ReactNode; delay?: number; className?: string }) {
  const { ref, visible } = useInView();
  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? "none" : "translateY(24px)",
        transition: `opacity 1s ease ${delay}s, transform 1s ease ${delay}s`,
      }}
    >
      {children}
    </div>
  );
}

const IMGS = {
  hero:      "https://images.unsplash.com/photo-1621036382228-d728f0d09e33?w=2400&h=1600&fit=crop&auto=format",
  shirt:     "https://images.unsplash.com/photo-1580682312385-e94d8de1cf3c?w=900&h=700&fit=crop&auto=format",
  sweaters:  "https://images.unsplash.com/photo-1760013529817-f50db943ffe2?w=900&h=700&fit=crop&auto=format",
  hanging:   "https://images.unsplash.com/photo-1760124056977-36d8b8c12275?w=900&h=700&fit=crop&auto=format",
  reading:   "https://images.unsplash.com/photo-1755372397633-b8b4f2124b71?w=900&h=1100&fit=crop&auto=format",
  flowing:   "https://images.unsplash.com/photo-1741173826628-199d13c4914a?w=900&h=1100&fit=crop&auto=format",
};

const principles = [
  {
    number: "01",
    title: "Reduction",
    headline: "Remove until nothing is missing.",
    body: "Every design decision at QUTB begins as a question of removal. Not what to add — what to take away. The process ends when the garment has nothing left to lose.",
    detail: "Decoration is distraction. Proportion is everything. A collar that sits right does more than a logo ever could.",
    img: IMGS.shirt,
  },
  {
    number: "02",
    title: "Permanence",
    headline: "Design for who you will be.",
    body: "A QUTB garment is not designed for this season. It is designed for the version of you that exists in five years — who has the same taste but no time for second-guessing.",
    detail: "Trend is a form of noise. We design in silence.",
    img: IMGS.sweaters,
  },
  {
    number: "03",
    title: "Neutrality",
    headline: "The garment should not speak first.",
    body: "Salt White. Bone. Smoke. Charcoal. The colors of QUTB are chosen because they recede — allowing the wearer to occupy the foreground.",
    detail: "A garment that competes with you is a garment that has failed.",
    img: IMGS.hanging,
  },
];

export function DesignPhilosophyPage() {
  const [heroVisible, setHeroVisible] = useState(false);
  useEffect(() => { const t = setTimeout(() => setHeroVisible(true), 100); return () => clearTimeout(t); }, []);

  return (
    <div style={{ backgroundColor: "#FAF8F4", fontFamily: '"DM Sans", sans-serif', overflowX: "hidden" }}>

      {/* Hero */}
      <div style={{
        position: "relative",
        height: "100svh",
        backgroundColor: "#111111",
        overflow: "hidden",
      }}>
        <img
          src={IMGS.hero}
          alt="Design Philosophy"
          style={{
            position: "absolute", inset: 0,
            width: "100%", height: "100%",
            objectFit: "cover", objectPosition: "center 30%",
            filter: "brightness(0.32) saturate(0.45)",
          }}
        />
        {/* gradient */}
        <div style={{
          position: "absolute", inset: 0,
          background: "linear-gradient(to top, rgba(17,17,17,0.5) 0%, transparent 55%)",
        }} />

        {/* Content — pinned to bottom */}
        <div style={{
          position: "absolute", inset: 0,
          display: "flex", flexDirection: "column",
          justifyContent: "flex-end",
          padding: "clamp(40px,7vw,96px)",
          paddingTop: "88px",
        }}>
          <p style={{
            fontFamily: '"DM Sans", sans-serif', fontSize: "0.6rem",
            letterSpacing: "0.26em", textTransform: "uppercase",
            color: "rgba(250,248,244,0.4)", marginBottom: "clamp(16px,2.5vw,28px)",
            opacity: heroVisible ? 1 : 0,
            transition: "opacity 1.2s ease 0.3s",
          }}>
            Salt Journal — Design
          </p>
          <h1 style={{
            fontFamily: '"Bodoni Moda", serif', fontWeight: 400,
            fontSize: "clamp(3.5rem,11vw,10rem)", lineHeight: 0.88,
            letterSpacing: "-0.01em", color: "#FAF8F4",
            margin: "0 0 clamp(20px,3vw,36px)",
            opacity: heroVisible ? 1 : 0,
            transform: heroVisible ? "translateY(0)" : "translateY(28px)",
            transition: "opacity 1.1s ease 0.45s, transform 1.1s ease 0.45s",
          }}>
            DESIGN<br /><em>PHILOS</em><br />OPHY
          </h1>
          <p style={{
            fontFamily: '"DM Sans", sans-serif', fontWeight: 300,
            fontSize: "clamp(0.82rem,1.3vw,1rem)", letterSpacing: "0.04em",
            color: "rgba(250,248,244,0.5)", maxWidth: 420, lineHeight: 1.8,
            opacity: heroVisible ? 1 : 0,
            transition: "opacity 1.1s ease 0.7s",
          }}>
            A record of how QUTB thinks about clothing. Not as product. Not as fashion. As permanent companions.
          </p>
        </div>

        {/* Scroll label */}
        <p style={{
          position: "absolute",
          bottom: "clamp(24px,4vw,40px)",
          right: "clamp(24px,4vw,40px)",
          writingMode: "vertical-rl",
          fontFamily: '"DM Sans", sans-serif', fontSize: "0.55rem",
          letterSpacing: "0.22em", textTransform: "uppercase",
          color: "rgba(250,248,244,0.35)",
          opacity: heroVisible ? 1 : 0,
          transition: "opacity 1.2s ease 1.2s",
        }}>
          Scroll
        </p>
      </div>

      {/* Intro statement */}
      <div style={{ padding: "clamp(80px,11vw,140px) clamp(24px,8vw,120px)" }}>
        <div style={{ maxWidth: 720, margin: "0 auto", textAlign: "center" }}>
          <FadeIn>
            <p style={{
              fontFamily: '"Bodoni Moda", serif', fontStyle: "italic",
              fontSize: "clamp(1.4rem,3.2vw,2.6rem)", fontWeight: 400,
              lineHeight: 1.45, letterSpacing: "0.01em", color: "#111111",
              margin: "0 0 clamp(24px,4vw,40px)",
            }}>
              "The hardest part of design<br />is deciding what not to include."
            </p>
            <div style={{ width: 24, height: 1, backgroundColor: "rgba(17,17,17,0.2)", margin: "0 auto clamp(24px,4vw,40px)" }} />
            <p style={{ color: "#7C7C75", fontSize: "clamp(0.85rem,1.3vw,1rem)", lineHeight: 1.9, fontWeight: 300 }}>
              QUTB was not built around trends, campaigns, or seasonal collections.
              It was built around a single question: what does a person actually need from a garment?
            </p>
          </FadeIn>
        </div>
      </div>

      {/* Principles */}
      {principles.map((p, i) => (
        <div key={p.number} style={{ backgroundColor: i % 2 === 1 ? "#F5F0E8" : "#FAF8F4" }}>
          <div style={{
            padding: "clamp(60px,9vw,120px) clamp(24px,8vw,120px)",
            maxWidth: 1280, margin: "0 auto",
          }}>
            <div
              className="dp-principle"
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "clamp(40px,6vw,100px)",
                alignItems: "center",
                direction: i % 2 === 1 ? "rtl" : "ltr",
              }}
            >
              <FadeIn delay={i % 2 === 1 ? 0.2 : 0}>
                <img
                  src={p.img}
                  alt={p.title}
                  style={{
                    width: "100%", aspectRatio: "4/3",
                    objectFit: "cover", display: "block",
                    direction: "ltr",
                    filter: "brightness(0.96) saturate(0.72)",
                  }}
                />
              </FadeIn>
              <FadeIn delay={i % 2 === 1 ? 0 : 0.2}>
                <div style={{ direction: "ltr" }}>
                  <p style={{
                    color: "#7C7C75", fontSize: "0.6rem",
                    letterSpacing: "0.24em", textTransform: "uppercase",
                    fontWeight: 300, marginBottom: 16,
                  }}>
                    {p.number} — {p.title}
                  </p>
                  <h2 style={{
                    color: "#111111", fontFamily: '"Bodoni Moda", serif',
                    fontSize: "clamp(1.6rem,3.2vw,2.8rem)", fontWeight: 400,
                    lineHeight: 1.1, letterSpacing: "0.02em", marginBottom: 24,
                  }}>
                    {p.headline}
                  </h2>
                  <p style={{
                    color: "#7C7C75", fontSize: "clamp(0.85rem,1.3vw,1rem)",
                    lineHeight: 1.9, fontWeight: 300,
                    marginBottom: 20, maxWidth: 400,
                  }}>
                    {p.body}
                  </p>
                  <div style={{ borderLeft: "1px solid rgba(17,17,17,0.15)", paddingLeft: 20 }}>
                    <p style={{
                      color: "#111111", fontSize: "clamp(0.82rem,1.2vw,0.95rem)",
                      lineHeight: 1.75, fontWeight: 300, fontStyle: "italic",
                    }}>
                      {p.detail}
                    </p>
                  </div>
                </div>
              </FadeIn>
            </div>
          </div>
        </div>
      ))}

      {/* Final Principle — dark */}
      <div style={{ backgroundColor: "#1A2332" }}>
        <div style={{
          padding: "clamp(80px,12vw,160px) clamp(24px,8vw,120px)",
          maxWidth: 1280, margin: "0 auto",
          display: "grid", gridTemplateColumns: "1fr 1fr",
          gap: "clamp(60px,8vw,120px)", alignItems: "center",
        }}
          className="dp-principle"
        >
          <FadeIn>
            <div>
              <p style={{
                color: "rgba(250,248,244,0.4)", fontSize: "0.6rem",
                letterSpacing: "0.24em", textTransform: "uppercase",
                fontWeight: 300, marginBottom: 24,
              }}>
                04 — Final Principle
              </p>
              <h2 style={{
                color: "#FAF8F4", fontFamily: '"Bodoni Moda", serif',
                fontSize: "clamp(1.8rem,3.8vw,3.2rem)", fontWeight: 400,
                lineHeight: 1.1, letterSpacing: "0.02em", marginBottom: 32,
              }}>
                The garment<br />should disappear.
              </h2>
              <p style={{
                color: "rgba(250,248,244,0.5)", fontSize: "clamp(0.85rem,1.3vw,1rem)",
                lineHeight: 1.9, fontWeight: 300, marginBottom: 20,
              }}>
                A well-designed garment becomes invisible. Not because it is unremarkable — but because it fits the person so naturally that you stop noticing it and start noticing them.
              </p>
              <p style={{
                color: "rgba(250,248,244,0.5)", fontSize: "clamp(0.85rem,1.3vw,1rem)",
                lineHeight: 1.9, fontWeight: 300,
              }}>
                This is the measure we return to at every design stage: does the garment get out of the way?
              </p>
            </div>
          </FadeIn>
          <FadeIn delay={0.25}>
            <img
              src={IMGS.reading}
              alt="Minimal garment"
              style={{
                width: "100%", aspectRatio: "3/4",
                objectFit: "cover", objectPosition: "center top",
                display: "block",
                filter: "brightness(0.85) saturate(0.55)",
              }}
            />
          </FadeIn>
        </div>
      </div>

      {/* Closing */}
      <div style={{ padding: "clamp(100px,12vw,160px) clamp(24px,8vw,120px)", textAlign: "center" }}>
        <FadeIn>
          <p style={{
            color: "#7C7C75", fontSize: "0.62rem",
            letterSpacing: "0.22em", textTransform: "uppercase",
            fontWeight: 300, marginBottom: 28,
          }}>
            QUTB Design Principle
          </p>
          <p style={{
            color: "#111111", fontFamily: '"Bodoni Moda", serif',
            fontSize: "clamp(1.2rem,2.5vw,2rem)", fontWeight: 400,
            fontStyle: "italic", letterSpacing: "0.01em",
            lineHeight: 1.55, maxWidth: 680, margin: "0 auto",
          }}>
            Clothes should not compete with life.<br />They should accompany it.
          </p>
        </FadeIn>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .dp-principle { grid-template-columns: 1fr !important; direction: ltr !important; }
        }
      `}</style>

      <QutbFooter />
    </div>
  );
}
