import { useState, useEffect, useRef } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { X, ArrowRight } from "lucide-react";
import { navigate } from "../nav";
import { useCart } from "../CartContext";
import { QutbFooter } from "./QutbFooter";

// ─── Data ─────────────────────────────────────────────────────────────────────

const PRODUCT = {
  name: "Stanley Box Tee",
  code: "QT-001",
  collection: "The Uniform",
  price: "EGP 990",
  description:
    "A heavyweight box tee designed around permanence, structure, and daily wear. Cut for ease. Built to hold shape across years, not seasons.",
  images: [
    {
      src: "https://images.unsplash.com/photo-1581655353564-df123a1eb820?w=900&h=1200&fit=crop&crop=top&auto=format",
      alt: "Stanley Box Tee — front view, Bone White",
      ratio: "3/4",
    },
    {
      src: "https://images.unsplash.com/photo-1620799139507-2a76f79a2f4d?w=900&h=1200&fit=crop&auto=format",
      alt: "Stanley Box Tee — back view",
      ratio: "3/4",
    },
    {
      src: "https://images.unsplash.com/photo-1606343131474-abc41dc6bb7d?w=900&h=675&fit=crop&auto=format",
      alt: "220 GSM Egyptian cotton jersey — fabric macro",
      ratio: "4/3",
    },
    {
      src: "https://images.unsplash.com/photo-1632844384543-bb1b2c3900d7?w=900&h=900&fit=crop&auto=format",
      alt: "Rib collar construction detail",
      ratio: "1/1",
    },
    {
      src: "https://images.unsplash.com/photo-1606343131164-ab932aeffdaa?w=900&h=900&fit=crop&auto=format",
      alt: "Double-needle seam — construction detail",
      ratio: "1/1",
    },
    {
      src: "https://images.unsplash.com/photo-1722310752951-4d459d28c678?w=900&h=1200&fit=crop&crop=top&auto=format",
      alt: "Stanley Box Tee — worn editorial",
      ratio: "3/4",
    },
  ],
  colors: [
    { name: "Bone", hex: "#F5F0E8", border: true },
    { name: "Salt", hex: "#FAF8F4", border: true },
    { name: "Stone", hex: "#7C7C75" },
    { name: "Navy", hex: "#1D2635" },
    { name: "Charcoal", hex: "#111111" },
  ],
  sizes: ["XS", "S", "M", "L", "XL"],
  fabric: "220 GSM combed cotton jersey",
  details: [
    "Double-needle seams",
    "Pre-shrunk",
    "Reactive dyed",
    "Side-seam construction",
    "Made in Egypt",
  ],
};

const SIZE_GUIDE = [
  { size: "XS", chest: "88", shoulder: "50", length: "68", sleeve: "22" },
  { size: "S",  chest: "96", shoulder: "53", length: "70", sleeve: "23" },
  { size: "M",  chest: "104", shoulder: "56", length: "72", sleeve: "24" },
  { size: "L",  chest: "112", shoulder: "59", length: "74", sleeve: "25" },
  { size: "XL", chest: "120", shoulder: "62", length: "76", sleeve: "26" },
];

const RELATED = [
  {
    name: "Montaza Ringer Tee",
    code: "QT-002",
    price: "EGP 950",
    color: "Salt / Navy",
    image: "https://images.unsplash.com/photo-1722310752951-4d459d28c678?w=560&h=720&fit=crop&crop=top&auto=format",
  },
  {
    name: "Corniche Regular Tee",
    code: "QT-003",
    price: "EGP 820",
    color: "Salt White",
    image: "https://images.unsplash.com/photo-1651761179569-4ba2aa054997?w=560&h=720&fit=crop&auto=format",
  },
  {
    name: "Bahary Heavy Tee",
    code: "QT-004",
    price: "EGP 980",
    color: "Charcoal",
    image: "https://images.unsplash.com/photo-1620799139507-2a76f79a2f4d?w=560&h=720&fit=crop&auto=format",
  },
];

// ─── Utility ──────────────────────────────────────────────────────────────────

function useInView(threshold = 0.12) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) setVisible(true); },
      { threshold }
    );
    if (ref.current) obs.observe(ref.current);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, visible };
}

// ─── Size Guide Modal ─────────────────────────────────────────────────────────

