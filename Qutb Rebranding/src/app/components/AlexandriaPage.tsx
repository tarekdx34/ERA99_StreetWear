import { useState, useEffect, useRef } from "react";
import { navigate } from "../nav";
import { QutbFooter } from "./QutbFooter";

function useInView(threshold = 0.08) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) setInView(true); },
      { threshold }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, inView };
}

const fd = (v: boolean, d = 0): React.CSSProperties => ({
  opacity: v ? 1 : 0,
  transform: v ? "translateY(0)" : "translateY(20px)",
  transition: `opacity 1s ease ${d}s, transform 1s ease ${d}s`,
});

const I = {
  hero:       "https://images.unsplash.com/photo-1674950405763-8bd434d78ea6?w=2400&h=1400&fit=crop&auto=format",
  heroPier:   "https://images.unsplash.com/photo-1675674112541-11c2c4ef39a6?w=2400&h=1400&fit=crop&auto=format",
  rocky:      "https://images.unsplash.com/photo-1717153532426-8eb034c67209?w=1400&h=1900&fit=crop&auto=format",
  cityFish:   "https://images.unsplash.com/photo-1760973566831-4d029dc31c3e?w=2400&h=1400&fit=crop&auto=format",
  coastRoad:  "https://images.unsplash.com/photo-1763059900186-b22b66cd4402?w=1400&h=1900&fit=crop&auto=format",
  womanWall:  "https://images.unsplash.com/photo-1760726744162-c16a56802989?w=1000&h=1500&fit=crop&auto=format",
  womanSea:   "https://images.unsplash.com/photo-1741802872469-b404a312fa91?w=1000&h=1500&fit=crop&auto=format",
  womanCliff: "https://images.unsplash.com/photo-1721251326656-1d27c1933a32?w=1000&h=1400&fit=crop&auto=format",
  archway:    "https://images.unsplash.com/photo-1772741919187-5dd97c25dfb8?w=1200&h=1700&fit=crop&auto=format",
  alley:      "https://images.unsplash.com/photo-1772741919506-6539f9ccb534?w=1200&h=1700&fit=crop&auto=format",
  manSea:     "https://images.unsplash.com/photo-1775220185168-dd9f20eb163e?w=2400&h=1400&fit=crop&auto=format",
};

// ─── Hero ─────────────────────────────────────────────────────────────────────

function Hero() {
  const [vis, setVis] = useState(false);
  useEffect(() => { const t = setTimeout(() => setVis(true), 100); return () => clearTimeout(t); }, []);

  return (
    <section style={{ position: "relative", height: "100svh", overflow: "hidden" }}>
      <img
        src={I.hero}
        alt="Alexandria coast"
        style={{
          position: "absolute", inset: 0, width: "100%", height: "100%",
          objectFit: "cover", objectPosition: "center 40%",
          filter: "brightness(0.65) saturate(0.6)",
          transform: "scale(1.04)",
          transition: "transform 14s ease",
        }}
      />

      {/* Gradient */}
      <div style={{
        position: "absolute", inset: 0,
        background: "linear-gradient(to top, rgba(250,248,244,0.45) 0%, transparent 50%), linear-gradient(to bottom, rgba(17,17,17,0.2) 0%, transparent 30%)",
      }} />

      {/* Content */}
      <div style={{
        position: "absolute", inset: 0, display: "flex",
        flexDirection: "column", justifyContent: "flex-end",
        padding: "clamp(40px,7vw,96px)",
      }}>
        <div style={{ ...fd(vis, 0.3) }}>
          <p style={{
            fontFamily: '"DM Sans", sans-serif', fontSize: "0.62rem",
            letterSpacing: "0.28em", textTransform: "uppercase",
            color: "rgba(250,248,244,0.55)", marginBottom: "clamp(16px,2.5vw,28px)",
          }}>
            31°12′N 29°55′E
          </p>
          <h1 style={{
            fontFamily: '"Bodoni Moda", serif', fontWeight: 400,
            fontSize: "clamp(5rem,16vw,16rem)", lineHeight: 0.87,
            letterSpacing: "-0.02em", color: "#FAF8F4",
            margin: "0 0 clamp(20px,3vw,36px)",
          }}>
            ALEX<br />ANDRIA
          </h1>
          <p style={{
            fontFamily: '"Bodoni Moda", serif', fontStyle: "italic",
            fontSize: "clamp(1rem,2vw,1.6rem)", color: "rgba(250,248,244,0.65)",
            margin: 0,
          }}>
            A city written in salt and light.
          </p>
        </div>
      </div>

      {/* Scroll indicator */}
      <div style={{
        position: "absolute", bottom: "clamp(24px,4vw,40px)", right: "clamp(24px,4vw,40px)",
        writingMode: "vertical-rl", textOrientation: "mixed",
        fontFamily: '"DM Sans", sans-serif', fontSize: "0.55rem",
        letterSpacing: "0.22em", textTransform: "uppercase",
        color: "rgba(250,248,244,0.4)",
        opacity: vis ? 1 : 0, transition: "opacity 1.2s ease 1.2s",
      }}>
        Scroll
      </div>
    </section>
  );
}

