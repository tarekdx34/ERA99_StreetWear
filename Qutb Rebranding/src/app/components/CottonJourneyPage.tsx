import { useState, useEffect, useRef } from "react";
import { QutbFooter } from "./QutbFooter";
import { navigate } from "../nav";

function useInView(threshold = 0.12) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setInView(true); },
      { threshold }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, inView };
}

const fade = (inView: boolean, delay = 0): React.CSSProperties => ({
  opacity: inView ? 1 : 0,
  transform: inView ? "translateY(0)" : "translateY(22px)",
  transition: `opacity 0.9s ease ${delay}s, transform 0.9s ease ${delay}s`,
});

const FACTORY = {
  floor:   "https://images.unsplash.com/photo-1742203099885-637207150c33?w=2400&h=1600&fit=crop&auto=format",
  worker:  "https://images.unsplash.com/photo-1579971608489-b735eababf49?w=1400&h=1900&fit=crop&auto=format",
  team:    "https://images.unsplash.com/photo-1764114909312-c27b89ec7223?w=2400&h=1600&fit=crop&auto=format",
  weave:   "https://images.unsplash.com/photo-1594332495179-d979bcd18142?w=1400&h=1900&fit=crop&auto=format",
};

const IMG = {
  fieldWide:    "https://images.unsplash.com/photo-1761069183877-fe29a212e5eb?w=2400&h=1300&fit=crop&auto=format",
  fieldClose:   "https://images.unsplash.com/photo-1761069183527-a1a1414ee71f?w=1400&h=1900&fit=crop&auto=format",
  knitMacro:    "https://images.unsplash.com/photo-1643313260651-9c335822ecde?w=1600&h=2100&fit=crop&auto=format",
  textileShadow:"https://images.unsplash.com/photo-1581439648213-e8fb82dd22ab?w=900&h=1200&fit=crop&auto=format",
  threadLot:    "https://images.unsplash.com/photo-1574883140236-2e2cb0835792?w=2400&h=1400&fit=crop&auto=format",
  weavingTable: "https://images.unsplash.com/photo-1591625591034-75d303d2e1a4?w=1000&h=1400&fit=crop&auto=format",
  womanWhite:   "https://images.unsplash.com/photo-1627130697816-4d71dbfe6a5b?w=900&h=1300&fit=crop&auto=format",
  manTee:       "https://images.unsplash.com/photo-1627225793904-a2f900a6e4cf?w=900&h=1300&fit=crop&auto=format",
  coupleNeutral:"https://images.unsplash.com/photo-1650388033943-72790a65095c?w=900&h=1300&fit=crop&auto=format",
  flowingCloth: "https://images.unsplash.com/photo-1741173826628-199d13c4914a?w=1400&h=1900&fit=crop&auto=format",
  plantShadow:  "https://images.unsplash.com/photo-1690893631932-2ad83b51afcd?w=1200&h=1600&fit=crop&auto=format",
  modelsWide:   "https://images.unsplash.com/photo-1743751747067-49d618650353?w=1800&h=1100&fit=crop&auto=format",
  womanSitting: "https://images.unsplash.com/photo-1684749683874-26a0ec676111?w=900&h=1300&fit=crop&auto=format",
  manWalking:   "https://images.unsplash.com/photo-1627225924765-552d49cf47ad?w=900&h=1300&fit=crop&auto=format",
};

// ─── Hero ────────────────────────────────────────────────────────────────────