function SizeGuideModal({ children }: { children: React.ReactNode }) {
  return (
    <Dialog.Root>
      <Dialog.Trigger asChild>{children}</Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(17,17,17,0.5)",
            zIndex: 200,
            animation: "sgFadeIn 0.3s ease",
          }}
        />
        <Dialog.Content
          aria-describedby={undefined}
          className="sg-modal"
          style={{
            position: "fixed",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            zIndex: 201,
            width: "calc(100% - 48px)",
            maxWidth: 680,
            maxHeight: "88vh",
            overflowY: "auto",
            backgroundColor: "#FAF8F4",
            padding: "clamp(32px, 5vw, 52px)",
            outline: "none",
            animation: "sgSlideIn 0.35s ease",
            fontFamily: '"DM Sans", sans-serif',
            scrollbarWidth: "thin",
            scrollbarColor: "rgba(17,17,17,0.15) transparent",
          }}
        >
          <style>{`
            .sg-modal::-webkit-scrollbar { width: 3px; }
            .sg-modal::-webkit-scrollbar-track { background: transparent; }
            .sg-modal::-webkit-scrollbar-thumb { background: rgba(17,17,17,0.15); }
          `}</style>
          {/* Header */}
          <div style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            marginBottom: 32,
            paddingBottom: 24,
            borderBottom: "1px solid rgba(17,17,17,0.1)",
          }}>
            <div>
              <p style={{
                color: "#7C7C75",
                fontSize: "0.6rem",
                letterSpacing: "0.24em",
                textTransform: "uppercase",
                fontWeight: 300,
                marginBottom: 6,
              }}>
                Box Tee — Measurement Guide
              </p>
              <Dialog.Title
                style={{
                  fontFamily: '"Bodoni Moda", serif',
                  color: "#111111",
                  fontSize: "clamp(1.4rem, 3vw, 1.9rem)",
                  fontWeight: 500,
                  letterSpacing: "0.01em",
                  margin: 0,
                  lineHeight: 1.1,
                }}
              >
                Size Guide
              </Dialog.Title>
            </div>
            <Dialog.Close
              aria-label="Close"
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                color: "#7C7C75",
                padding: 0,
                marginTop: 4,
                flexShrink: 0,
                transition: "color 0.15s",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "#111111")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "#7C7C75")}
            >
              <X size={16} strokeWidth={1.5} />
            </Dialog.Close>
          </div>

          {/* Size table */}
          <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: 32 }}>
            <thead>
              <tr>
                {["Size", "Chest", "Length", "Shoulder", "Sleeve"].map((h) => (
                  <th
                    key={h}
                    style={{
                      color: "#7C7C75",
                      fontSize: "0.58rem",
                      letterSpacing: "0.2em",
                      textTransform: "uppercase",
                      fontWeight: 300,
                      textAlign: "left",
                      padding: "0 0 12px 0",
                      borderBottom: "1px solid rgba(17,17,17,0.12)",
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {SIZE_GUIDE.map((row, i) => (
                <tr
                  key={row.size}
                  style={{ borderBottom: i < SIZE_GUIDE.length - 1 ? "1px solid rgba(17,17,17,0.06)" : "none" }}
                >
                  {[
                    row.size,
                    `${row.chest} cm`,
                    `${row.length} cm`,
                    `${row.shoulder} cm`,
                    `${row.sleeve} cm`,
                  ].map((cell, j) => (
                    <td
                      key={j}
                      style={{
                        color: j === 0 ? "#111111" : "#7C7C75",
                        fontSize: j === 0 ? "0.88rem" : "0.82rem",
                        fontWeight: j === 0 ? 400 : 300,
                        letterSpacing: j === 0 ? "0.1em" : "0.02em",
                        padding: "14px 0",
                      }}
                    >
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>

          {/* Fit note */}
          <div style={{
            backgroundColor: "#F5F0E8",
            padding: "20px 24px",
            marginBottom: 28,
          }}>
            <p style={{
              color: "#7C7C75",
              fontSize: "0.6rem",
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              fontWeight: 300,
              marginBottom: 8,
            }}>
              Silhouette
            </p>
            <p style={{
              color: "#111111",
              fontSize: "0.82rem",
              lineHeight: 1.75,
              fontWeight: 300,
            }}>
              Oversized boxy silhouette. Drop shoulder construction. Designed for structured drape over the body.
            </p>
          </div>

          {/* Model reference */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20 }}>
            {[
              { label: "Model Height", value: "186 cm" },
              { label: "Wearing Size", value: "M" },
              { label: "Fit Note", value: "True to size" },
            ].map((item) => (
              <div key={item.label} style={{ borderTop: "1px solid rgba(17,17,17,0.1)", paddingTop: 14 }}>
                <p style={{ color: "#7C7C75", fontSize: "0.58rem", letterSpacing: "0.18em", textTransform: "uppercase", fontWeight: 300, marginBottom: 5 }}>
                  {item.label}
                </p>
                <p style={{ color: "#111111", fontSize: "0.82rem", fontWeight: 300, letterSpacing: "0.04em" }}>
                  {item.value}
                </p>
              </div>
            ))}
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

// ─── Product Images (Left column) ─────────────────────────────────────────────

function ProductImages() {
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "3px" }}>
      {PRODUCT.images.map((img, i) => (
        <div
          key={i}
          style={{
            width: "100%",
            aspectRatio: img.ratio,
            backgroundColor: "#EDE8DF",
            overflow: "hidden",
          }}
        >
          <img
            src={img.src}
            alt={img.alt}
            loading={i === 0 ? "eager" : "lazy"}
            style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
          />
        </div>
      ))}
    </div>
  );
}

// ─── Product Info (Right sticky column) ───────────────────────────────────────

function ProductInfo() {
  const [activeColor, setActiveColor] = useState(0);
  const [activeSize, setActiveSize] = useState<string | null>(null);
  const [added, setAdded] = useState(false);
  const { addItem } = useCart();

  const handleCart = () => {
    if (!activeSize) return;
    const color = PRODUCT.colors[activeColor];
    addItem({
      id: `${PRODUCT.code}-${color.name}-${activeSize}`,
      name: PRODUCT.name,
      code: PRODUCT.code,
      price: PRODUCT.price,
      colorName: color.name,
      colorHex: color.hex,
      colorBorder: color.border,
      size: activeSize,
      image: PRODUCT.images[0].src,
      stylingNote: "Best worn with structured trousers in a neutral tone. Works alone or as a foundational layer.",
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2200);
  };

  return (
    <div
      style={{
        padding: "clamp(48px, 5vw, 80px) clamp(32px, 4vw, 72px) clamp(48px, 5vw, 80px) clamp(28px, 3.5vw, 56px)",
      }}
    >
      {/* Breadcrumb */}
      <button
        onClick={() => navigate("collection")}
        className="flex items-center gap-1.5 group hover:opacity-60 transition-opacity mb-8"
        style={{
          background: "none",
          border: "none",
          cursor: "pointer",
          padding: 0,
          color: "#7C7C75",
          fontFamily: '"DM Sans", sans-serif',
          fontSize: "0.62rem",
          letterSpacing: "0.18em",
          textTransform: "uppercase",
          fontWeight: 300,
          display: "flex",
          alignItems: "center",
          gap: "6px",
        }}
      >
        <span>←</span>
        <span>The Uniform</span>
      </button>

      {/* Code */}
      <p
        style={{
          color: "rgba(17,17,17,0.35)",
          fontFamily: '"DM Sans", sans-serif',
          fontSize: "0.58rem",
          letterSpacing: "0.2em",
          textTransform: "uppercase",
          fontWeight: 300,
          marginBottom: "8px",
        }}
      >
        {PRODUCT.code}
      </p>

      {/* Name */}
      <h1
        style={{
          color: "#111111",
          fontFamily: '"Bodoni Moda", serif',
          fontSize: "clamp(1.6rem, 3vw, 2.2rem)",
          fontWeight: 500,
          lineHeight: 1.1,
          letterSpacing: "-0.01em",
          marginBottom: "4px",
        }}
      >
        {PRODUCT.name}
      </h1>

      {/* Collection */}
      <p
        style={{
          color: "#7C7C75",
          fontFamily: '"DM Sans", sans-serif',
          fontSize: "0.72rem",
          letterSpacing: "0.1em",
          fontWeight: 300,
          marginBottom: "1.25rem",
        }}
      >
        {PRODUCT.collection}
      </p>

      {/* Price */}
      <p
        style={{
          color: "#111111",
          fontFamily: '"DM Sans", sans-serif',
          fontSize: "1.05rem",
          fontWeight: 400,
          letterSpacing: "0.03em",
          marginBottom: "1.5rem",
        }}
      >
        {PRODUCT.price}
      </p>

      {/* Description */}
      <p
        style={{
          color: "#7C7C75",
          fontFamily: '"DM Sans", sans-serif',
          fontSize: "0.82rem",
          lineHeight: 1.75,
          fontWeight: 300,
          marginBottom: "2rem",
        }}
      >
        {PRODUCT.description}
      </p>

      {/* Divider */}
      <div style={{ borderTop: "1px solid rgba(17,17,17,0.1)", marginBottom: "1.75rem" }} />

      {/* Color */}
      <div style={{ marginBottom: "1.75rem" }}>
        <p
          style={{
            color: "#7C7C75",
            fontFamily: '"DM Sans", sans-serif',
            fontSize: "0.6rem",
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            fontWeight: 300,
            marginBottom: "1rem",
          }}
        >
          Color — <span style={{ color: "#111111", fontWeight: 400 }}>{PRODUCT.colors[activeColor].name}</span>
        </p>
        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {PRODUCT.colors.map((c, i) => (
            <button
              key={c.name}
              onClick={() => setActiveColor(i)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: 0,
              }}
            >
              <span
                style={{
                  width: "20px",
                  height: "20px",
                  borderRadius: "50%",
                  backgroundColor: c.hex,
                  border: activeColor === i
                    ? "2px solid #111111"
                    : c.border
                    ? "1px solid rgba(17,17,17,0.25)"
                    : "1px solid transparent",
                  outline: activeColor === i ? "1px solid #111111" : "none",
                  outlineOffset: "2px",
                  flexShrink: 0,
                  transition: "outline 0.15s",
                }}
              />
              <span
                style={{
                  color: activeColor === i ? "#111111" : "#7C7C75",
                  fontFamily: '"DM Sans", sans-serif',
                  fontSize: "0.75rem",
                  fontWeight: activeColor === i ? 400 : 300,
                  letterSpacing: "0.06em",
                  transition: "color 0.15s",
                }}
              >
                {c.name}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Divider */}
      <div style={{ borderTop: "1px solid rgba(17,17,17,0.1)", marginBottom: "1.75rem" }} />

      {/* Size */}
      <div style={{ marginBottom: "1.75rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "1rem" }}>
          <p
            style={{
              color: "#7C7C75",
              fontFamily: '"DM Sans", sans-serif',
              fontSize: "0.6rem",
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              fontWeight: 300,
            }}
          >
            Size{activeSize ? ` — ${activeSize}` : ""}
          </p>
          <SizeGuideModal>
            <button
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                color: "rgba(17,17,17,0.4)",
                fontFamily: '"DM Sans", sans-serif',
                fontSize: "0.6rem",
                letterSpacing: "0.14em",
                textTransform: "uppercase",
                fontWeight: 300,
                textDecoration: "underline",
                textUnderlineOffset: "3px",
                padding: 0,
              }}
            >
              Size Guide
            </button>
          </SizeGuideModal>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "24px" }}>
          {PRODUCT.sizes.map((s) => (
            <button
              key={s}
              onClick={() => setActiveSize(activeSize === s ? null : s)}
              style={{
                background: "none",
                border: "none",
                borderBottom: activeSize === s ? "1px solid #111111" : "1px solid transparent",
                cursor: "pointer",
                padding: "2px 0 3px",
                color: activeSize === s ? "#111111" : "#7C7C75",
                fontFamily: '"DM Sans", sans-serif',
                fontSize: "0.75rem",
                fontWeight: activeSize === s ? 400 : 300,
                letterSpacing: "0.08em",
                transition: "color 0.15s, border-color 0.15s",
              }}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Divider */}
      <div style={{ borderTop: "1px solid rgba(17,17,17,0.1)", marginBottom: "1.5rem" }} />

      {/* Add to Cart */}
      <button
        onClick={handleCart}
        disabled={!activeSize}
        style={{
          width: "100%",
          backgroundColor: activeSize ? "#111111" : "rgba(17,17,17,0.12)",
          color: activeSize ? "#FAF8F4" : "rgba(17,17,17,0.3)",
          fontFamily: '"DM Sans", sans-serif',
          fontSize: "0.7rem",
          letterSpacing: "0.22em",
          textTransform: "uppercase",
          fontWeight: 400,
          padding: "18px",
          border: "none",
          cursor: activeSize ? "pointer" : "not-allowed",
          transition: "background-color 0.2s, color 0.2s",
          marginBottom: "1rem",
        }}
      >
        {added ? "ADDED TO SELECTION" : !activeSize ? "SELECT A SIZE" : "ADD TO CART"}
      </button>

      {/* View selection link after add */}
      {added && (
        <button
          onClick={() => navigate("cart")}
          style={{
            display: "block", width: "100%", textAlign: "center",
            fontFamily: '"DM Sans", sans-serif', fontSize: "0.62rem",
            letterSpacing: "0.18em", textTransform: "uppercase",
            color: "#7C7C75", background: "none", border: "none",
            cursor: "pointer", marginBottom: "0.75rem",
            transition: "color 0.2s",
          }}
          onMouseEnter={e => (e.currentTarget.style.color = "#111111")}
          onMouseLeave={e => (e.currentTarget.style.color = "#7C7C75")}
        >
          View Selection →
        </button>
      )}

      {/* Fabric spec line */}
      <p
        style={{
          color: "rgba(17,17,17,0.35)",
          fontFamily: '"DM Sans", sans-serif',
          fontSize: "0.65rem",
          textAlign: "center",
          fontWeight: 300,
          letterSpacing: "0.08em",
        }}
      >
        {PRODUCT.fabric} · Made in Egypt
      </p>
    </div>
  );
}

// ─── Section 05: Product Story ────────────────────────────────────────────────

function ProductStory() {
  const { ref, visible } = useInView(0.1);
  return (
    <section
      ref={ref}
      className="bg-[#FAF8F4]"
      style={{ padding: "clamp(80px, 10vw, 140px) clamp(24px, 6vw, 80px)" }}
    >
      <div className="max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8">
        <div
          className="lg:col-span-5"
          style={{
            opacity: visible ? 1 : 0,
            transform: visible ? "translateY(0)" : "translateY(20px)",
            transition: "opacity 0.9s ease, transform 0.9s ease",
          }}
        >
          <p
            style={{
              color: "#7C7C75",
              fontFamily: '"DM Sans", sans-serif',
              fontSize: "0.62rem",
              letterSpacing: "0.26em",
              textTransform: "uppercase",
              fontWeight: 300,
              marginBottom: "1.5rem",
            }}
          >
            Product Story
          </p>
          <h2
            style={{
              color: "#111111",
              fontFamily: '"Bodoni Moda", serif',
              fontSize: "clamp(2rem, 4.5vw, 3.2rem)",
              fontWeight: 500,
              lineHeight: 1.1,
              letterSpacing: "-0.01em",
            }}
          >
            Designed<br />To Stay.
          </h2>
        </div>

        <div
          className="lg:col-span-6 lg:col-start-7 flex flex-col gap-5"
          style={{
            color: "#7C7C75",
            fontFamily: '"DM Sans", sans-serif',
            fontSize: "0.9rem",
            lineHeight: 1.85,
            fontWeight: 300,
            opacity: visible ? 1 : 0,
            transform: visible ? "translateY(0)" : "translateY(20px)",
            transition: "opacity 0.9s ease 0.2s, transform 0.9s ease 0.2s",
          }}
        >
          <p>
            The Stanley Box Tee begins with 220 GSM combed cotton jersey — knitted from Egyptian Giza
            long-staple fibres in the Nile Delta. At this weight, the fabric holds its structure without
            stiffness. It drapes with intention.
          </p>
          <p>
            The box cut was developed to sit wide at the shoulder with a completely straight body.
            This is not the silhouette of fashion cycles. It is a proportion that works across body
            types, that improves with wash, and that does not date. The shoulder seam drops deliberately —
            not as a trend choice, but because this is how the fabric was intended to fall.
          </p>
          <p>
            Double-needle stitching on all seams. Pre-shrunk to remove post-wash distortion.
            Reactive dyed for colour permanence. The stitching will not unravel in a year.
            The dye will not fade into grey in a season.
          </p>
          <p>
            This garment was designed to be worn until it becomes yours.
          </p>
        </div>
      </div>
    </section>
  );
}

// ─── Section 06: Specifications ───────────────────────────────────────────────

function Specifications() {
  const { ref, visible } = useInView(0.1);
  return (
    <section
      ref={ref}
      className="bg-[#F5F0E8]"
      style={{ padding: "clamp(64px, 8vw, 100px) clamp(24px, 6vw, 80px)" }}
    >
      <div className="max-w-[1400px] mx-auto">
        <p
          style={{
            color: "#7C7C75",
            fontFamily: '"DM Sans", sans-serif',
            fontSize: "0.62rem",
            letterSpacing: "0.24em",
            textTransform: "uppercase",
            fontWeight: 300,
            marginBottom: "3rem",
            opacity: visible ? 1 : 0,
            transition: "opacity 0.8s ease",
          }}
        >
          Specifications
        </p>

        <div
          className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-20"
          style={{
            opacity: visible ? 1 : 0,
            transform: visible ? "translateY(0)" : "translateY(16px)",
            transition: "opacity 0.9s ease 0.1s, transform 0.9s ease 0.1s",
          }}
        >
          {/* Fabric */}
          <div>
            <p
              style={{
                color: "#111111",
                fontFamily: '"Bodoni Moda", serif',
                fontSize: "1.1rem",
                fontWeight: 500,
                letterSpacing: "0.02em",
                marginBottom: "1rem",
                borderBottom: "1px solid rgba(17,17,17,0.12)",
                paddingBottom: "0.75rem",
              }}
            >
              Fabric
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              {[
                ["Material", "100% Egyptian Giza cotton"],
                ["Weight", "220 GSM"],
                ["Construction", "Combed jersey knit"],
                ["Dye process", "Reactive dyed"],
                ["Treatment", "Pre-shrunk"],
              ].map(([label, value]) => (
                <div key={label} style={{ display: "flex", gap: "16px", alignItems: "baseline" }}>
                  <span
                    style={{
                      color: "#7C7C75",
                      fontFamily: '"DM Sans", sans-serif',
                      fontSize: "0.72rem",
                      fontWeight: 300,
                      minWidth: "100px",
                      flexShrink: 0,
                    }}
                  >
                    {label}
                  </span>
                  <span
                    style={{
                      color: "#111111",
                      fontFamily: '"DM Sans", sans-serif',
                      fontSize: "0.82rem",
                      fontWeight: 300,
                    }}
                  >
                    {value}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Details */}
          <div>
            <p
              style={{
                color: "#111111",
                fontFamily: '"Bodoni Moda", serif',
                fontSize: "1.1rem",
                fontWeight: 500,
                letterSpacing: "0.02em",
                marginBottom: "1rem",
                borderBottom: "1px solid rgba(17,17,17,0.12)",
                paddingBottom: "0.75rem",
              }}
            >
              Details
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: "0" }}>
              {PRODUCT.details.map((detail, i) => (
                <div
                  key={detail}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "12px",
                    padding: "10px 0",
                    borderBottom: i < PRODUCT.details.length - 1 ? "1px solid rgba(17,17,17,0.07)" : "none",
                  }}
                >
                  <span
                    style={{
                      width: "3px",
                      height: "3px",
                      borderRadius: "50%",
                      backgroundColor: "#7C7C75",
                      flexShrink: 0,
                    }}
                  />
                  <span
                    style={{
                      color: "#111111",
                      fontFamily: '"DM Sans", sans-serif',
                      fontSize: "0.82rem",
                      fontWeight: 300,
                      letterSpacing: "0.04em",
                    }}
                  >
                    {detail}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Section 07: Fit Philosophy ───────────────────────────────────────────────

const BoxTeeSilhouette = () => (
  <svg viewBox="0 0 200 250" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <path
      d="M 55 120 L 4 88 L 0 110 L 32 126 L 32 226 L 168 226 L 168 126 L 200 110 L 196 88 L 145 120 C 134 96 66 96 55 120 Z"
      stroke="#111111"
      strokeWidth="1.2"
      strokeLinejoin="round"
      strokeLinecap="round"
    />
    {/* Dropped shoulder indicator lines */}
    <line x1="32" y1="126" x2="55" y2="120" stroke="rgba(17,17,17,0.25)" strokeWidth="0.8" strokeDasharray="3 3" />
    <line x1="145" y1="120" x2="168" y2="126" stroke="rgba(17,17,17,0.25)" strokeWidth="0.8" strokeDasharray="3 3" />
  </svg>
);

function FitPhilosophy() {
  const { ref, visible } = useInView(0.1);
  return (
    <section
      ref={ref}
      className="bg-[#FAF8F4]"
      style={{ padding: "clamp(80px, 10vw, 130px) clamp(24px, 6vw, 80px)" }}
    >
      <div className="max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
        {/* Silhouette */}
        <div
          className="lg:col-span-4 flex items-center justify-center"
          style={{
            opacity: visible ? 1 : 0,
            transition: "opacity 1s ease",
          }}
        >
          <div style={{ width: "min(200px, 60vw)" }}>
            <BoxTeeSilhouette />
          </div>
        </div>

        {/* Text */}
        <div
          className="lg:col-span-7 lg:col-start-6"
          style={{
            opacity: visible ? 1 : 0,
            transform: visible ? "translateY(0)" : "translateY(20px)",
            transition: "opacity 0.9s ease 0.2s, transform 0.9s ease 0.2s",
          }}
        >
          <p
            style={{
              color: "#7C7C75",
              fontFamily: '"DM Sans", sans-serif',
              fontSize: "0.62rem",
              letterSpacing: "0.24em",
              textTransform: "uppercase",
              fontWeight: 300,
              marginBottom: "1.25rem",
            }}
          >
            Fit Philosophy
          </p>
          <h2
            style={{
              color: "#111111",
              fontFamily: '"Bodoni Moda", serif',
              fontSize: "clamp(2rem, 4.5vw, 3rem)",
              fontWeight: 500,
              lineHeight: 1.1,
              letterSpacing: "-0.01em",
              marginBottom: "2rem",
            }}
          >
            The Box Tee.
          </h2>

          <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
            {[
              {
                label: "Shoulders",
                text: "The seam sits 3–4 cm below the natural shoulder point. This is not the same as a garment that is too large — it is a deliberate placement that gives the sleeve its fall.",
              },
              {
                label: "Body",
                text: "Completely straight from armhole to hem. No taper. The torso hangs free of the body, which is why the fabric weight matters — at 220 GSM, it falls rather than billows.",
              },
              {
                label: "Length",
                text: "Hits at the mid-hip. Long enough to tuck cleanly if worn that way. Short enough to wear untucked without feeling like a dress.",
              },
            ].map(({ label, text }) => (
              <div
                key={label}
                style={{
                  borderTop: "1px solid rgba(17,17,17,0.1)",
                  paddingTop: "1.25rem",
                }}
              >
                <p
                  style={{
                    color: "#111111",
                    fontFamily: '"DM Sans", sans-serif',
                    fontSize: "0.7rem",
                    letterSpacing: "0.16em",
                    textTransform: "uppercase",
                    fontWeight: 400,
                    marginBottom: "0.5rem",
                  }}
                >
                  {label}
                </p>
                <p
                  style={{
                    color: "#7C7C75",
                    fontFamily: '"DM Sans", sans-serif',
                    fontSize: "0.85rem",
                    lineHeight: 1.75,
                    fontWeight: 300,
                  }}
                >
                  {text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Section 09: Fabric Close-Up ──────────────────────────────────────────────

function FabricCloseUp() {
  return (
    <section style={{ position: "relative", backgroundColor: "#EDE8DF" }}>
      <div style={{ aspectRatio: "21/9", overflow: "hidden" }}>
        <img
          src="https://images.unsplash.com/photo-1606343131474-abc41dc6bb7d?w=1800&h=771&fit=crop&auto=format"
          alt="220 GSM Egyptian cotton jersey — macro fabric detail"
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
          loading="lazy"
        />
      </div>
      <div
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          padding: "clamp(24px, 4vw, 56px)",
          background: "linear-gradient(to top, rgba(17,17,17,0.5) 0%, transparent 100%)",
        }}
      >
        <p
          style={{
            color: "#FAF8F4",
            fontFamily: '"Bodoni Moda", serif',
            fontSize: "clamp(1rem, 2.5vw, 1.6rem)",
            fontWeight: 500,
            letterSpacing: "0.02em",
            marginBottom: "6px",
          }}
        >
          220 GSM Cotton Jersey
        </p>
        <p
          style={{
            color: "rgba(250,248,244,0.7)",
            fontFamily: '"DM Sans", sans-serif',
            fontSize: "clamp(0.72rem, 1.5vw, 0.88rem)",
            fontWeight: 300,
            letterSpacing: "0.08em",
          }}
        >
          Engineered for structure. Softened through wear.
        </p>
      </div>
    </section>
  );
}

// ─── Section 10: Made in Alexandria ───────────────────────────────────────────

function MadeInAlexandria() {
  const { ref, visible } = useInView(0.1);
  return (
    <section
      ref={ref}
      style={{
        backgroundColor: "#111111",
        padding: "clamp(80px, 10vw, 130px) clamp(24px, 6vw, 80px)",
      }}
    >
      <div className="max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-start">
        {/* Text */}
        <div
          className="lg:col-span-5"
          style={{
            opacity: visible ? 1 : 0,
            transform: visible ? "translateY(0)" : "translateY(20px)",
            transition: "opacity 1s ease, transform 1s ease",
          }}
        >
          <p
            style={{
              color: "rgba(250,248,244,0.35)",
              fontFamily: '"DM Sans", sans-serif',
              fontSize: "0.62rem",
              letterSpacing: "0.24em",
              textTransform: "uppercase",
              fontWeight: 300,
              marginBottom: "1.5rem",
            }}
          >
            Origin
          </p>
          <h2
            style={{
              color: "#FAF8F4",
              fontFamily: '"Bodoni Moda", serif',
              fontSize: "clamp(2rem, 4.5vw, 3.2rem)",
              fontWeight: 500,
              lineHeight: 1.1,
              letterSpacing: "-0.01em",
              marginBottom: "2rem",
            }}
          >
            Made Near<br />The Sea.
          </h2>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "1rem",
              color: "rgba(250,248,244,0.55)",
              fontFamily: '"DM Sans", sans-serif',
              fontSize: "0.88rem",
              lineHeight: 1.8,
              fontWeight: 300,
              maxWidth: "400px",
            }}
          >
            <p>
              Alexandria has manufactured textiles for over a century. The city's garment heritage
              runs through family workshops, industrial cutting rooms, and dyeing facilities that
              have operated across generations.
            </p>
            <p>
              QUTB was built on access to this knowledge — specifically through a founder whose
              father spent decades inside these facilities. The factory that produces each piece
              is not a supplier. It is the source of the brand.
            </p>
            <p>
              Every stitch is made near the sea. The salt air, the light, the pace of the
              Mediterranean — all of it informs what QUTB is.
            </p>
          </div>
        </div>

        {/* Images */}
        <div
          className="lg:col-span-6 lg:col-start-7"
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "3px",
            opacity: visible ? 1 : 0,
            transition: "opacity 1.2s ease 0.2s",
          }}
        >
          <div style={{ aspectRatio: "4/3", backgroundColor: "#1D2635", overflow: "hidden" }}>
            <img
              src="https://images.unsplash.com/photo-1741176506261-73218298e4d8?w=800&h=600&fit=crop&auto=format"
              alt="Textile workers sorting fabric in an Alexandria workshop"
              style={{ width: "100%", height: "100%", objectFit: "cover", opacity: 0.85 }}
              loading="lazy"
            />
          </div>
          <div style={{ aspectRatio: "16/9", backgroundColor: "#1D2635", overflow: "hidden" }}>
            <img
              src="https://images.unsplash.com/photo-1718846526824-f7f30a177d3a?w=800&h=450&fit=crop&auto=format"
              alt="Alexandria waterfront — Mediterranean coast"
              style={{ width: "100%", height: "100%", objectFit: "cover", opacity: 0.75 }}
              loading="lazy"
            />
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Section 11: Complete The Uniform ─────────────────────────────────────────

function CompleteTheUniform() {
  const { ref, visible } = useInView(0.1);
  return (
    <section
      ref={ref}
      className="bg-[#FAF8F4]"
      style={{ padding: "clamp(80px, 10vw, 130px) clamp(24px, 6vw, 80px)" }}
    >
      <div className="max-w-[1400px] mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-14 md:mb-18">
          <div
            style={{
              opacity: visible ? 1 : 0,
              transform: visible ? "translateY(0)" : "translateY(12px)",
              transition: "opacity 0.9s ease, transform 0.9s ease",
            }}
          >
            <p
              style={{
                color: "#7C7C75",
                fontFamily: '"DM Sans", sans-serif',
                fontSize: "0.62rem",
                letterSpacing: "0.26em",
                textTransform: "uppercase",
                fontWeight: 300,
                marginBottom: "0.75rem",
              }}
            >
              Also From The Uniform
            </p>
            <h2
              style={{
                color: "#111111",
                fontFamily: '"Bodoni Moda", serif',
                fontSize: "clamp(1.8rem, 3.5vw, 2.6rem)",
                fontWeight: 500,
                lineHeight: 1.1,
                letterSpacing: "-0.01em",
              }}
            >
              Complete The Uniform
            </h2>
          </div>
          <button
            onClick={() => navigate("collection")}
            className="flex items-center gap-2 group hover:opacity-60 transition-opacity self-start md:self-auto"
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "#111111",
              fontFamily: '"DM Sans", sans-serif',
              fontSize: "0.7rem",
              letterSpacing: "0.15em",
              textTransform: "uppercase",
              fontWeight: 400,
              padding: 0,
              display: "flex",
              alignItems: "center",
              gap: "8px",
              opacity: visible ? 1 : 0,
              transition: "opacity 0.9s ease 0.1s",
            }}
          >
            <span>View All</span>
            <ArrowRight size={13} strokeWidth={1.5} className="transition-transform group-hover:translate-x-1" />
          </button>
        </div>

        <div
          className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-10 lg:gap-12"
          style={{
            opacity: visible ? 1 : 0,
            transform: visible ? "translateY(0)" : "translateY(20px)",
            transition: "opacity 0.9s ease 0.15s, transform 0.9s ease 0.15s",
          }}
        >
          {RELATED.map((product) => (
            <button
              key={product.code}
              onClick={() => navigate("product")}
              style={{ background: "none", border: "none", cursor: "pointer", padding: 0, textAlign: "left" }}
              className="group"
            >
              <div
                style={{
                  aspectRatio: "3/4",
                  backgroundColor: "#EDE8DF",
                  overflow: "hidden",
                  marginBottom: "1rem",
                }}
              >
                <img
                  src={product.image}
                  alt={product.name}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    transition: "transform 0.7s ease",
                  }}
                  className="group-hover:scale-[1.03]"
                  loading="lazy"
                />
              </div>
              <p
                style={{
                  color: "rgba(17,17,17,0.35)",
                  fontFamily: '"DM Sans", sans-serif',
                  fontSize: "0.58rem",
                  letterSpacing: "0.18em",
                  textTransform: "uppercase",
                  marginBottom: "3px",
                }}
              >
                {product.code}
              </p>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: "8px" }}>
                <p
                  style={{
                    color: "#111111",
                    fontFamily: '"Bodoni Moda", serif',
                    fontSize: "1rem",
                    fontWeight: 400,
                    letterSpacing: "0.01em",
                  }}
                >
                  {product.name}
                </p>
                <p
                  style={{
                    color: "#111111",
                    fontFamily: '"DM Sans", sans-serif',
                    fontSize: "0.8rem",
                    fontWeight: 400,
                    whiteSpace: "nowrap",
                  }}
                >
                  {product.price}
                </p>
              </div>
              <p
                style={{
                  color: "#7C7C75",
                  fontFamily: '"DM Sans", sans-serif',
                  fontSize: "0.72rem",
                  fontWeight: 300,
                  marginTop: "2px",
                }}
              >
                {product.color}
              </p>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Section 12: Footnote ─────────────────────────────────────────────────────

function Footnote() {
  const { ref, visible } = useInView(0.2);
  return (
    <section
      ref={ref}
      className="bg-[#FAF8F4] flex flex-col items-center justify-center text-center"
      style={{ padding: "clamp(80px, 14vw, 160px) clamp(24px, 6vw, 80px)" }}
    >
      {["Fabric first.", "Logo second.", "Always."].map((line, i) => (
        <span
          key={line}
          style={{
            display: "block",
            color: "#111111",
            fontFamily: '"Bodoni Moda", serif',
            fontSize: "clamp(2rem, 5vw, 4.5rem)",
            fontWeight: 500,
            lineHeight: 1.05,
            letterSpacing: "-0.01em",
            opacity: visible ? 1 : 0,
            transform: visible ? "translateY(0)" : "translateY(20px)",
            transition: `opacity 0.9s ease ${i * 0.15}s, transform 0.9s ease ${i * 0.15}s`,
          }}
        >
          {line}
        </span>
      ))}
    </section>
  );
}

// ─── Page Assembly ────────────────────────────────────────────────────────────

export function ProductPage() {
  return (
    <div style={{ backgroundColor: "#FAF8F4", fontFamily: '"DM Sans", sans-serif', overflowX: "hidden" }}>
      <style>{`
        .pdp-layout {
          display: grid;
          grid-template-columns: 62% 38%;
          align-items: start;
        }
        .pdp-sticky {
          position: sticky;
          top: 72px;
        }
        @media (max-width: 1024px) {
          .pdp-layout {
            display: flex !important;
            flex-direction: column !important;
          }
          .pdp-sticky {
            position: relative !important;
            top: 0 !important;
          }
        }
        @keyframes sgFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes sgSlideIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      {/* Section 01–04 + 08: Main product layout */}
      <div className="pdp-layout" style={{ maxWidth: "1600px", margin: "0 auto" }}>
        {/* Left: image stack */}
        <div style={{ paddingTop: "72px" }}>
          <ProductImages />
        </div>

        {/* Right: sticky info */}
        <div className="pdp-sticky">
          <ProductInfo />
        </div>
      </div>

      {/* Below-fold sections */}
      <ProductStory />
      <Specifications />
      <FitPhilosophy />
      <FabricCloseUp />
      <MadeInAlexandria />
      <CompleteTheUniform />
      <Footnote />
      <QutbFooter />
    </div>
  );
}