// ─── Atmosphere ───────────────────────────────────────────────────────────────

function Atmosphere() {
  const { ref, inView } = useInView(0.05);
  return (
    <section ref={ref} style={{ backgroundColor: "#FAF8F4" }}>

      {/* Full bleed: city fishing */}
      <div style={{ position: "relative", height: "clamp(400px,60vh,720px)", overflow: "hidden" }}>
        <img src={I.cityFish} alt="Alexandria coast city"
          style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center", filter: "brightness(0.88) saturate(0.65)" }}
        />
        <div style={{
          position: "absolute", inset: 0,
          background: "linear-gradient(to right, rgba(17,17,17,0.5) 0%, transparent 50%)",
          display: "flex", alignItems: "center",
        }}>
          <div style={{
            padding: "clamp(32px,6vw,96px)",
            ...fd(inView, 0),
          }}>
            <p style={{
              fontFamily: '"DM Sans", sans-serif', fontSize: "0.58rem",
              letterSpacing: "0.24em", textTransform: "uppercase",
              color: "rgba(250,248,244,0.45)", marginBottom: "clamp(12px,2vw,20px)",
            }}>
              01 — The City
            </p>
            <p style={{
              fontFamily: '"Bodoni Moda", serif', fontStyle: "italic",
              fontSize: "clamp(1.4rem,3.5vw,3.2rem)", lineHeight: 1.2,
              color: "#FAF8F4", margin: 0, maxWidth: "480px",
            }}>
              Salt air.<br />Limestone.<br />Slow coastal rhythm.
            </p>
          </div>
        </div>
      </div>

      {/* Split: rocky shore + text */}
      <div style={{ display: "grid", gridTemplateColumns: "45% 55%", alignItems: "stretch" }}>
        <div style={{ overflow: "hidden" }}>
          <img src={I.rocky} alt="Alexandria rocky shore"
            style={{
              width: "100%", height: "clamp(400px,55vw,680px)", objectFit: "cover",
              objectPosition: "center", filter: "brightness(0.9) saturate(0.6)",
              display: "block",
            }}
          />
        </div>
        <div style={{
          display: "flex", flexDirection: "column", justifyContent: "center",
          padding: "clamp(40px,7vw,110px) clamp(32px,6vw,96px)",
          backgroundColor: "#F5F0E8",
          ...fd(inView, 0.2),
        }}>
          <p style={{
            fontFamily: '"DM Sans", sans-serif', fontSize: "0.58rem",
            letterSpacing: "0.22em", textTransform: "uppercase",
            color: "#7C7C75", marginBottom: "clamp(16px,2.5vw,28px)",
          }}>
            Texture of Place
          </p>
          <p style={{
            fontFamily: '"Bodoni Moda", serif', fontSize: "clamp(1.4rem,3vw,2.6rem)",
            fontWeight: 400, lineHeight: 1.2, color: "#111111",
            margin: "0 0 clamp(16px,2.5vw,28px)",
          }}>
            Stone holds light differently here.
          </p>
          <p style={{
            fontFamily: '"DM Sans", sans-serif', fontWeight: 300,
            fontSize: "clamp(0.85rem,1.3vw,1rem)", lineHeight: 1.9,
            color: "#7C7C75", margin: 0,
          }}>
            Every surface is sun-washed.<br />
            Every colour has already faded once.
          </p>
        </div>
      </div>
    </section>
  );
}

// ─── Wardrobe in Context ──────────────────────────────────────────────────────