function Hero() {
  const [visible, setVisible] = useState(false);
  useEffect(() => { const t = setTimeout(() => setVisible(true), 100); return () => clearTimeout(t); }, []);

  return (
    <section style={{
      minHeight: "100svh",
      backgroundColor: "#FAF8F4",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      position: "relative",
      overflow: "hidden",
      paddingTop: "72px",
    }}>
      {/* Grain overlay */}
      <div style={{
        position: "absolute", inset: 0, pointerEvents: "none", zIndex: 1,
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='0.035'/%3E%3C/svg%3E")`,
        backgroundSize: "200px 200px",
        opacity: 0.6,
      }} />

      <div style={{
        textAlign: "center",
        padding: "0 clamp(24px, 8vw, 120px)",
        position: "relative",
        zIndex: 2,
      }}>
        <p style={{
          fontFamily: '"DM Sans", sans-serif',
          fontSize: "0.65rem",
          letterSpacing: "0.28em",
          textTransform: "uppercase",
          color: "#7C7C75",
          marginBottom: "clamp(24px, 4vw, 48px)",
          opacity: visible ? 1 : 0,
          transition: "opacity 1.2s ease 0.2s",
        }}>
          From Fiber to Form
        </p>

        <h1 style={{
          fontFamily: '"Bodoni Moda", serif',
          fontSize: "clamp(4rem, 13vw, 13rem)",
          fontWeight: 400,
          lineHeight: 0.9,
          letterSpacing: "-0.02em",
          color: "#111111",
          margin: 0,
          opacity: visible ? 1 : 0,
          transform: visible ? "translateY(0)" : "translateY(32px)",
          transition: "opacity 1.1s ease 0.4s, transform 1.1s ease 0.4s",
        }}>
          A Journey
        </h1>

        <h1 style={{
          fontFamily: '"Bodoni Moda", serif',
          fontStyle: "italic",
          fontSize: "clamp(4rem, 13vw, 13rem)",
          fontWeight: 400,
          lineHeight: 0.9,
          letterSpacing: "-0.02em",
          color: "#111111",
          margin: "0 0 clamp(32px, 5vw, 64px)",
          opacity: visible ? 1 : 0,
          transform: visible ? "translateY(0)" : "translateY(32px)",
          transition: "opacity 1.1s ease 0.55s, transform 1.1s ease 0.55s",
        }}>
          in Cotton
        </h1>

        <div style={{
          width: "1px",
          height: "clamp(48px, 6vw, 80px)",
          backgroundColor: "rgba(17,17,17,0.2)",
          margin: "0 auto",
          opacity: visible ? 1 : 0,
          transition: "opacity 1.2s ease 0.9s",
        }} />
      </div>

      {/* Scroll hint */}
      <p style={{
        position: "absolute",
        bottom: "clamp(24px, 4vw, 40px)",
        left: "50%",
        transform: "translateX(-50%)",
        fontFamily: '"DM Sans", sans-serif',
        fontSize: "0.6rem",
        letterSpacing: "0.22em",
        textTransform: "uppercase",
        color: "rgba(17,17,17,0.3)",
        zIndex: 2,
        opacity: visible ? 1 : 0,
        transition: "opacity 1.2s ease 1.2s",
      }}>
        Scroll
      </p>
    </section>
  );
}

// ─── Founder Intro ───────────────────────────────────────────────────────────

