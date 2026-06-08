import { useState, useEffect, useRef } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { QutbFooter } from "./QutbFooter";
import { navigate } from "../nav";

// ─── Types ────────────────────────────────────────────────────────────────────

type Category = "all" | "fabric" | "seasonal" | "city" | "uniform";

interface Entry {
  id: string;
  category: Category;
  title: string;
  subtitle: string;
  date: string;
  indexImg: string;
  heroImg: string;
  bodyImgs: string[];
  pullQuote: string;
}

// ─── Hooks ───────────────────────────────────────────────────────────────────

function useInView(threshold = 0.1) {
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

// ─── Images ──────────────────────────────────────────────────────────────────

const FOUNDER_IMG = "https://images.unsplash.com/photo-1646170587936-04f3d59e4d6c?w=1400&h=1800&fit=crop&auto=format";

const I = {
  // Index / featured
  featured:       "https://images.unsplash.com/photo-1761588839159-802cc75144df?w=1200&h=1600&fit=crop&auto=format",
  sunlitStreet:   "https://images.unsplash.com/photo-1759054714136-b7468fabd87d?w=1000&h=1300&fit=crop&auto=format",
  fabricWhite:    "https://images.unsplash.com/photo-1732869415090-179de017b6d6?w=1000&h=1300&fit=crop&auto=format",
  womanMetal:     "https://images.unsplash.com/photo-1692180142575-c31fcd106b5b?w=1000&h=1300&fit=crop&auto=format",
  windowStools:   "https://images.unsplash.com/photo-1774521044355-508615f287ca?w=1000&h=1300&fit=crop&auto=format",
  chairWindow:    "https://images.unsplash.com/photo-1761011413787-f0279654066b?w=1000&h=1300&fit=crop&auto=format",
  textureSun:     "https://images.unsplash.com/photo-1588610992315-5654831ceebd?w=1000&h=1300&fit=crop&auto=format",
  // Visual essays
  womanCoat:      "https://images.unsplash.com/photo-1609519883494-1487902c1b60?w=900&h=1200&fit=crop&auto=format",
  narrowStreet:   "https://images.unsplash.com/photo-1755378023094-5b5bb385eed4?w=900&h=1300&fit=crop&auto=format",
  plantShadow:    "https://images.unsplash.com/photo-1682421938316-4b186e25174c?w=900&h=1100&fit=crop&auto=format",
  horseShadow:    "https://images.unsplash.com/photo-1631832612525-98ba50f35189?w=900&h=700&fit=crop&auto=format",
  womanMotion:    "https://images.unsplash.com/photo-1745450430474-21a37672dec6?w=900&h=1200&fit=crop&auto=format",
  peopleWalk:     "https://images.unsplash.com/photo-1759054714233-5489f6dc5269?w=900&h=700&fit=crop&auto=format",
  // Article
  streetBell:     "https://images.unsplash.com/photo-1755378023215-fc3e98ce32f1?w=2000&h=1300&fit=crop&auto=format",
  manHarbor:      "https://images.unsplash.com/photo-1758541331088-fe74232c7b9e?w=1400&h=1000&fit=crop&auto=format",
};

// ─── Data ────────────────────────────────────────────────────────────────────

const ENTRIES: Entry[] = [
  {
    id: "summer-cotton",
    category: "fabric",
    title: "On the Weight of Summer Cotton",
    subtitle: "How lightness becomes a daily philosophy",
    date: "May 2025",
    indexImg: I.sunlitStreet,
    heroImg: I.streetBell,
    bodyImgs: [I.sunlitStreet, I.manHarbor],
    pullQuote: "Cotton is not a material. It is a daily rhythm.",
  },
  {
    id: "neutral-silence",
    category: "seasonal",
    title: "The Silence of Neutral Colors",
    subtitle: "What the absence of colour communicates",
    date: "April 2025",
    indexImg: I.fabricWhite,
    heroImg: I.fabricWhite,
    bodyImgs: [I.textureSun, I.plantShadow],
    pullQuote: "Neutral tones do not speak loudly. They stay longer.",
  },
  {
    id: "city-uniforms",
    category: "city",
    title: "Uniforms of the City",
    subtitle: "The daily costume of ordinary life",
    date: "March 2025",
    indexImg: I.womanMetal,
    heroImg: I.narrowStreet,
    bodyImgs: [I.womanCoat, I.womanMotion],
    pullQuote: "The city does not ask what you are wearing. It asks what you are doing in it.",
  },
  {
    id: "wearing-time",
    category: "uniform",
    title: "Wearing Time, Not Trends",
    subtitle: "On permanence and the resistant garment",
    date: "February 2025",
    indexImg: I.windowStools,
    heroImg: I.windowStools,
    bodyImgs: [I.chairWindow, I.horseShadow],
    pullQuote: "A garment that ages well is a garment that was made honestly.",
  },
  {
    id: "morning-ritual",
    category: "seasonal",
    title: "The Morning Ritual",
    subtitle: "Getting dressed as an act of self-definition",
    date: "January 2025",
    indexImg: I.chairWindow,
    heroImg: I.chairWindow,
    bodyImgs: [I.windowStools, I.fabricWhite],
    pullQuote: "There is something clarifying about choosing the same thing again.",
  },
  {
    id: "cotton-memory",
    category: "fabric",
    title: "Cotton as Memory",
    subtitle: "What fabric holds that photographs cannot",
    date: "December 2024",
    indexImg: I.textureSun,
    heroImg: I.textureSun,
    bodyImgs: [I.fabricWhite, I.plantShadow],
    pullQuote: "The softness of worn cotton is the softness of time.",
  },
];

const CATEGORIES: { key: Category; label: string }[] = [
  { key: "all",     label: "All" },
  { key: "fabric",  label: "Fabric Notes" },
  { key: "seasonal",label: "Seasonal Studies" },
  { key: "city",    label: "City Observations" },
  { key: "uniform", label: "Uniform Studies" },
];

const VISUAL_ESSAYS = [
  { img: I.narrowStreet, title: "The Street as Stage",     caption: "City observations", tall: true },
  { img: I.womanCoat,    title: "Moving Through",          caption: "Urban silhouettes",  tall: true },
  { img: I.horseShadow,  title: "What Light Leaves",       caption: "Seasonal studies",   tall: false },
  { img: I.peopleWalk,   title: "Ordinary Procession",     caption: "City observations",  tall: false },
  { img: I.plantShadow,  title: "Shadow on Cloth",         caption: "Fabric notes",       tall: true },
  { img: I.womanMotion,  title: "In Transit",              caption: "Urban silhouettes",  tall: false },
];

// ─── Fade helper ─────────────────────────────────────────────────────────────

const fade = (visible: boolean, delay = 0): React.CSSProperties => ({
  opacity: visible ? 1 : 0,
  transform: visible ? "translateY(0)" : "translateY(18px)",
  transition: `opacity 0.85s ease ${delay}s, transform 0.85s ease ${delay}s`,
});

// ─── Article View ─────────────────────────────────────────────────────────────

function ArticleView({ entry, onBack }: { entry: Entry; onBack: () => void }) {
  const [loaded, setLoaded] = useState(false);
  useEffect(() => { const t = setTimeout(() => setLoaded(true), 60); return () => clearTimeout(t); }, []);

  return (
    <div style={{ backgroundColor: "#FAF8F4" }}>
      {/* Back */}
      <div style={{
        padding: "clamp(100px,14vw,140px) clamp(24px,6vw,80px) 0",
        maxWidth: "1200px", margin: "0 auto",
        ...fade(loaded, 0),
      }}>
        <button
          onClick={onBack}
          style={{
            display: "inline-flex", alignItems: "center", gap: "8px",
            fontFamily: '"DM Sans", sans-serif', fontSize: "0.65rem",
            letterSpacing: "0.2em", textTransform: "uppercase",
            color: "#7C7C75", background: "none", border: "none",
            cursor: "pointer", padding: 0, marginBottom: "clamp(40px,6vw,72px)",
          }}
        >
          <ArrowLeft size={13} strokeWidth={1.5} />
          Salt Journal
        </button>

        {/* Article header */}
        <p style={{
          fontFamily: '"DM Sans", sans-serif', fontSize: "0.6rem",
          letterSpacing: "0.22em", textTransform: "uppercase",
          color: "#7C7C75", marginBottom: "clamp(16px,2.5vw,28px)",
        }}>
          {entry.date} — {entry.category}
        </p>
        <h1 style={{
          fontFamily: '"Bodoni Moda", serif', fontWeight: 400,
          fontSize: "clamp(2.4rem,6vw,5.5rem)", lineHeight: 1.05,
          letterSpacing: "-0.01em", color: "#111111",
          margin: "0 0 clamp(12px,2vw,20px)",
          ...fade(loaded, 0.1),
        }}>
          {entry.title}
        </h1>
        <p style={{
          fontFamily: '"Bodoni Moda", serif', fontStyle: "italic",
          fontSize: "clamp(1rem,2.2vw,1.6rem)", color: "rgba(17,17,17,0.45)",
          margin: 0, ...fade(loaded, 0.2),
        }}>
          {entry.subtitle}
        </p>
      </div>

      {/* Hero image — full bleed */}
      <div style={{
        marginTop: "clamp(48px,7vw,96px)",
        height: "clamp(420px,65vh,820px)", overflow: "hidden",
        ...fade(loaded, 0.3),
      }}>
        <img
          src={entry.heroImg}
          alt={entry.title}
          style={{
            width: "100%", height: "100%", objectFit: "cover",
            objectPosition: "center",
            filter: "brightness(0.93) saturate(0.75)",
          }}
        />
      </div>

      {/* Body — narrow column */}
      <div style={{
        maxWidth: "680px", margin: "0 auto",
        padding: "clamp(48px,8vw,100px) clamp(24px,5vw,48px)",
      }}>
        {/* Opening paragraph */}
        <p style={{
          fontFamily: '"DM Sans", sans-serif', fontWeight: 300,
          fontSize: "clamp(0.95rem,1.6vw,1.15rem)", lineHeight: 1.9,
          color: "#4A4A45", margin: "0 0 clamp(32px,5vw,56px)",
          ...fade(loaded, 0.5),
        }}>
          There is a quality to certain garments that resists description.
          Not the weight on the scale, not the thread count on the label —
          but the way they feel after the third wash. The way they settle
          into the body like a habit. Cotton, at its most considered,
          is exactly this: a quiet companion.
        </p>

        {/* Pull quote */}
        <blockquote style={{
          borderLeft: "1px solid rgba(17,17,17,0.15)",
          paddingLeft: "clamp(20px,3vw,36px)",
          margin: "0 0 clamp(32px,5vw,56px)",
          ...fade(loaded, 0.6),
        }}>
          <p style={{
            fontFamily: '"Bodoni Moda", serif', fontStyle: "italic",
            fontSize: "clamp(1.2rem,2.5vw,2rem)", lineHeight: 1.35,
            color: "#111111", margin: 0,
          }}>
            "{entry.pullQuote}"
          </p>
        </blockquote>

        <p style={{
          fontFamily: '"DM Sans", sans-serif', fontWeight: 300,
          fontSize: "clamp(0.95rem,1.6vw,1.15rem)", lineHeight: 1.9,
          color: "#4A4A45", margin: "0 0 clamp(32px,5vw,56px)",
          ...fade(loaded, 0.65),
        }}>
          We do not dress for occasion as often as we pretend.
          More often, we dress for ourselves — for the feeling of
          being contained, composed, ready. The right garment does
          not announce itself. It simply allows everything else to proceed.
        </p>
      </div>

      {/* First body image — full bleed */}
      <div style={{
        height: "clamp(340px,55vh,680px)", overflow: "hidden",
        margin: "0 0 clamp(12px,1.5vw,20px)",
        ...fade(loaded, 0.7),
      }}>
        <img
          src={entry.bodyImgs[0]}
          alt=""
          style={{
            width: "100%", height: "100%", objectFit: "cover",
            filter: "brightness(0.9) saturate(0.7)",
          }}
        />
      </div>

      {/* Split: text + second image */}
      <div style={{
        maxWidth: "1400px", margin: "0 auto",
        display: "grid", gridTemplateColumns: "1fr 1fr",
        gap: "clamp(12px,2vw,24px)",
        padding: "0 clamp(20px,4vw,48px)",
        alignItems: "center",
        marginBottom: "clamp(64px,10vw,120px)",
        ...fade(loaded, 0.8),
      }}>
        <div style={{ padding: "clamp(24px,4vw,56px) clamp(20px,3vw,40px)" }}>
          <p style={{
            fontFamily: '"DM Sans", sans-serif', fontWeight: 300,
            fontSize: "clamp(0.9rem,1.5vw,1.1rem)", lineHeight: 1.95,
            color: "#4A4A45", margin: "0 0 clamp(24px,3vw,40px)",
          }}>
            The uniform sensibility — wearing the same considered pieces
            repeatedly — is not about laziness or indifference.
            It is about clarity. When the decision of what to wear
            is already made, everything else opens.
          </p>
          <p style={{
            fontFamily: '"DM Sans", sans-serif', fontSize: "0.6rem",
            letterSpacing: "0.22em", textTransform: "uppercase",
            color: "#7C7C75",
          }}>
            {entry.date}
          </p>
        </div>
        <div style={{ overflow: "hidden" }}>
          <img
            src={entry.bodyImgs[1] || entry.bodyImgs[0]}
            alt=""
            style={{
              width: "100%", height: "clamp(340px,45vw,560px)",
              objectFit: "cover", display: "block",
              filter: "brightness(0.92) saturate(0.7)",
            }}
          />
        </div>
      </div>

      {/* Back + next entry */}
      <div style={{
        borderTop: "1px solid rgba(17,17,17,0.1)",
        maxWidth: "1400px", margin: "0 auto",
        padding: "clamp(40px,6vw,72px) clamp(20px,4vw,48px)",
        display: "flex", justifyContent: "space-between", alignItems: "center",
      }}>
        <button
          onClick={onBack}
          style={{
            display: "inline-flex", alignItems: "center", gap: "8px",
            fontFamily: '"DM Sans", sans-serif', fontSize: "0.65rem",
            letterSpacing: "0.18em", textTransform: "uppercase",
            color: "#111111", background: "none", border: "none",
            cursor: "pointer", padding: 0,
          }}
        >
          <ArrowLeft size={13} strokeWidth={1.5} />
          All Entries
        </button>
        <button
          onClick={() => navigate("collection")}
          style={{
            display: "inline-flex", alignItems: "center", gap: "8px",
            fontFamily: '"DM Sans", sans-serif', fontSize: "0.65rem",
            letterSpacing: "0.18em", textTransform: "uppercase",
            color: "#111111", background: "none", border: "none",
            cursor: "pointer", padding: 0,
          }}
        >
          Shop The Uniform
          <ArrowRight size={13} strokeWidth={1.5} />
        </button>
      </div>
    </div>
  );
}

// ─── Founder Note ────────────────────────────────────────────────────────────

function FounderNote() {
  const { ref, inView } = useInView(0.06);
  return (
    <section ref={ref} style={{ backgroundColor: "#F5F0E8" }}>
      <div style={{
        display: "grid", gridTemplateColumns: "45% 55%",
        minHeight: "clamp(480px,65vh,780px)",
      }}>
        {/* Left: image */}
        <div style={{ overflow: "hidden", ...fade(inView, 0) }}>
          <img
            src={FOUNDER_IMG}
            alt="Founder"
            style={{
              width: "100%", height: "100%", minHeight: "clamp(480px,65vh,780px)",
              objectFit: "cover", objectPosition: "center 20%",
              filter: "brightness(0.72) saturate(0.4)",
              display: "block",
            }}
          />
        </div>

        {/* Right: letter */}
        <div style={{
          display: "flex", flexDirection: "column", justifyContent: "center",
          padding: "clamp(56px,9vw,130px) clamp(40px,6vw,96px)",
          ...fade(inView, 0.2),
        }}>
          <p style={{
            fontFamily: '"DM Sans", sans-serif', fontSize: "0.58rem",
            letterSpacing: "0.24em", textTransform: "uppercase",
            color: "#7C7C75", marginBottom: "clamp(28px,4vw,56px)",
          }}>
            Founder's Note — Issue I
          </p>

          <p style={{
            fontFamily: '"DM Sans", sans-serif', fontWeight: 300,
            fontSize: "clamp(0.9rem,1.5vw,1.1rem)", lineHeight: 1.95,
            color: "#4A4A45", margin: "0 0 clamp(20px,3vw,36px)",
          }}>
            I have been thinking about this for two years.
          </p>

          <p style={{
            fontFamily: '"DM Sans", sans-serif', fontWeight: 300,
            fontSize: "clamp(0.9rem,1.5vw,1.1rem)", lineHeight: 1.95,
            color: "#4A4A45", margin: "0 0 clamp(20px,3vw,36px)",
          }}>
            Not about the brand — about the problem. About why it is so hard to find
            a T-shirt that fits correctly and lasts. About what it means to be raised
            by someone who can walk through a factory and explain every decision
            that led to a finished garment. About what it would look like to use
            that knowledge deliberately, rather than let it pass.
          </p>

          <p style={{
            fontFamily: '"DM Sans", sans-serif', fontWeight: 300,
            fontSize: "clamp(0.9rem,1.5vw,1.1rem)", lineHeight: 1.95,
            color: "#4A4A45", margin: "0 0 clamp(28px,4vw,56px)",
          }}>
            My father agreed this summer. We are starting now.
          </p>

          <p style={{
            fontFamily: '"DM Sans", sans-serif', fontWeight: 300,
            fontSize: "clamp(0.9rem,1.5vw,1.1rem)", lineHeight: 1.95,
            color: "#4A4A45", margin: "0 0 clamp(32px,5vw,64px)",
          }}>
            QUTB is not a statement about Egyptian manufacturing.
            It is not a story about heritage.
            It is an attempt to make a few things correctly,
            and to keep making them that way.
          </p>

          <div style={{ width: "28px", height: "1px", backgroundColor: "rgba(17,17,17,0.2)", marginBottom: "clamp(16px,2.5vw,28px)" }} />

          <p style={{
            fontFamily: '"Bodoni Moda", serif', fontStyle: "italic",
            fontSize: "clamp(1rem,2vw,1.4rem)", color: "#111111", margin: 0,
          }}>
            — Tarek
          </p>
        </div>
      </div>
    </section>
  );
}

// ─── Featured Spread ──────────────────────────────────────────────────────────

function FeaturedSpread({ entry, onRead }: { entry: Entry; onRead: () => void }) {
  const { ref, inView } = useInView(0.05);
  const [hovered, setHovered] = useState(false);

  return (
    <section ref={ref} style={{ backgroundColor: "#FAF8F4" }}>
      <div style={{
        maxWidth: "1400px", margin: "0 auto",
        padding: "0 clamp(20px,4vw,48px)",
        display: "grid", gridTemplateColumns: "55% 45%",
        gap: "clamp(24px,4vw,64px)", alignItems: "stretch",
        minHeight: "80vh",
      }}>
        {/* Left: huge image */}
        <div
          style={{ overflow: "hidden", cursor: "pointer", ...fade(inView, 0) }}
          onClick={onRead}
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
        >
          <img
            src={I.featured}
            alt={entry.title}
            style={{
              width: "100%", height: "100%", minHeight: "clamp(500px,80vh,900px)",
              objectFit: "cover", objectPosition: "center",
              display: "block",
              filter: "brightness(0.9) saturate(0.72)",
              transform: hovered ? "scale(1.03)" : "scale(1)",
              transition: "transform 0.9s ease",
            }}
          />
        </div>

        {/* Right: editorial text column */}
        <div style={{
          display: "flex", flexDirection: "column",
          justifyContent: "flex-end",
          padding: "clamp(48px,7vw,96px) 0 clamp(48px,7vw,96px) clamp(16px,2vw,32px)",
          ...fade(inView, 0.2),
        }}>
          <p style={{
            fontFamily: '"DM Sans", sans-serif', fontSize: "0.6rem",
            letterSpacing: "0.22em", textTransform: "uppercase",
            color: "#7C7C75", marginBottom: "clamp(20px,3vw,36px)",
          }}>
            Featured — {entry.date}
          </p>

          <h2 style={{
            fontFamily: '"Bodoni Moda", serif', fontWeight: 400,
            fontSize: "clamp(2rem,4.5vw,4rem)", lineHeight: 1.08,
            letterSpacing: "-0.01em", color: "#111111",
            margin: "0 0 clamp(16px,2.5vw,28px)",
          }}>
            {entry.title}
          </h2>

          <p style={{
            fontFamily: '"Bodoni Moda", serif', fontStyle: "italic",
            fontSize: "clamp(1rem,1.8vw,1.4rem)", color: "rgba(17,17,17,0.45)",
            lineHeight: 1.5, margin: "0 0 clamp(24px,4vw,48px)",
          }}>
            {entry.subtitle}
          </p>

          <div style={{
            height: "1px", backgroundColor: "rgba(17,17,17,0.12)",
            margin: "0 0 clamp(24px,4vw,48px)",
          }} />

          <p style={{
            fontFamily: '"DM Sans", sans-serif', fontWeight: 300,
            fontSize: "clamp(0.85rem,1.3vw,1rem)", lineHeight: 1.85,
            color: "#7C7C75", margin: "0 0 clamp(32px,5vw,56px)",
          }}>
            "{entry.pullQuote}"
          </p>

          <button
            onClick={onRead}
            style={{
              display: "inline-flex", alignItems: "center", gap: "10px",
              fontFamily: '"DM Sans", sans-serif', fontSize: "0.68rem",
              letterSpacing: "0.2em", textTransform: "uppercase",
              color: "#111111", background: "none", border: "none",
              borderBottom: "1px solid rgba(17,17,17,0.35)", paddingBottom: "4px",
              cursor: "pointer", padding: "0 0 4px", alignSelf: "flex-start",
            }}
          >
            Read Entry
            <ArrowRight size={12} strokeWidth={1.5} />
          </button>
        </div>
      </div>
    </section>
  );
}

// ─── Journal Index ────────────────────────────────────────────────────────────

function JournalIndex({
  entries,
  onRead,
}: {
  entries: Entry[];
  onRead: (entry: Entry) => void;
}) {
  const { ref, inView } = useInView(0.05);
  const [hoveredId, setHoveredId] = useState<string | null>(entries[0]?.id ?? null);
  const hoveredEntry = entries.find(e => e.id === hoveredId) ?? entries[0];

  return (
    <section ref={ref} style={{
      backgroundColor: "#F5F0E8",
      padding: "clamp(64px,10vw,120px) 0",
    }}>
      <div style={{
        maxWidth: "1400px", margin: "0 auto",
        padding: "0 clamp(20px,4vw,48px)",
        display: "grid",
        gridTemplateColumns: "30% 1fr 32%",
        gap: "clamp(32px,5vw,80px)",
        alignItems: "start",
      }}>
        {/* Left: sticky masthead */}
        <div style={{ position: "sticky", top: "96px", ...fade(inView, 0) }}>
          <p style={{
            fontFamily: '"DM Sans", sans-serif', fontSize: "0.58rem",
            letterSpacing: "0.24em", textTransform: "uppercase",
            color: "#7C7C75", marginBottom: "clamp(12px,2vw,20px)",
          }}>
            Vol. II — 2025
          </p>
          <h2 style={{
            fontFamily: '"Bodoni Moda", serif', fontWeight: 400,
            fontSize: "clamp(1.6rem,3.5vw,3rem)", lineHeight: 1.1,
            color: "#111111", margin: "0 0 clamp(20px,3vw,36px)",
          }}>
            All<br /><em>Entries</em>
          </h2>
          <div style={{
            width: "32px", height: "1px",
            backgroundColor: "rgba(17,17,17,0.25)",
          }} />
        </div>

        {/* Center: entry list */}
        <div style={{ ...fade(inView, 0.15) }}>
          {entries.map((entry, i) => (
            <div
              key={entry.id}
              onClick={() => onRead(entry)}
              onMouseEnter={() => setHoveredId(entry.id)}
              style={{
                borderTop: "1px solid rgba(17,17,17,0.1)",
                padding: "clamp(20px,3vw,32px) 0",
                cursor: "pointer",
                borderBottom: i === entries.length - 1 ? "1px solid rgba(17,17,17,0.1)" : "none",
                transition: "opacity 0.25s",
              }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.opacity = "1"; }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "16px" }}>
                <div style={{ flex: 1 }}>
                  <p style={{
                    fontFamily: '"Bodoni Moda", serif', fontWeight: 400,
                    fontSize: "clamp(1rem,2vw,1.5rem)", lineHeight: 1.2,
                    color: hoveredId === entry.id ? "#111111" : "rgba(17,17,17,0.55)",
                    margin: "0 0 6px",
                    transition: "color 0.3s",
                  }}>
                    {entry.title}
                  </p>
                  <p style={{
                    fontFamily: '"DM Sans", sans-serif', fontWeight: 300,
                    fontSize: "0.72rem", letterSpacing: "0.04em",
                    color: "#7C7C75", margin: 0,
                    opacity: hoveredId === entry.id ? 1 : 0.6,
                    transition: "opacity 0.3s",
                  }}>
                    {entry.subtitle}
                  </p>
                </div>
                <p style={{
                  fontFamily: '"DM Sans", sans-serif', fontSize: "0.6rem",
                  letterSpacing: "0.14em", textTransform: "uppercase",
                  color: "#7C7C75", whiteSpace: "nowrap", flexShrink: 0,
                  paddingTop: "4px",
                }}>
                  {entry.date}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Right: sticky image preview */}
        <div style={{ position: "sticky", top: "96px", overflow: "hidden", ...fade(inView, 0.3) }}>
          {entries.map(entry => (
            <img
              key={entry.id}
              src={entry.indexImg}
              alt={entry.title}
              style={{
                position: entry.id === entries[0].id ? "relative" : "absolute",
                top: 0, left: 0,
                width: "100%",
                height: "clamp(340px,45vw,520px)",
                objectFit: "cover",
                objectPosition: "center top",
                display: "block",
                filter: "brightness(0.93) saturate(0.72)",
                opacity: hoveredId === entry.id ? 1 : 0,
                transition: "opacity 0.55s ease",
              }}
            />
          ))}
          {/* Caption */}
          <p style={{
            fontFamily: '"DM Sans", sans-serif', fontSize: "0.58rem",
            letterSpacing: "0.18em", textTransform: "uppercase",
            color: "#7C7C75", marginTop: "12px",
            opacity: 0.7,
          }}>
            {hoveredEntry?.date} — {hoveredEntry?.category}
          </p>
        </div>
      </div>
    </section>
  );
}

// ─── Visual Essays ────────────────────────────────────────────────────────────

function VisualEssays({ onCategoryClick }: { onCategoryClick: (cat: Category) => void }) {
  const { ref, inView } = useInView(0.06);

  return (
    <section ref={ref} style={{ backgroundColor: "#111111", padding: "clamp(64px,10vw,120px) 0" }}>
      <div style={{ maxWidth: "1400px", margin: "0 auto", padding: "0 clamp(20px,4vw,48px)" }}>
        {/* Header */}
        <div style={{
          display: "flex", justifyContent: "space-between", alignItems: "flex-end",
          marginBottom: "clamp(40px,6vw,72px)",
          ...fade(inView, 0),
        }}>
          <div>
            <p style={{
              fontFamily: '"DM Sans", sans-serif', fontSize: "0.58rem",
              letterSpacing: "0.24em", textTransform: "uppercase",
              color: "rgba(250,248,244,0.35)", marginBottom: "clamp(10px,1.5vw,16px)",
            }}>
              Visual Essays
            </p>
            <h2 style={{
              fontFamily: '"Bodoni Moda", serif', fontWeight: 400,
              fontSize: "clamp(1.8rem,4vw,3.5rem)", lineHeight: 1.1,
              color: "#FAF8F4", margin: 0,
            }}>
              Image-led<br /><em>Stories</em>
            </h2>
          </div>
        </div>

        {/* Grid — asymmetric */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gridTemplateRows: "auto auto",
          gap: "clamp(6px,1vw,14px)",
        }}>
          {VISUAL_ESSAYS.map((essay, i) => (
            <div
              key={i}
              style={{
                overflow: "hidden",
                position: "relative",
                cursor: "pointer",
                gridRow: i === 0 || i === 1 ? "1" : i === 4 ? "1 / 3" : "2",
                ...fade(inView, 0.08 * i),
              }}
              onMouseEnter={e => {
                const img = e.currentTarget.querySelector("img");
                if (img) img.style.transform = "scale(1.05)";
                const overlay = e.currentTarget.querySelector(".essay-overlay") as HTMLElement | null;
                if (overlay) overlay.style.opacity = "1";
              }}
              onMouseLeave={e => {
                const img = e.currentTarget.querySelector("img");
                if (img) img.style.transform = "scale(1)";
                const overlay = e.currentTarget.querySelector(".essay-overlay") as HTMLElement | null;
                if (overlay) overlay.style.opacity = "0";
              }}
            >
              <img
                src={essay.img}
                alt={essay.title}
                style={{
                  width: "100%",
                  height: essay.tall
                    ? "clamp(320px,42vw,560px)"
                    : "clamp(200px,26vw,340px)",
                  objectFit: "cover",
                  objectPosition: "center",
                  display: "block",
                  filter: "brightness(0.75) saturate(0.65)",
                  transition: "transform 0.9s ease",
                }}
              />
              {/* Overlay on hover */}
              <div
                className="essay-overlay"
                style={{
                  position: "absolute", inset: 0,
                  background: "linear-gradient(to top, rgba(17,17,17,0.7) 0%, transparent 50%)",
                  opacity: 0,
                  transition: "opacity 0.45s ease",
                  display: "flex", flexDirection: "column",
                  justifyContent: "flex-end",
                  padding: "clamp(16px,2.5vw,28px)",
                }}
              >
                <p style={{
                  fontFamily: '"Bodoni Moda", serif', fontStyle: "italic",
                  fontSize: "clamp(0.9rem,1.8vw,1.4rem)", color: "#FAF8F4",
                  margin: "0 0 4px",
                }}>
                  {essay.title}
                </p>
                <p style={{
                  fontFamily: '"DM Sans", sans-serif', fontSize: "0.58rem",
                  letterSpacing: "0.18em", textTransform: "uppercase",
                  color: "rgba(250,248,244,0.55)", margin: 0,
                }}>
                  {essay.caption}
                </p>
              </div>

              {/* Always-visible minimal label */}
              <div style={{
                position: "absolute", bottom: "clamp(10px,1.5vw,16px)",
                left: "clamp(10px,1.5vw,16px)",
              }}>
                <p style={{
                  fontFamily: '"DM Sans", sans-serif', fontSize: "0.55rem",
                  letterSpacing: "0.18em", textTransform: "uppercase",
                  color: "rgba(250,248,244,0.4)", margin: 0,
                }}>
                  {essay.caption}
                </p>
              </div>
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
      minHeight: "60vh",
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center",
      textAlign: "center",
      padding: "clamp(80px,14vw,160px) clamp(24px,8vw,120px)",
    }}>
      <p style={{
        fontFamily: '"DM Sans", sans-serif', fontSize: "0.6rem",
        letterSpacing: "0.24em", textTransform: "uppercase",
        color: "#7C7C75", marginBottom: "clamp(40px,7vw,72px)",
        ...fade(inView, 0),
      }}>
        Archive Philosophy
      </p>

      <h2 style={{
        fontFamily: '"Bodoni Moda", serif', fontWeight: 400,
        fontSize: "clamp(2rem,5vw,4.5rem)", lineHeight: 1.15,
        color: "#111111", margin: "0 0 clamp(12px,2vw,20px)",
        ...fade(inView, 0.15),
      }}>
        SALT JOURNAL is not content.
      </h2>
      <p style={{
        fontFamily: '"Bodoni Moda", serif', fontStyle: "italic",
        fontSize: "clamp(1.4rem,3vw,3rem)", fontWeight: 400,
        color: "rgba(17,17,17,0.4)", margin: "0 0 clamp(48px,8vw,96px)",
        ...fade(inView, 0.25),
      }}>
        It is observation.
      </p>

      <div style={{
        width: "1px", height: "clamp(36px,5vw,56px)",
        backgroundColor: "rgba(17,17,17,0.15)",
        margin: "0 auto clamp(28px,4vw,48px)",
        ...fade(inView, 0.4),
      }} />

      <p style={{
        fontFamily: '"DM Sans", sans-serif', fontSize: "0.65rem",
        letterSpacing: "0.22em", textTransform: "uppercase",
        color: "#7C7C75", marginBottom: "clamp(32px,5vw,56px)",
        ...fade(inView, 0.5),
      }}>
        What we wear is what we return to.
      </p>

      <button
        onClick={() => navigate("home")}
        style={{
          fontFamily: '"Bodoni Moda", serif', fontSize: "clamp(1.2rem,2.5vw,2rem)",
          fontWeight: 400, letterSpacing: "0.2em",
          color: "#111111", background: "none", border: "none",
          borderBottom: "1px solid rgba(17,17,17,0.2)", paddingBottom: "4px",
          cursor: "pointer",
          ...fade(inView, 0.65),
        }}
        onMouseEnter={e => (e.currentTarget.style.opacity = "0.4")}
        onMouseLeave={e => (e.currentTarget.style.opacity = "1")}
      >
        QUTB
      </button>
    </section>
  );
}

// ─── Page header ─────────────────────────────────────────────────────────────

function PageHeader({
  activeCategory,
  onCategory,
}: {
  activeCategory: Category;
  onCategory: (c: Category) => void;
}) {
  const [visible, setVisible] = useState(false);
  useEffect(() => { const t = setTimeout(() => setVisible(true), 80); return () => clearTimeout(t); }, []);

  return (
    <header style={{
      backgroundColor: "#FAF8F4",
      paddingTop: "72px",
    }}>
      {/* Masthead */}
      <div style={{
        maxWidth: "1400px", margin: "0 auto",
        padding: "clamp(48px,8vw,100px) clamp(20px,4vw,48px) clamp(32px,5vw,64px)",
        display: "flex", justifyContent: "space-between", alignItems: "flex-end",
        borderBottom: "1px solid rgba(17,17,17,0.1)",
        ...fade(visible, 0),
      }}>
        <div>
          <p style={{
            fontFamily: '"DM Sans", sans-serif', fontSize: "0.58rem",
            letterSpacing: "0.26em", textTransform: "uppercase",
            color: "#7C7C75", marginBottom: "clamp(10px,1.5vw,18px)",
          }}>
            Notes on fabric, form, and everyday culture
          </p>
          <h1 style={{
            fontFamily: '"Bodoni Moda", serif', fontWeight: 400,
            fontSize: "clamp(3rem,9vw,9rem)", lineHeight: 0.9,
            letterSpacing: "-0.02em", color: "#111111", margin: 0,
          }}>
            SALT<br /><em>JOURNAL</em>
          </h1>
        </div>
        <p style={{
          fontFamily: '"DM Sans", sans-serif', fontSize: "0.58rem",
          letterSpacing: "0.18em", textTransform: "uppercase",
          color: "rgba(17,17,17,0.3)", textAlign: "right",
          lineHeight: 1.8,
        }}>
          Vol. II<br />2025
        </p>
      </div>

      {/* Category filter */}
      <div style={{
        maxWidth: "1400px", margin: "0 auto",
        padding: "0 clamp(20px,4vw,48px)",
        display: "flex", alignItems: "center", gap: "clamp(24px,4vw,48px)",
        overflowX: "auto",
        ...fade(visible, 0.15),
      }}>
        {CATEGORIES.map(cat => (
          <button
            key={cat.key}
            onClick={() => onCategory(cat.key)}
            style={{
              fontFamily: '"DM Sans", sans-serif', fontSize: "0.62rem",
              letterSpacing: "0.18em", textTransform: "uppercase",
              color: activeCategory === cat.key ? "#111111" : "#7C7C75",
              background: "none", border: "none",
              borderBottom: activeCategory === cat.key ? "1px solid #111111" : "1px solid transparent",
              paddingBottom: "clamp(12px,2vw,20px)",
              paddingTop: "clamp(12px,2vw,20px)",
              cursor: "pointer",
              whiteSpace: "nowrap",
              transition: "color 0.25s, border-color 0.25s",
            }}
          >
            {cat.label}
          </button>
        ))}
      </div>
    </header>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export function SaltJournalPage() {
  const [activeCategory, setActiveCategory] = useState<Category>("all");
  const [openEntry, setOpenEntry] = useState<Entry | null>(null);

  const filtered = activeCategory === "all"
    ? ENTRIES
    : ENTRIES.filter(e => e.category === activeCategory);

  const featured = ENTRIES[0];

  if (openEntry) {
    return (
      <div style={{ backgroundColor: "#FAF8F4", fontFamily: '"DM Sans", sans-serif', overflowX: "hidden" }}>
        <ArticleView entry={openEntry} onBack={() => { setOpenEntry(null); window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior }); }} />
        <QutbFooter />
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: "#FAF8F4", fontFamily: '"DM Sans", sans-serif', overflowX: "hidden" }}>
      <style>{`
        @media (max-width: 900px) {
          .sj-note > section > div { grid-template-columns: 1fr !important; }
          .sj-note > section > div > div:first-child { min-height: 50vw !important; }
          .sj-featured { grid-template-columns: 1fr !important; }
          .sj-featured > div:first-child { min-height: 60vw !important; }
          .sj-index { grid-template-columns: 1fr !important; }
          .sj-index > div:last-child { display: none !important; }
          .sj-essays { grid-template-columns: 1fr 1fr !important; }
          .sj-article-split { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 600px) {
          .sj-essays { grid-template-columns: 1fr !important; }
        }
      `}</style>

      <PageHeader activeCategory={activeCategory} onCategory={setActiveCategory} />

      {/* Founder Note */}
      <div className="sj-note">
        <FounderNote />
      </div>

      {/* Featured Spread */}
      <div className="sj-featured" style={{ padding: "clamp(48px,7vw,96px) 0" }}>
        <FeaturedSpread entry={featured} onRead={() => setOpenEntry(featured)} />
      </div>

      {/* Journal Index */}
      <div className="sj-index">
        <JournalIndex entries={filtered} onRead={setOpenEntry} />
      </div>

      {/* Visual Essays */}
      <div className="sj-essays">
        <VisualEssays onCategoryClick={setActiveCategory} />
      </div>

      <Closing />
      <QutbFooter />
    </div>
  );
}