function Wardrobe() {
  const { ref, inView } = useInView(0.06);
  const imgs = [
    { src: I.womanSea, alt: "Woman at ocean's edge", tall: true },
    { src: I.womanWall, alt: "Woman sitting on stone wall", tall: true },
    { src: I.womanCliff, alt: "Woman on cliff above sea", tall: false },
  ];

  return (
    <section ref={ref} style={{ backgroundColor: "#111111", padding: "clamp(64px,10vw,120px) 0" }}>
      <div style={{ maxWidth: "1400px", margin: "0 auto", padding: "0 clamp(20px,4vw,48px)" }}>
        <div style={{
          display: "flex", justifyContent: "space-between", alignItems: "flex-end",
          marginBottom: "clamp(40px,6vw,80px)",
          ...fd(inView, 0),
        }}>
          <div>
            <p style={{
              fontFamily: '"DM Sans", sans-serif', fontSize: "0.58rem",
              letterSpacing: "0.24em", textTransform: "uppercase",
              color: "rgba(250,248,244,0.3)", marginBottom: "clamp(10px,1.5vw,16px)",
            }}>
              02 — Wardrobe in Context
            </p>
            <h2 style={{
              fontFamily: '"Bodoni Moda", serif', fontWeight: 400,
              fontSize: "clamp(1.8rem,4vw,3.5rem)", lineHeight: 1.05,
              color: "#FAF8F4", margin: 0,
            }}>
              Neutral tones<br /><em>against stone and sea.</em>
            </h2>
          </div>
        </div>

        {/* 3-col image grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "clamp(4px,0.6vw,10px)" }}>
          {imgs.map((img, i) => (
            <div key={i} style={{ overflow: "hidden", ...fd(inView, 0.12 * i) }}>
              <img
                src={img.src}
                alt={img.alt}
                style={{
                  width: "100%",
                  height: img.tall ? "clamp(380px,52vw,680px)" : "clamp(280px,38vw,500px)",
                  objectFit: "cover", objectPosition: "center top",
                  display: "block",
                  filter: "brightness(0.85) saturate(0.65)",
                  transition: "transform 0.9s ease",
                }}
                onMouseEnter={e => (e.currentTarget.style.transform = "scale(1.04)")}
                onMouseLeave={e => (e.currentTarget.style.transform = "scale(1)")}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Color Study ──────────────────────────────────────────────────────────────

const PALETTE = [
  { name: "Salt White",       hex: "#F5F2ED", desc: "The morning before the city wakes." },
  { name: "Faded Blue",       hex: "#8BA3B8", desc: "The sea at midday, from a distance." },
  { name: "Sun-Washed Beige", hex: "#D4C9B0", desc: "Stone bleached by decades of light." },
  { name: "Concrete Gray",    hex: "#9B9690", desc: "Walls that carry years of weather." },
  { name: "Deep Navy",        hex: "#1D2635", desc: "The horizon at dusk, just before dark." },
];

function ColorStudy() {
  const { ref, inView } = useInView(0.1);
  const [activeIdx, setActiveIdx] = useState(0);

  return (
    <section ref={ref} style={{ backgroundColor: "#FAF8F4", padding: "clamp(64px,10vw,120px) 0" }}>
      <div style={{ maxWidth: "1400px", margin: "0 auto", padding: "0 clamp(20px,4vw,48px)" }}>
        <div style={{ marginBottom: "clamp(40px,6vw,80px)", ...fd(inView, 0) }}>
          <p style={{
            fontFamily: '"DM Sans", sans-serif', fontSize: "0.58rem",
            letterSpacing: "0.24em", textTransform: "uppercase",
            color: "#7C7C75", marginBottom: "clamp(12px,2vw,20px)",
          }}>
            03 — Colour Study
          </p>
          <h2 style={{
            fontFamily: '"Bodoni Moda", serif', fontWeight: 400,
            fontSize: "clamp(1.8rem,4vw,3.5rem)", lineHeight: 1.05,
            color: "#111111", margin: 0,
          }}>
            Alexandria<br /><em>translated into tone.</em>
          </h2>
        </div>

        {/* Palette strips */}
        <div style={{ display: "flex", gap: 0, marginBottom: "clamp(28px,4vw,48px)", ...fd(inView, 0.15) }}>
          {PALETTE.map((c, i) => (
            <div
              key={c.name}
              onClick={() => setActiveIdx(i)}
              style={{
                flex: activeIdx === i ? 3 : 1,
                height: "clamp(160px,22vw,280px)",
                backgroundColor: c.hex,
                border: c.hex === "#F5F2ED" ? "1px solid rgba(17,17,17,0.08)" : "none",
                cursor: "pointer",
                transition: "flex 0.65s ease",
                position: "relative",
                overflow: "hidden",
              }}
            >
              {activeIdx === i && (
                <div style={{
                  position: "absolute", bottom: "clamp(14px,2vw,24px)", left: "clamp(14px,2vw,24px)",
                  opacity: 1, transition: "opacity 0.4s ease 0.3s",
                }}>
                  <p style={{
                    fontFamily: '"DM Sans", sans-serif', fontSize: "0.58rem",
                    letterSpacing: "0.18em", textTransform: "uppercase",
                    color: ["#F5F2ED","#D4C9B0","#8BA3B8"].includes(c.hex) ? "rgba(17,17,17,0.5)" : "rgba(250,248,244,0.6)",
                    margin: 0,
                  }}>
                    {c.name}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Active description */}
        <div style={{ ...fd(inView, 0.25) }}>
          <p style={{
            fontFamily: '"Bodoni Moda", serif', fontStyle: "italic",
            fontSize: "clamp(1rem,2vw,1.5rem)", color: "rgba(17,17,17,0.5)",
            margin: 0,
            transition: "opacity 0.4s ease",
          }}>
            {PALETTE[activeIdx].desc}
          </p>
        </div>
      </div>
    </section>
  );
}

// ─── City Detail Architecture ─────────────────────────────────────────────────

function CityDetail() {
  const { ref, inView } = useInView(0.05);
  return (
    <section ref={ref} style={{ backgroundColor: "#F5F0E8" }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 0 }}>
        <div style={{ overflow: "hidden", ...fd(inView, 0) }}>
          <img src={I.archway} alt="Coastal archway"
            style={{
              width: "100%", height: "clamp(420px,60vw,760px)",
              objectFit: "cover", objectPosition: "center",
              filter: "brightness(0.9) saturate(0.7)", display: "block",
            }}
          />
        </div>
        <div style={{
          display: "flex", flexDirection: "column",
          justifyContent: "flex-end",
          padding: "clamp(40px,7vw,100px) clamp(32px,6vw,80px)",
          ...fd(inView, 0.2),
        }}>
          <p style={{
            fontFamily: '"DM Sans", sans-serif', fontSize: "0.58rem",
            letterSpacing: "0.22em", textTransform: "uppercase",
            color: "#7C7C75", marginBottom: "clamp(16px,2.5vw,28px)",
          }}>
            04 — Architecture
          </p>
          <p style={{
            fontFamily: '"Bodoni Moda", serif',
            fontSize: "clamp(1.5rem,3.2vw,2.8rem)", lineHeight: 1.15,
            color: "#111111", margin: "0 0 clamp(16px,2.5vw,28px)",
          }}>
            Every doorway<br />frames a different light.
          </p>
          <p style={{
            fontFamily: '"DM Sans", sans-serif', fontWeight: 300,
            fontSize: "clamp(0.85rem,1.3vw,1rem)", lineHeight: 1.9,
            color: "#7C7C75", margin: 0,
          }}>
            The city is layered.<br />
            Ottoman stone beneath colonial plaster.<br />
            Sea air softening everything.
          </p>
        </div>
      </div>
    </section>
  );
}

// ─── Origin Statement ────────────────────────────────────────────────────────

function OriginStatement() {
  const { ref, inView } = useInView(0.06);
  return (
    <section ref={ref} style={{ backgroundColor: "#111111" }}>
      {/* Full-bleed alley image with text */}
      <div style={{ position: "relative", height: "clamp(460px,65vh,780px)", overflow: "hidden" }}>
        <img
          src={I.alley}
          alt="Alexandria street"
          style={{
            width: "100%", height: "100%", objectFit: "cover",
            objectPosition: "center 40%",
            filter: "brightness(0.45) saturate(0.35)",
          }}
        />
        <div style={{
          position: "absolute", inset: 0,
          background: "linear-gradient(to right, rgba(17,17,17,0.6) 0%, transparent 55%)",
          display: "flex", alignItems: "flex-end",
          padding: "clamp(40px,7vw,96px)",
        }}>
          <div style={{ maxWidth: "560px", ...fd(inView, 0.2) }}>
            <p style={{
              fontFamily: '"DM Sans", sans-serif', fontSize: "0.56rem",
              letterSpacing: "0.28em", textTransform: "uppercase",
              color: "rgba(250,248,244,0.35)", marginBottom: "clamp(20px,3vw,36px)",
            }}>
              Origin
            </p>
            <p style={{
              fontFamily: '"Bodoni Moda", serif', fontStyle: "italic",
              fontSize: "clamp(1.5rem,3.5vw,3.2rem)", lineHeight: 1.18,
              color: "#FAF8F4", margin: 0,
            }}>
              A port city.<br />
              Always making things.<br />
              Sending them elsewhere.
            </p>
          </div>
        </div>
      </div>

      {/* Text body */}
      <div className="alex-origin-body" style={{
        display: "grid", gridTemplateColumns: "1fr 1fr",
        maxWidth: "1400px", margin: "0 auto",
        padding: "clamp(56px,8vw,120px) clamp(24px,6vw,96px)",
        gap: "clamp(40px,7vw,120px)",
        alignItems: "start",
      }}>
        {/* Left */}
        <div style={{ ...fd(inView, 0.3) }}>
          <p style={{
            fontFamily: '"DM Sans", sans-serif', fontWeight: 300,
            fontSize: "clamp(0.88rem,1.4vw,1.05rem)", lineHeight: 1.95,
            color: "rgba(250,248,244,0.5)", margin: "0 0 clamp(28px,4vw,56px)",
          }}>
            My father has spent twenty years inside the factories of this city.
            Not as a visitor. As someone factories call when they need to understand themselves.
            He knows every step — from the cotton field to the folded garment.
            The people who press the fabric, the ones who set the dye,
            the ones whose hands determine whether something holds.
          </p>
          <p style={{
            fontFamily: '"DM Sans", sans-serif', fontWeight: 300,
            fontSize: "clamp(0.88rem,1.4vw,1.05rem)", lineHeight: 1.95,
            color: "rgba(250,248,244,0.5)", margin: 0,
          }}>
            QUTB began two years ago, as an argument.
            A son trying to persuade his father that the knowledge was worth building on.
            This summer, his father agreed.
          </p>
        </div>

        {/* Right: closing line */}
        <div style={{
          display: "flex", flexDirection: "column", justifyContent: "flex-end",
          ...fd(inView, 0.45),
        }}>
          <div style={{ width: "28px", height: "1px", backgroundColor: "rgba(250,248,244,0.2)", marginBottom: "clamp(28px,4vw,48px)" }} />
          <p style={{
            fontFamily: '"Bodoni Moda", serif',
            fontSize: "clamp(1.8rem,4vw,3.6rem)", lineHeight: 1.1,
            color: "#FAF8F4", margin: 0,
          }}>
            We are from Alexandria.
          </p>
          <p style={{
            fontFamily: '"Bodoni Moda", serif', fontStyle: "italic",
            fontSize: "clamp(1.4rem,3.2vw,2.8rem)", lineHeight: 1.2,
            color: "rgba(250,248,244,0.45)", margin: "clamp(8px,1vw,12px) 0 0",
          }}>
            What we make will come from here.
          </p>
        </div>
      </div>
    </section>
  );
}

// ─── Slow Life ────────────────────────────────────────────────────────────────

function SlowLife() {
  const { ref, inView } = useInView(0.05);
  return (
    <section ref={ref} style={{ backgroundColor: "#FAF8F4" }}>
      {/* Full-bleed man by sea */}
      <div style={{ position: "relative", height: "clamp(380px,58vh,720px)", overflow: "hidden" }}>
        <img src={I.manSea} alt="Man relaxing by the ocean"
          style={{
            width: "100%", height: "100%", objectFit: "cover",
            objectPosition: "center 40%",
            filter: "brightness(0.85) saturate(0.62)",
          }}
        />
        <div style={{
          position: "absolute", inset: 0,
          background: "linear-gradient(to left, rgba(250,248,244,0.4) 0%, transparent 40%)",
          display: "flex", alignItems: "center", justifyContent: "flex-end",
        }}>
          <div style={{
            padding: "clamp(32px,6vw,96px)",
            textAlign: "right",
            ...fd(inView, 0.2),
          }}>
            <p style={{
              fontFamily: '"DM Sans", sans-serif', fontSize: "0.58rem",
              letterSpacing: "0.22em", textTransform: "uppercase",
              color: "rgba(250,248,244,0.5)", marginBottom: "clamp(12px,2vw,20px)",
            }}>
              05 — Slow Life
            </p>
            <p style={{
              fontFamily: '"Bodoni Moda", serif', fontStyle: "italic",
              fontSize: "clamp(1.2rem,3vw,2.6rem)", lineHeight: 1.25,
              color: "#FAF8F4", margin: 0,
            }}>
              Walking.<br />Waiting.<br />Sitting near sea.
            </p>
          </div>
        </div>
      </div>

      {/* Wide sea + text */}
      <div style={{ overflow: "hidden" }}>
        <img src={I.heroPier} alt="Alexandria sea horizon"
          style={{
            width: "100%", height: "clamp(240px,32vh,440px)",
            objectFit: "cover", objectPosition: "center 55%",
            filter: "brightness(0.88) saturate(0.55)",
            display: "block",
          }}
        />
      </div>
    </section>
  );
}

// ─── Closing ─────────────────────────────────────────────────────────────────

function Closing() {
  const { ref, inView } = useInView(0.12);
  return (
    <section ref={ref} style={{
      backgroundColor: "#FAF8F4",
      minHeight: "70vh",
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      textAlign: "center",
      padding: "clamp(80px,14vw,160px) clamp(24px,8vw,120px)",
    }}>
      <p style={{
        fontFamily: '"DM Sans", sans-serif', fontSize: "0.6rem",
        letterSpacing: "0.24em", textTransform: "uppercase",
        color: "#7C7C75", marginBottom: "clamp(40px,7vw,80px)",
        ...fd(inView, 0),
      }}>
        06 — Remaining
      </p>

      <h2 style={{
        fontFamily: '"Bodoni Moda", serif', fontWeight: 400,
        fontSize: "clamp(2rem,5.5vw,5rem)", lineHeight: 1.1,
        color: "#111111", margin: "0 0 clamp(12px,2vw,20px)",
        ...fd(inView, 0.15),
      }}>
        A city is not visited.
      </h2>
      <p style={{
        fontFamily: '"Bodoni Moda", serif', fontStyle: "italic",
        fontSize: "clamp(1.4rem,3.2vw,3rem)", fontWeight: 400,
        color: "rgba(17,17,17,0.4)", margin: "0 0 clamp(32px,5vw,64px)",
        ...fd(inView, 0.25),
      }}>
        It is absorbed.
      </p>

      <p style={{
        fontFamily: '"DM Sans", sans-serif', fontWeight: 300,
        fontSize: "clamp(0.82rem,1.3vw,1rem)", lineHeight: 1.9,
        color: "#7C7C75", maxWidth: "480px",
        margin: "0 0 clamp(48px,8vw,96px)",
        ...fd(inView, 0.35),
      }}>
        Alexandria remains in fabric<br />long after it leaves the body.
      </p>

      <div style={{
        width: "1px", height: "clamp(36px,5vw,56px)",
        backgroundColor: "rgba(17,17,17,0.15)",
        margin: "0 auto clamp(28px,4vw,48px)",
        ...fd(inView, 0.45),
      }} />

      <button
        onClick={() => navigate("collection")}
        style={{
          fontFamily: '"Bodoni Moda", serif', fontSize: "clamp(1.2rem,2.5vw,2rem)",
          fontWeight: 400, letterSpacing: "0.2em",
          color: "#111111", background: "none", border: "none",
          borderBottom: "1px solid rgba(17,17,17,0.2)", paddingBottom: "4px",
          cursor: "pointer",
          ...fd(inView, 0.6),
        }}
        onMouseEnter={e => (e.currentTarget.style.opacity = "0.4")}
        onMouseLeave={e => (e.currentTarget.style.opacity = "1")}
      >
        QUTB
      </button>
    </section>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export function AlexandriaPage() {
  return (
    <div style={{ backgroundColor: "#FAF8F4", fontFamily: '"DM Sans", sans-serif', overflowX: "hidden" }}>
      <style>{`
        @media (max-width: 768px) {
          .alex-origin-body { grid-template-columns: 1fr !important; }
          .alex-split { grid-template-columns: 1fr !important; }
          .alex-wardrobe { grid-template-columns: 1fr 1fr !important; }
          .alex-city-detail { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 500px) {
          .alex-wardrobe { grid-template-columns: 1fr !important; }
        }
      `}</style>
      <Hero />
      <Atmosphere />
      <Wardrobe />
      <ColorStudy />
      <CityDetail />
      <OriginStatement />
      <SlowLife />
      <Closing />
      <QutbFooter />
    </div>
  );
}