function FounderIntro() {
  const { ref, inView } = useInView(0.05);
  return (
    <section ref={ref}>

      {/* Full-bleed factory floor */}
      <div style={{ position: "relative", height: "clamp(420px,62vh,760px)", overflow: "hidden" }}>
        <img
          src={FACTORY.floor}
          alt="Textile factory floor"
          style={{
            width: "100%", height: "100%", objectFit: "cover",
            objectPosition: "center 35%",
            filter: "brightness(0.55) saturate(0.4)",
          }}
        />
        <div style={{
          position: "absolute", inset: 0,
          background: "linear-gradient(to top, rgba(17,17,17,0.6) 0%, transparent 50%)",
          display: "flex", alignItems: "flex-end",
          padding: "clamp(40px,6vw,80px)",
        }}>
          <div style={{ ...fade(inView, 0.2) }}>
            <p style={{
              fontFamily: '"DM Sans", sans-serif', fontSize: "0.56rem",
              letterSpacing: "0.26em", textTransform: "uppercase",
              color: "rgba(250,248,244,0.4)", marginBottom: "clamp(14px,2vw,24px)",
            }}>
              Alexandria — One Month Ago
            </p>
            <p style={{
              fontFamily: '"Bodoni Moda", serif', fontStyle: "italic",
              fontSize: "clamp(1.4rem,3.5vw,3rem)", lineHeight: 1.2,
              color: "#FAF8F4", margin: 0, maxWidth: "640px",
            }}>
              I stood in one of Alexandria's largest factories<br />
              and watched something happen.
            </p>
          </div>
        </div>
      </div>

      {/* Split: worker image + scene text */}
      <div className="cj-founder-split" style={{
        display: "grid", gridTemplateColumns: "40% 60%",
        backgroundColor: "#F5F0E8",
      }}>
        <div style={{ overflow: "hidden" }}>
          <img
            src={FACTORY.worker}
            alt="Factory worker at machine"
            style={{
              width: "100%", height: "clamp(380px,52vw,640px)",
              objectFit: "cover", objectPosition: "center",
              filter: "brightness(0.88) saturate(0.5)",
              display: "block",
            }}
          />
        </div>
        <div style={{
          display: "flex", flexDirection: "column", justifyContent: "center",
          padding: "clamp(48px,8vw,120px) clamp(40px,6vw,96px)",
          ...fade(inView, 0.3),
        }}>
          <p style={{
            fontFamily: '"DM Sans", sans-serif', fontSize: "0.58rem",
            letterSpacing: "0.22em", textTransform: "uppercase",
            color: "#7C7C75", marginBottom: "clamp(20px,3vw,36px)",
          }}>
            The Visit
          </p>
          <p style={{
            fontFamily: '"Bodoni Moda", serif',
            fontSize: "clamp(1.3rem,2.8vw,2.4rem)", lineHeight: 1.25,
            color: "#111111", margin: "0 0 clamp(20px,3vw,36px)",
          }}>
            The factory owner walked his own managers to my father.
          </p>
          <p style={{
            fontFamily: '"DM Sans", sans-serif', fontWeight: 300,
            fontSize: "clamp(0.88rem,1.4vw,1.05rem)", lineHeight: 1.9,
            color: "#7C7C75", margin: 0,
          }}>
            Not to introduce him. To have him explain — from raw cotton to finished price,
            how the process works — to his own team.
            My father spoke for an hour.
            No one interrupted.
          </p>
        </div>
      </div>

      {/* Knowledge block + team image */}
      <div className="cj-founder-split" style={{
        display: "grid", gridTemplateColumns: "60% 40%",
        backgroundColor: "#FAF8F4",
      }}>
        <div style={{
          display: "flex", flexDirection: "column", justifyContent: "center",
          padding: "clamp(56px,9vw,130px) clamp(40px,6vw,96px)",
          ...fade(inView, 0.4),
        }}>
          <p style={{
            fontFamily: '"DM Sans", sans-serif', fontSize: "0.58rem",
            letterSpacing: "0.22em", textTransform: "uppercase",
            color: "#7C7C75", marginBottom: "clamp(20px,3vw,36px)",
          }}>
            The Inheritance
          </p>
          <p style={{
            fontFamily: '"DM Sans", sans-serif', fontWeight: 300,
            fontSize: "clamp(0.9rem,1.5vw,1.1rem)", lineHeight: 1.95,
            color: "#4A4A45", margin: "0 0 clamp(28px,4vw,56px)",
          }}>
            He has spent twenty years acquiring this. It did not come from study —
            it came from presence. From being the person other factories call when
            something is wrong. From knowing, specifically, what happens to Giza cotton
            when it is spun tight versus loose. What dyeing does to hand.
            How a fabric's weight changes between summer and winter production runs.
          </p>
          <p style={{
            fontFamily: '"Bodoni Moda", serif', fontStyle: "italic",
            fontSize: "clamp(1.2rem,2.5vw,2rem)", lineHeight: 1.3,
            color: "#111111", margin: 0,
          }}>
            Giza cotton is not a marketing designation.<br />
            Length means strength.<br />
            Strength means the fabric does not betray you.
          </p>
        </div>
        <div style={{ overflow: "hidden", ...fade(inView, 0.5) }}>
          <img
            src={FACTORY.weave}
            alt="Woven textile detail"
            style={{
              width: "100%", height: "clamp(400px,55vw,680px)",
              objectFit: "cover", objectPosition: "center",
              filter: "brightness(0.9) saturate(0.6)",
              display: "block",
            }}
          />
        </div>
      </div>

      {/* Closing line — full width */}
      <div style={{
        backgroundColor: "#111111",
        padding: "clamp(56px,8vw,100px) clamp(24px,6vw,96px)",
        textAlign: "center",
        ...fade(inView, 0.55),
      }}>
        <p style={{
          fontFamily: '"Bodoni Moda", serif',
          fontSize: "clamp(2rem,5.5vw,5.5rem)", fontWeight: 400,
          letterSpacing: "0.04em", lineHeight: 1,
          color: "#FAF8F4", margin: 0,
        }}>
          This is what we start with.
        </p>
      </div>
    </section>
  );
}

// ─── Origin ──────────────────────────────────────────────────────────────────

function Origin() {
  const { ref, inView } = useInView(0.05);
  return (
    <section ref={ref} style={{ position: "relative" }}>
      {/* Full-bleed wide field image */}
      <div style={{ position: "relative", height: "85vh", overflow: "hidden" }}>
        <img
          src={IMG.fieldWide}
          alt="Cotton field at sunrise"
          style={{
            width: "100%", height: "100%", objectFit: "cover",
            objectPosition: "center 40%",
            filter: "brightness(0.92) saturate(0.85)",
            transform: "scale(1.03)",
            transition: "transform 12s ease",
          }}
        />
        {/* Gradient bottom */}
        <div style={{
          position: "absolute", inset: 0,
          background: "linear-gradient(to top, rgba(250,248,244,0.5) 0%, transparent 40%)",
        }} />

        {/* Caption bottom-left */}
        <div style={{
          position: "absolute",
          bottom: "clamp(28px, 5vw, 56px)",
          left: "clamp(24px, 6vw, 80px)",
          ...fade(inView, 0.3),
        }}>
          <p style={{
            fontFamily: '"Bodoni Moda", serif',
            fontStyle: "italic",
            fontSize: "clamp(1rem, 2.5vw, 1.8rem)",
            color: "#FAF8F4",
            margin: 0,
            letterSpacing: "0.01em",
            textShadow: "0 1px 20px rgba(0,0,0,0.15)",
          }}>
            Cotton grows slowly.
          </p>
          <p style={{
            fontFamily: '"DM Sans", sans-serif',
            fontSize: "0.65rem",
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            color: "rgba(250,248,244,0.65)",
            marginTop: "8px",
          }}>
            Egypt — Nile Delta
          </p>
        </div>

        {/* Caption top-right */}
        <p style={{
          position: "absolute",
          top: "clamp(24px, 4vw, 48px)",
          right: "clamp(24px, 5vw, 64px)",
          fontFamily: '"DM Sans", sans-serif',
          fontSize: "0.6rem",
          letterSpacing: "0.2em",
          textTransform: "uppercase",
          color: "rgba(250,248,244,0.5)",
          ...fade(inView, 0.6),
        }}>
          01 — Origin
        </p>
      </div>

      {/* Below image: close-up + text */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: 0,
        backgroundColor: "#F5F0E8",
      }}>
        <div style={{ height: "clamp(300px, 50vw, 640px)", overflow: "hidden" }}>
          <img
            src={IMG.fieldClose}
            alt="Cotton bolls at sunset"
            style={{
              width: "100%", height: "100%", objectFit: "cover",
              objectPosition: "center",
              filter: "saturate(0.8) brightness(0.95)",
            }}
          />
        </div>
        <div style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "clamp(40px, 8vw, 120px) clamp(32px, 6vw, 96px)",
          ...fade(inView, 0.4),
        }}>
          <p style={{
            fontFamily: '"DM Sans", sans-serif',
            fontSize: "0.6rem",
            letterSpacing: "0.22em",
            textTransform: "uppercase",
            color: "#7C7C75",
            marginBottom: "clamp(20px, 3vw, 32px)",
          }}>
            The Field
          </p>
          <p style={{
            fontFamily: '"Bodoni Moda", serif',
            fontStyle: "italic",
            fontSize: "clamp(1.4rem, 3.5vw, 3rem)",
            fontWeight: 400,
            lineHeight: 1.25,
            color: "#111111",
            margin: 0,
          }}>
            Under the same light,<br />for a thousand seasons.
          </p>
        </div>
      </div>
    </section>
  );
}

// ─── Fiber ───────────────────────────────────────────────────────────────────

function Fiber() {
  const { ref, inView } = useInView(0.1);
  return (
    <section ref={ref} style={{ backgroundColor: "#FAF8F4", padding: "clamp(64px, 10vw, 140px) 0" }}>
      <div style={{
        maxWidth: "1400px",
        margin: "0 auto",
        padding: "0 clamp(20px, 4vw, 48px)",
      }}>
        {/* Section label */}
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-end",
          marginBottom: "clamp(40px, 6vw, 80px)",
          ...fade(inView, 0),
        }}>
          <p style={{
            fontFamily: '"DM Sans", sans-serif',
            fontSize: "0.6rem",
            letterSpacing: "0.22em",
            textTransform: "uppercase",
            color: "#7C7C75",
          }}>
            02 — Fiber
          </p>
          <p style={{
            fontFamily: '"Bodoni Moda", serif',
            fontStyle: "italic",
            fontSize: "clamp(1rem, 2vw, 1.5rem)",
            color: "rgba(17,17,17,0.4)",
            margin: 0,
          }}>
            The beginning of touch.
          </p>
        </div>

        {/* Asymmetric image pair */}
        <div style={{ display: "grid", gridTemplateColumns: "62% 38%", gap: "clamp(12px, 2vw, 24px)", alignItems: "end" }}>
          <div style={{ overflow: "hidden", ...fade(inView, 0.15) }}>
            <img
              src={IMG.knitMacro}
              alt="White knit textile macro"
              style={{
                width: "100%",
                height: "clamp(480px, 65vw, 780px)",
                objectFit: "cover",
                objectPosition: "center",
                display: "block",
                filter: "brightness(0.97) saturate(0.7)",
              }}
            />
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "clamp(12px, 2vw, 24px)" }}>
            <div style={{ overflow: "hidden", ...fade(inView, 0.3) }}>
              <img
                src={IMG.textileShadow}
                alt="White textile with shadow"
                style={{
                  width: "100%",
                  height: "clamp(260px, 35vw, 460px)",
                  objectFit: "cover",
                  objectPosition: "center",
                  display: "block",
                  filter: "brightness(0.95) saturate(0.65)",
                }}
              />
            </div>
            <div style={{ padding: "clamp(20px, 3vw, 40px) clamp(16px, 2vw, 32px)", ...fade(inView, 0.45) }}>
              <p style={{
                fontFamily: '"Bodoni Moda", serif',
                fontSize: "clamp(1.1rem, 2.2vw, 1.8rem)",
                fontWeight: 400,
                lineHeight: 1.35,
                color: "#111111",
                margin: 0,
              }}>
                Long fibers.<br />Quiet strength.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Thread ──────────────────────────────────────────────────────────────────

function Thread() {
  const { ref, inView } = useInView(0.05);
  return (
    <section ref={ref} style={{ position: "relative", backgroundColor: "#111111" }}>
      <div style={{ position: "relative", height: "60vh", overflow: "hidden" }}>
        <img
          src={IMG.threadLot}
          alt="Threads"
          style={{
            width: "100%", height: "100%", objectFit: "cover",
            objectPosition: "center 30%",
            filter: "brightness(0.55) saturate(0.3)",
          }}
        />

        {/* Centered text overlay */}
        <div style={{
          position: "absolute", inset: 0,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          ...fade(inView, 0.2),
        }}>
          <p style={{
            fontFamily: '"DM Sans", sans-serif',
            fontSize: "0.58rem",
            letterSpacing: "0.28em",
            textTransform: "uppercase",
            color: "rgba(250,248,244,0.4)",
            marginBottom: "clamp(12px, 2vw, 24px)",
          }}>
            03 — Thread
          </p>
          <h2 style={{
            fontFamily: '"Bodoni Moda", serif',
            fontSize: "clamp(3rem, 8vw, 8rem)",
            fontWeight: 400,
            letterSpacing: "0.06em",
            color: "#FAF8F4",
            margin: 0,
            lineHeight: 1,
          }}>
            CONTINUITY
          </h2>
        </div>
      </div>

      {/* Below: two images + text */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        maxWidth: "1400px",
        margin: "0 auto",
        padding: "clamp(48px, 8vw, 120px) clamp(20px, 4vw, 48px)",
        gap: "clamp(24px, 5vw, 80px)",
        alignItems: "center",
      }}>
        <div style={{ overflow: "hidden", ...fade(inView, 0.3) }}>
          <img
            src={IMG.weavingTable}
            alt="Woven textile"
            style={{
              width: "100%",
              height: "clamp(320px, 40vw, 560px)",
              objectFit: "cover",
              display: "block",
              filter: "brightness(0.93) saturate(0.7)",
            }}
          />
        </div>
        <div style={{ ...fade(inView, 0.45) }}>
          <p style={{
            fontFamily: '"Bodoni Moda", serif',
            fontStyle: "italic",
            fontSize: "clamp(1.3rem, 3vw, 2.4rem)",
            lineHeight: 1.3,
            color: "#FAF8F4",
            margin: "0 0 clamp(20px, 3vw, 36px)",
          }}>
            Craft before<br />machinery.
          </p>
          <p style={{
            fontFamily: '"DM Sans", sans-serif',
            fontSize: "0.7rem",
            letterSpacing: "0.12em",
            color: "rgba(250,248,244,0.4)",
            lineHeight: 1.7,
          }}>
            The same quiet repetition.<br />The same slow patience.
          </p>
        </div>
      </div>
    </section>
  );
}

// ─── Weight ──────────────────────────────────────────────────────────────────

function Weight() {
  const { ref, inView } = useInView(0.08);
  const weights = [
    { img: IMG.womanWhite, label: "Air", desc: "Moves with summer." },
    { img: IMG.manTee,     label: "Everyday", desc: "Present in all things." },
    { img: IMG.coupleNeutral, label: "Structure", desc: "Grounded, deliberate." },
  ];

  return (
    <section ref={ref} style={{ backgroundColor: "#F5F0E8", padding: "clamp(64px, 10vw, 120px) 0" }}>
      <div style={{ maxWidth: "1400px", margin: "0 auto", padding: "0 clamp(20px, 4vw, 48px)" }}>
        <div style={{ ...fade(inView, 0), marginBottom: "clamp(48px, 7vw, 96px)" }}>
          <p style={{
            fontFamily: '"DM Sans", sans-serif',
            fontSize: "0.6rem",
            letterSpacing: "0.22em",
            textTransform: "uppercase",
            color: "#7C7C75",
            marginBottom: "clamp(12px, 2vw, 20px)",
          }}>
            04 — The Weight of Wear
          </p>
          <p style={{
            fontFamily: '"Bodoni Moda", serif',
            fontSize: "clamp(1.5rem, 4vw, 3.5rem)",
            fontWeight: 400,
            color: "#111111",
            margin: 0,
            lineHeight: 1.1,
          }}>
            How clothing<br /><em>sits on the body.</em>
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "clamp(8px, 2vw, 24px)" }}>
          {weights.map((w, i) => (
            <div key={w.label} style={{ ...fade(inView, 0.15 + i * 0.12) }}>
              <div style={{ overflow: "hidden", marginBottom: "clamp(16px, 2.5vw, 28px)" }}>
                <img
                  src={w.img}
                  alt={w.label}
                  style={{
                    width: "100%",
                    height: "clamp(360px, 55vw, 680px)",
                    objectFit: "cover",
                    objectPosition: "center top",
                    display: "block",
                    filter: "brightness(0.95) saturate(0.75)",
                    transition: "transform 0.8s ease",
                  }}
                  onMouseEnter={e => (e.currentTarget.style.transform = "scale(1.03)")}
                  onMouseLeave={e => (e.currentTarget.style.transform = "scale(1)")}
                />
              </div>
              <p style={{
                fontFamily: '"Bodoni Moda", serif',
                fontSize: "clamp(1.1rem, 2.5vw, 2rem)",
                fontWeight: 400,
                color: "#111111",
                margin: "0 0 6px",
              }}>
                {w.label}.
              </p>
              <p style={{
                fontFamily: '"DM Sans", sans-serif',
                fontSize: "0.68rem",
                letterSpacing: "0.1em",
                color: "#7C7C75",
                margin: 0,
                fontWeight: 300,
              }}>
                {w.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Dye & Tone ──────────────────────────────────────────────────────────────

const TONES = [
  { name: "Salt",    hex: "#FAF8F4" },
  { name: "Bone",    hex: "#E8E2D8" },
  { name: "Stone",   hex: "#A89F95" },
  { name: "Sea",     hex: "#6B6560" },
  { name: "Charcoal",hex: "#2A2825" },
];

function DyeTone() {
  const { ref, inView } = useInView(0.1);
  return (
    <section ref={ref} style={{ backgroundColor: "#FAF8F4", padding: "clamp(64px, 10vw, 120px) 0" }}>
      <div style={{
        maxWidth: "1400px", margin: "0 auto",
        padding: "0 clamp(20px, 4vw, 48px)",
        display: "grid",
        gridTemplateColumns: "55% 45%",
        gap: "clamp(32px, 5vw, 80px)",
        alignItems: "center",
      }}>
        {/* Left: large image */}
        <div style={{ overflow: "hidden", ...fade(inView, 0.1) }}>
          <img
            src={IMG.flowingCloth}
            alt="Flowing white cloth"
            style={{
              width: "100%",
              height: "clamp(480px, 65vw, 820px)",
              objectFit: "cover",
              objectPosition: "center",
              display: "block",
              filter: "brightness(0.96) saturate(0.6)",
            }}
          />
        </div>

        {/* Right: text + swatches */}
        <div style={{ ...fade(inView, 0.3) }}>
          <p style={{
            fontFamily: '"DM Sans", sans-serif',
            fontSize: "0.6rem",
            letterSpacing: "0.22em",
            textTransform: "uppercase",
            color: "#7C7C75",
            marginBottom: "clamp(24px, 4vw, 48px)",
          }}>
            05 — Dye & Tone
          </p>

          <p style={{
            fontFamily: '"Bodoni Moda", serif',
            fontSize: "clamp(1.6rem, 3.5vw, 3rem)",
            fontWeight: 400,
            lineHeight: 1.2,
            color: "#111111",
            margin: "0 0 clamp(8px, 1.5vw, 16px)",
          }}>
            Colour as memory.
          </p>
          <p style={{
            fontFamily: '"Bodoni Moda", serif',
            fontStyle: "italic",
            fontSize: "clamp(1.2rem, 2.5vw, 2rem)",
            fontWeight: 400,
            lineHeight: 1.3,
            color: "rgba(17,17,17,0.45)",
            margin: "0 0 clamp(36px, 6vw, 72px)",
          }}>
            Fade as character,<br />not defect.
          </p>

          {/* Colour swatches */}
          <div style={{ display: "flex", flexDirection: "column", gap: "0" }}>
            {TONES.map((tone, i) => (
              <div
                key={tone.name}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "clamp(16px, 2.5vw, 32px)",
                  padding: "clamp(10px, 1.5vw, 16px) 0",
                  borderTop: i === 0 ? "1px solid rgba(17,17,17,0.1)" : "none",
                  borderBottom: "1px solid rgba(17,17,17,0.1)",
                }}
              >
                <div style={{
                  width: "clamp(36px, 5vw, 56px)",
                  height: "clamp(36px, 5vw, 56px)",
                  backgroundColor: tone.hex,
                  border: tone.hex === "#FAF8F4" ? "1px solid rgba(17,17,17,0.15)" : "none",
                  flexShrink: 0,
                }} />
                <p style={{
                  fontFamily: '"DM Sans", sans-serif',
                  fontSize: "0.72rem",
                  letterSpacing: "0.16em",
                  textTransform: "uppercase",
                  color: "#111111",
                  margin: 0,
                  fontWeight: 400,
                }}>
                  {tone.name}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Second image: plant shadow — full width strip */}
      <div style={{
        marginTop: "clamp(64px, 10vw, 120px)",
        overflow: "hidden",
        ...fade(inView, 0.5),
      }}>
        <img
          src={IMG.plantShadow}
          alt="Shadow on fabric"
          style={{
            width: "100%",
            height: "clamp(300px, 45vw, 600px)",
            objectFit: "cover",
            objectPosition: "center 30%",
            display: "block",
            filter: "brightness(0.97) saturate(0.55)",
          }}
        />
      </div>
    </section>
  );
}

// ─── Lookbook ────────────────────────────────────────────────────────────────

function Lookbook() {
  const { ref, inView } = useInView(0.08);
  return (
    <section ref={ref} style={{ backgroundColor: "#111111" }}>
      <div style={{
        maxWidth: "1400px", margin: "0 auto",
        padding: "clamp(64px, 10vw, 120px) clamp(20px, 4vw, 48px)",
      }}>
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-end",
          marginBottom: "clamp(40px, 6vw, 80px)",
          ...fade(inView, 0),
        }}>
          <p style={{
            fontFamily: '"DM Sans", sans-serif',
            fontSize: "0.6rem",
            letterSpacing: "0.22em",
            textTransform: "uppercase",
            color: "rgba(250,248,244,0.35)",
          }}>
            06 — The Garment
          </p>
          <p style={{
            fontFamily: '"Bodoni Moda", serif',
            fontStyle: "italic",
            fontSize: "clamp(1rem, 2vw, 1.6rem)",
            color: "rgba(250,248,244,0.4)",
            margin: 0,
          }}>
            Living form.
          </p>
        </div>

        {/* Top row: wide + tall */}
        <div style={{ display: "grid", gridTemplateColumns: "60% 40%", gap: "clamp(4px, 0.5vw, 8px)", marginBottom: "clamp(4px, 0.5vw, 8px)" }}>
          <div style={{ overflow: "hidden", ...fade(inView, 0.1) }}>
            <img
              src={IMG.modelsWide}
              alt="Models in neutral tones"
              style={{
                width: "100%",
                height: "clamp(280px, 35vw, 520px)",
                objectFit: "cover",
                objectPosition: "center top",
                display: "block",
                filter: "brightness(0.88) saturate(0.7)",
                transition: "transform 0.9s ease",
              }}
              onMouseEnter={e => (e.currentTarget.style.transform = "scale(1.04)")}
              onMouseLeave={e => (e.currentTarget.style.transform = "scale(1)")}
            />
          </div>
          <div style={{ overflow: "hidden", ...fade(inView, 0.2) }}>
            <img
              src={IMG.womanSitting}
              alt="Woman in white"
              style={{
                width: "100%",
                height: "clamp(280px, 35vw, 520px)",
                objectFit: "cover",
                objectPosition: "center top",
                display: "block",
                filter: "brightness(0.88) saturate(0.7)",
                transition: "transform 0.9s ease",
              }}
              onMouseEnter={e => (e.currentTarget.style.transform = "scale(1.04)")}
              onMouseLeave={e => (e.currentTarget.style.transform = "scale(1)")}
            />
          </div>
        </div>

        {/* Bottom row: 3 equal */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "clamp(4px, 0.5vw, 8px)" }}>
          {[IMG.womanWhite, IMG.manTee, IMG.manWalking].map((src, i) => (
            <div key={i} style={{ overflow: "hidden", ...fade(inView, 0.25 + i * 0.1) }}>
              <img
                src={src}
                alt="Editorial look"
                style={{
                  width: "100%",
                  height: "clamp(240px, 30vw, 440px)",
                  objectFit: "cover",
                  objectPosition: "center top",
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

// ─── Closing ─────────────────────────────────────────────────────────────────

function Closing() {
  const { ref, inView } = useInView(0.15);
  return (
    <section ref={ref} style={{
      backgroundColor: "#FAF8F4",
      minHeight: "80vh",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      textAlign: "center",
      padding: "clamp(80px, 14vw, 160px) clamp(24px, 8vw, 120px)",
    }}>
      <div style={{ maxWidth: "800px" }}>
        <p style={{
          fontFamily: '"DM Sans", sans-serif',
          fontSize: "0.6rem",
          letterSpacing: "0.22em",
          textTransform: "uppercase",
          color: "#7C7C75",
          marginBottom: "clamp(40px, 7vw, 80px)",
          ...fade(inView, 0),
        }}>
          07 — Philosophy of Wear
        </p>

        <h2 style={{
          fontFamily: '"Bodoni Moda", serif',
          fontSize: "clamp(2rem, 5.5vw, 5rem)",
          fontWeight: 400,
          lineHeight: 1.15,
          color: "#111111",
          margin: "0 0 clamp(12px, 2vw, 24px)",
          ...fade(inView, 0.2),
        }}>
          Clothing is not made<br />to be seen once.
        </h2>

        <p style={{
          fontFamily: '"Bodoni Moda", serif',
          fontStyle: "italic",
          fontSize: "clamp(1.3rem, 3vw, 2.8rem)",
          fontWeight: 400,
          lineHeight: 1.3,
          color: "rgba(17,17,17,0.45)",
          margin: "0 0 clamp(48px, 8vw, 100px)",
          ...fade(inView, 0.35),
        }}>
          It is made to be lived in.
        </p>

        <div style={{
          width: "1px",
          height: "clamp(40px, 5vw, 64px)",
          backgroundColor: "rgba(17,17,17,0.15)",
          margin: "0 auto clamp(32px, 5vw, 56px)",
          ...fade(inView, 0.5),
        }} />

        <p style={{
          fontFamily: '"DM Sans", sans-serif',
          fontSize: "0.65rem",
          letterSpacing: "0.22em",
          textTransform: "uppercase",
          color: "#7C7C75",
          marginBottom: "clamp(32px, 5vw, 56px)",
          ...fade(inView, 0.6),
        }}>
          Cotton remembers the body.
        </p>

        <button
          onClick={() => navigate("collection")}
          style={{
            fontFamily: '"Bodoni Moda", serif',
            fontSize: "clamp(1.4rem, 3vw, 2.4rem)",
            fontWeight: 400,
            letterSpacing: "0.18em",
            color: "#111111",
            background: "none",
            border: "none",
            borderBottom: "1px solid rgba(17,17,17,0.2)",
            paddingBottom: "4px",
            cursor: "pointer",
            display: "block",
            margin: "0 auto",
            transition: "opacity 0.3s",
            ...fade(inView, 0.75),
          }}
          onMouseEnter={e => (e.currentTarget.style.opacity = "0.45")}
          onMouseLeave={e => (e.currentTarget.style.opacity = "1")}
        >
          QUTB
        </button>
      </div>
    </section>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────────

export function CottonJourneyPage() {
  return (
    <div style={{ backgroundColor: "#FAF8F4", fontFamily: '"DM Sans", sans-serif', overflowX: "hidden" }}>
      <style>{`
        @media (max-width: 768px) {
          .cj-founder-split { grid-template-columns: 1fr !important; }
          .cj-origin-split { grid-template-columns: 1fr !important; }
          .cj-fiber-grid { grid-template-columns: 1fr !important; }
          .cj-fiber-grid > div:last-child > div:first-child { display: none !important; }
          .cj-dye-grid { grid-template-columns: 1fr !important; }
          .cj-weight-grid { grid-template-columns: 1fr !important; }
          .cj-lookbook-top { grid-template-columns: 1fr !important; }
          .cj-lookbook-bottom { grid-template-columns: 1fr 1fr !important; }
          .cj-thread-bottom { grid-template-columns: 1fr !important; }
        }
      `}</style>
      <Hero />
      <FounderIntro />
      <Origin />
      <Fiber />
      <Thread />
      <Weight />
      <DyeTone />
      <Lookbook />
      <Closing />
      <QutbFooter />
    </div>
  );
}
