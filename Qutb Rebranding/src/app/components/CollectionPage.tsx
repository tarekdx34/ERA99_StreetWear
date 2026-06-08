import { useState, useEffect, useRef } from "react";
import { ArrowRight, ChevronDown, X } from "lucide-react";
import { QutbFooter } from "./QutbFooter";
import { navigate } from "../nav";
import { useCart } from "../CartContext";

// ─── Data ────────────────────────────────────────────────────────────────────

type Category = "all" | "box" | "regular" | "ringer";

const PRODUCTS = [
  {
    id: 1,
    name: "Stanley Box Tee",
    code: "QT-001",
    category: "box" as const,
    color: "Salt White",
    hex: "#FAF8F4",
    price: "EGP 890",
    fabric: "220 GSM Egyptian Giza Cotton",
    weight: "220 GSM",
    fit: "Oversized boxy silhouette. Dropped shoulders.",
    front: "https://images.unsplash.com/photo-1581655353564-df123a1eb820?w=560&h=720&fit=crop&crop=top&auto=format",
    hover: "https://images.unsplash.com/photo-1606343131474-abc41dc6bb7d?w=560&h=720&fit=crop&auto=format",
    colors: [
      { name: "Salt White", hex: "#FAF8F4", border: true },
      { name: "Charcoal", hex: "#111111" },
      { name: "Stone", hex: "#7C7C75" },
      { name: "Sand", hex: "#C9B99A" },
    ],
  },
  {
    id: 2,
    name: "Corniche Regular Tee",
    code: "QT-003",
    category: "regular" as const,
    color: "Salt White",
    hex: "#FAF8F4",
    price: "EGP 820",
    fabric: "180 GSM Egyptian Giza Cotton",
    weight: "180 GSM",
    fit: "Straight regular silhouette. Clean hem.",
    front: "https://images.unsplash.com/photo-1651761179569-4ba2aa054997?w=560&h=720&fit=crop&auto=format",
    hover: "https://images.unsplash.com/photo-1632844384543-bb1b2c3900d7?w=560&h=720&fit=crop&auto=format",
    colors: [
      { name: "Salt White", hex: "#FAF8F4", border: true },
      { name: "Charcoal", hex: "#111111" },
      { name: "Navy", hex: "#1D2635" },
    ],
  },
  {
    id: 3,
    name: "Montaza Ringer Tee",
    code: "QT-002",
    category: "ringer" as const,
    color: "Salt White / Navy",
    hex: "#FAF8F4",
    price: "EGP 950",
    fabric: "200 GSM Egyptian Giza Cotton",
    weight: "200 GSM",
    fit: "Regular fit. Contrast rib at collar and cuffs.",
    front: "https://images.unsplash.com/photo-1722310752951-4d459d28c678?w=560&h=720&fit=crop&crop=top&auto=format",
    hover: "https://images.unsplash.com/photo-1612654516785-0e1a96be21d1?w=560&h=720&fit=crop&auto=format",
    colors: [
      { name: "Salt White / Navy", hex: "#FAF8F4", border: true },
      { name: "Bone / Charcoal", hex: "#F5F0E8", border: true },
      { name: "Sage", hex: "#8A9E85" },
    ],
  },
  {
    id: 4,
    name: "Bahary Heavy Tee",
    code: "QT-004",
    category: "box" as const,
    color: "Charcoal",
    hex: "#111111",
    price: "EGP 980",
    fabric: "260 GSM Egyptian Giza Cotton",
    weight: "260 GSM",
    fit: "Oversized boxy. Structured body. Maximum weight.",
    front: "https://images.unsplash.com/photo-1620799139507-2a76f79a2f4d?w=560&h=720&fit=crop&auto=format",
    hover: "https://images.unsplash.com/photo-1606343131164-ab932aeffdaa?w=560&h=720&fit=crop&auto=format",
    colors: [
      { name: "Charcoal", hex: "#111111" },
      { name: "Sand", hex: "#C9B99A" },
      { name: "Stone", hex: "#7C7C75" },
    ],
  },
  {
    id: 5,
    name: "Ramleh Box Tee",
    code: "QT-005",
    category: "box" as const,
    color: "Bone White",
    hex: "#F5F0E8",
    price: "EGP 890",
    fabric: "220 GSM Egyptian Giza Cotton",
    weight: "220 GSM",
    fit: "Boxy silhouette. Relaxed through the body.",
    front: "https://images.unsplash.com/photo-1581655353564-df123a1eb820?w=560&h=720&fit=crop&crop=center&auto=format",
    hover: "https://images.unsplash.com/photo-1606343131474-abc41dc6bb7d?w=560&h=720&fit=crop&crop=right&auto=format",
    colors: [
      { name: "Bone White", hex: "#F5F0E8", border: true },
      { name: "Navy", hex: "#1D2635" },
      { name: "Olive", hex: "#6B6B4E" },
    ],
  },
  {
    id: 6,
    name: "Sidi Gaber Tee",
    code: "QT-006",
    category: "regular" as const,
    color: "Stone",
    hex: "#7C7C75",
    price: "EGP 820",
    fabric: "180 GSM Egyptian Giza Cotton",
    weight: "180 GSM",
    fit: "Straight regular fit. Slightly longer hem.",
    front: "https://images.unsplash.com/photo-1651761179569-4ba2aa054997?w=560&h=720&fit=crop&crop=center&auto=format",
    hover: "https://images.unsplash.com/photo-1632844384543-bb1b2c3900d7?w=560&h=720&fit=crop&crop=bottom&auto=format",
    colors: [
      { name: "Stone", hex: "#7C7C75" },
      { name: "Salt White", hex: "#FAF8F4", border: true },
      { name: "Charcoal", hex: "#111111" },
    ],
  },
];

// ─── Utility ─────────────────────────────────────────────────────────────────

function useInView(threshold = 0.15) {
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

// ─── Section 01: Intro ───────────────────────────────────────────────────────

function CollectionIntro() {
  const { ref, visible } = useInView(0.1);
  return (
    <section
      ref={ref}
      className="bg-[#FAF8F4]"
      style={{ padding: 'clamp(120px, 14vw, 180px) clamp(24px, 6vw, 80px) clamp(64px, 8vw, 100px)' }}
    >
      <div className="max-w-[1400px] mx-auto">
        <p
          style={{
            color: '#7C7C75',
            fontFamily: '"DM Sans", sans-serif',
            fontSize: '0.65rem',
            letterSpacing: '0.3em',
            textTransform: 'uppercase',
            fontWeight: 300,
            marginBottom: '2.5rem',
            opacity: visible ? 1 : 0,
            transform: visible ? 'translateY(0)' : 'translateY(12px)',
            transition: 'opacity 0.8s ease, transform 0.8s ease',
          }}
        >
          03 — The Uniform
        </p>

        <h1
          style={{
            color: '#111111',
            fontFamily: '"Bodoni Moda", serif',
            fontSize: 'clamp(3rem, 8vw, 7rem)',
            fontWeight: 500,
            lineHeight: 1,
            letterSpacing: '-0.02em',
            marginBottom: '1.5rem',
            opacity: visible ? 1 : 0,
            transform: visible ? 'translateY(0)' : 'translateY(20px)',
            transition: 'opacity 0.9s ease 0.1s, transform 0.9s ease 0.1s',
          }}
        >
          The Uniform.
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 mt-8">
          <div
            className="md:col-span-5"
            style={{
              opacity: visible ? 1 : 0,
              transform: visible ? 'translateY(0)' : 'translateY(16px)',
              transition: 'opacity 0.9s ease 0.2s, transform 0.9s ease 0.2s',
            }}
          >
            <p
              style={{
                color: '#111111',
                fontFamily: '"Bodoni Moda", serif',
                fontSize: 'clamp(1.1rem, 2.5vw, 1.5rem)',
                fontWeight: 400,
                lineHeight: 1.4,
                letterSpacing: '-0.005em',
                fontStyle: 'italic',
              }}
            >
              Three silhouettes.<br />Built to stay.
            </p>
          </div>
          <div
            className="md:col-span-4 md:col-start-8 flex items-end"
            style={{
              opacity: visible ? 1 : 0,
              transform: visible ? 'translateY(0)' : 'translateY(16px)',
              transition: 'opacity 0.9s ease 0.3s, transform 0.9s ease 0.3s',
            }}
          >
            <p
              style={{
                color: '#7C7C75',
                fontFamily: '"DM Sans", sans-serif',
                fontSize: '0.85rem',
                lineHeight: 1.75,
                fontWeight: 300,
              }}
            >
              A permanent collection of essentials refined through fabric, fit, and repetition.
              These are not seasonal pieces. They are yours to keep.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Section 02: Filter Bar ───────────────────────────────────────────────────

const SIZES = ["XS", "S", "M", "L", "XL", "XXL"];
const COLORS = [
  { name: "Salt White", hex: "#FAF8F4", border: true },
  { name: "Charcoal", hex: "#111111" },
  { name: "Stone", hex: "#7C7C75" },
  { name: "Sand", hex: "#C9B99A" },
  { name: "Navy", hex: "#1D2635" },
  { name: "Bone White", hex: "#F5F0E8", border: true },
];

interface FilterBarProps {
  active: Category;
  onFilter: (c: Category) => void;
}

function FilterBar({ active, onFilter }: FilterBarProps) {
  const [sizeOpen, setSizeOpen] = useState(false);
  const [colorOpen, setColorOpen] = useState(false);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);

  const cats: { key: Category; label: string }[] = [
    { key: "all", label: "All" },
    { key: "box", label: "Box Tee" },
    { key: "regular", label: "Regular Tee" },
    { key: "ringer", label: "Ringer Tee" },
  ];

  return (
    <div
      style={{
        borderTop: '1px solid rgba(17,17,17,0.1)',
        borderBottom: '1px solid rgba(17,17,17,0.1)',
        backgroundColor: '#FAF8F4',
        position: 'sticky',
        top: '72px',
        zIndex: 40,
      }}
    >
      <div
        className="max-w-[1400px] mx-auto flex items-center justify-between"
        style={{ padding: '0 clamp(24px, 6vw, 80px)' }}
      >
        {/* Category tabs */}
        <div className="flex items-center gap-0">
          {cats.map((cat) => (
            <button
              key={cat.key}
              onClick={() => onFilter(cat.key)}
              style={{
                fontFamily: '"DM Sans", sans-serif',
                fontSize: '0.7rem',
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                fontWeight: active === cat.key ? 400 : 300,
                color: active === cat.key ? '#111111' : '#7C7C75',
                padding: '18px 20px 16px',
                border: 'none',
                background: 'none',
                cursor: 'pointer',
                borderBottom: active === cat.key ? '2px solid #111111' : '2px solid transparent',
                transition: 'color 0.2s, border-color 0.2s',
                whiteSpace: 'nowrap',
              }}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Secondary filters */}
        <div className="hidden md:flex items-center gap-0">
          {/* Size */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => { setSizeOpen(!sizeOpen); setColorOpen(false); }}
              style={{
                fontFamily: '"DM Sans", sans-serif',
                fontSize: '0.7rem',
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                fontWeight: selectedSize ? 400 : 300,
                color: selectedSize ? '#111111' : '#7C7C75',
                padding: '18px 20px 16px',
                border: 'none',
                background: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'color 0.2s',
              }}
            >
              {selectedSize ? `Size: ${selectedSize}` : 'Size'}
              <ChevronDown
                size={11}
                strokeWidth={1.5}
                style={{
                  transition: 'transform 0.2s',
                  transform: sizeOpen ? 'rotate(180deg)' : 'rotate(0)',
                }}
              />
            </button>
            {sizeOpen && (
              <div
                style={{
                  position: 'absolute',
                  top: 'calc(100% + 1px)',
                  right: 0,
                  backgroundColor: '#FAF8F4',
                  border: '1px solid rgba(17,17,17,0.12)',
                  padding: '8px 0',
                  minWidth: '100px',
                  zIndex: 50,
                }}
              >
                {SIZES.map((s) => (
                  <button
                    key={s}
                    onClick={() => { setSelectedSize(selectedSize === s ? null : s); setSizeOpen(false); }}
                    style={{
                      display: 'block',
                      width: '100%',
                      textAlign: 'left',
                      padding: '8px 20px',
                      fontFamily: '"DM Sans", sans-serif',
                      fontSize: '0.72rem',
                      letterSpacing: '0.08em',
                      fontWeight: selectedSize === s ? 400 : 300,
                      color: selectedSize === s ? '#111111' : '#7C7C75',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                    }}
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Color */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => { setColorOpen(!colorOpen); setSizeOpen(false); }}
              style={{
                fontFamily: '"DM Sans", sans-serif',
                fontSize: '0.7rem',
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                fontWeight: selectedColor ? 400 : 300,
                color: selectedColor ? '#111111' : '#7C7C75',
                padding: '18px 20px 16px',
                border: 'none',
                background: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                transition: 'color 0.2s',
              }}
            >
              {selectedColor ? `Color: ${selectedColor}` : 'Color'}
              <ChevronDown
                size={11}
                strokeWidth={1.5}
                style={{
                  transition: 'transform 0.2s',
                  transform: colorOpen ? 'rotate(180deg)' : 'rotate(0)',
                }}
              />
            </button>
            {colorOpen && (
              <div
                style={{
                  position: 'absolute',
                  top: 'calc(100% + 1px)',
                  right: 0,
                  backgroundColor: '#FAF8F4',
                  border: '1px solid rgba(17,17,17,0.12)',
                  padding: '14px 20px',
                  minWidth: '180px',
                  zIndex: 50,
                }}
              >
                <p
                  style={{
                    color: '#7C7C75',
                    fontFamily: '"DM Sans", sans-serif',
                    fontSize: '0.6rem',
                    letterSpacing: '0.18em',
                    textTransform: 'uppercase',
                    marginBottom: '12px',
                    fontWeight: 300,
                  }}
                >
                  Color
                </p>
                <div className="flex flex-wrap gap-2.5">
                  {COLORS.map((c) => (
                    <button
                      key={c.name}
                      onClick={() => { setSelectedColor(selectedColor === c.name ? null : c.name); setColorOpen(false); }}
                      aria-label={c.name}
                      title={c.name}
                      style={{
                        width: '22px',
                        height: '22px',
                        borderRadius: '50%',
                        backgroundColor: c.hex,
                        border: selectedColor === c.name
                          ? '2px solid #111111'
                          : c.border ? '1px solid rgba(17,17,17,0.25)' : '1px solid transparent',
                        outline: selectedColor === c.name ? '1px solid #111111' : 'none',
                        outlineOffset: '2px',
                        cursor: 'pointer',
                        padding: 0,
                      }}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Section 03: Featured Product ────────────────────────────────────────────

function FeaturedProduct() {
  const { ref, visible } = useInView(0.1);
  const featured = PRODUCTS[0];
  const [activeColor, setActiveColor] = useState(0);

  return (
    <section
      ref={ref}
      className="bg-[#FAF8F4]"
      style={{ padding: 'clamp(64px, 8vw, 100px) clamp(24px, 6vw, 80px)' }}
    >
      <div className="max-w-[1400px] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-0 items-stretch">
          {/* Image — left, 7 cols */}
          <div
            className="lg:col-span-7 relative overflow-hidden"
            style={{
              backgroundColor: '#EDE8DF',
              aspectRatio: '3/2',
              opacity: visible ? 1 : 0,
              transition: 'opacity 1s ease',
            }}
          >
            <img
              src={`https://images.unsplash.com/photo-1581655353564-df123a1eb820?w=900&h=600&fit=crop&crop=top&auto=format`}
              alt="Stanley Box Tee — hero shot"
              className="w-full h-full object-cover"
            />
            <div
              className="absolute top-6 left-6"
              style={{
                color: 'rgba(250,248,244,0.7)',
                fontFamily: '"DM Sans", sans-serif',
                fontSize: '0.58rem',
                letterSpacing: '0.2em',
                textTransform: 'uppercase',
                fontWeight: 300,
                backgroundColor: 'rgba(17,17,17,0.5)',
                padding: '5px 10px',
              }}
            >
              Featured
            </div>
          </div>

          {/* Info — right, 4 cols offset by 1 */}
          <div
            className="lg:col-span-5 lg:col-start-8 flex flex-col justify-center"
            style={{
              padding: '0 clamp(16px, 3vw, 40px) 0 clamp(32px, 5vw, 72px)',
              opacity: visible ? 1 : 0,
              transform: visible ? 'translateY(0)' : 'translateY(20px)',
              transition: 'opacity 1s ease 0.2s, transform 1s ease 0.2s',
            }}
          >
            <p
              style={{
                color: '#7C7C75',
                fontFamily: '"DM Sans", sans-serif',
                fontSize: '0.6rem',
                letterSpacing: '0.22em',
                textTransform: 'uppercase',
                fontWeight: 300,
                marginBottom: '0.75rem',
              }}
            >
              {featured.code} — The Uniform
            </p>

            <h2
              style={{
                color: '#111111',
                fontFamily: '"Bodoni Moda", serif',
                fontSize: 'clamp(1.8rem, 3.5vw, 2.6rem)',
                fontWeight: 500,
                lineHeight: 1.1,
                letterSpacing: '-0.01em',
                marginBottom: '1rem',
              }}
            >
              {featured.name}
            </h2>

            <p
              style={{
                color: '#111111',
                fontFamily: '"DM Sans", sans-serif',
                fontSize: '1rem',
                fontWeight: 400,
                letterSpacing: '0.03em',
                marginBottom: '2rem',
              }}
            >
              {featured.price}
            </p>

            <div
              className="border-t border-b py-5 mb-5 flex flex-col gap-4"
              style={{ borderColor: 'rgba(17,17,17,0.1)' }}
            >
              <div>
                <p style={{ color: '#7C7C75', fontFamily: '"DM Sans", sans-serif', fontSize: '0.62rem', letterSpacing: '0.18em', textTransform: 'uppercase', fontWeight: 300, marginBottom: '3px' }}>
                  Fabric Weight
                </p>
                <p style={{ color: '#111111', fontFamily: '"DM Sans", sans-serif', fontSize: '0.82rem', fontWeight: 400 }}>
                  {featured.weight} — Heavyweight
                </p>
              </div>
              <div>
                <p style={{ color: '#7C7C75', fontFamily: '"DM Sans", sans-serif', fontSize: '0.62rem', letterSpacing: '0.18em', textTransform: 'uppercase', fontWeight: 300, marginBottom: '3px' }}>
                  Fit
                </p>
                <p style={{ color: '#111111', fontFamily: '"DM Sans", sans-serif', fontSize: '0.82rem', fontWeight: 300, lineHeight: 1.6 }}>
                  {featured.fit}
                </p>
              </div>
            </div>

            <p
              style={{
                color: '#7C7C75',
                fontFamily: '"DM Sans", sans-serif',
                fontSize: '0.82rem',
                lineHeight: 1.75,
                fontWeight: 300,
                fontStyle: 'italic',
                marginBottom: '1.5rem',
              }}
            >
              "{featured.weight} heavyweight cotton developed for everyday permanence. The cut that started QUTB."
            </p>

            {/* Color selector */}
            <div className="flex items-center gap-2 mb-6">
              {featured.colors.map((c, i) => (
                <button
                  key={c.name}
                  onClick={() => setActiveColor(i)}
                  aria-label={c.name}
                  title={c.name}
                  style={{
                    width: '20px',
                    height: '20px',
                    borderRadius: '50%',
                    backgroundColor: c.hex,
                    border: activeColor === i ? '2px solid #111111' : c.border ? '1px solid rgba(17,17,17,0.25)' : '1px solid transparent',
                    outline: activeColor === i ? '1px solid #111111' : 'none',
                    outlineOffset: '2px',
                    cursor: 'pointer',
                    padding: 0,
                    transition: 'outline 0.15s',
                  }}
                />
              ))}
              <span
                style={{
                  color: '#7C7C75',
                  fontFamily: '"DM Sans", sans-serif',
                  fontSize: '0.68rem',
                  fontWeight: 300,
                  marginLeft: '4px',
                }}
              >
                {featured.colors[activeColor].name}
              </span>
            </div>

            <button
              onClick={() => navigate("product")}
              className="flex items-center gap-2 group hover:opacity-60 transition-opacity"
              style={{
                color: '#111111',
                fontFamily: '"DM Sans", sans-serif',
                fontSize: '0.7rem',
                letterSpacing: '0.18em',
                textTransform: 'uppercase',
                fontWeight: 400,
                textDecoration: 'none',
                background: 'none',
                border: 'none',
                borderBottom: '1px solid rgba(17,17,17,0.35)',
                paddingBottom: '3px',
                paddingLeft: 0,
                paddingRight: 0,
                paddingTop: 0,
                alignSelf: 'flex-start',
                cursor: 'pointer',
              }}
            >
              View Product
              <ArrowRight size={12} strokeWidth={1.5} className="transition-transform group-hover:translate-x-1" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Quick View Modal ──────────────────────────────────────────────────────────

function QuickViewModal({ product, onClose }: { product: typeof PRODUCTS[0]; onClose: () => void }) {
  const { addItem, openDrawer } = useCart();
  const [activeSize, setActiveSize] = useState<string | null>(null);
  const [activeColor, setActiveColor] = useState(0);
  const [added, setAdded] = useState(false);
  const [imgIdx, setImgIdx] = useState(0);
  const sizes = ["XS", "S", "M", "L", "XL"];
  const images = [product.front, product.hover];

  // Slow image crossfade
  useEffect(() => {
    const t = setInterval(() => setImgIdx((i) => (i + 1) % images.length), 3200);
    return () => clearInterval(t);
  }, [images.length]);

  // ESC to close
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  // Lock scroll
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  function handleAdd() {
    if (!activeSize) return;
    const color = product.colors[activeColor];
    addItem({
      id: `${product.code}-${color.name}-${activeSize}`,
      name: product.name,
      code: product.code,
      price: product.price,
      colorName: color.name,
      colorHex: color.hex,
      colorBorder: color.border,
      size: activeSize,
      image: product.front,
      stylingNote: `Best worn with structured trousers. ${product.fit}`,
    });
    setAdded(true);
    setTimeout(() => {
      onClose();
      openDrawer();
    }, 700);
  }

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 400 }}>
      {/* Backdrop */}
      <div onClick={onClose} style={{ position: "absolute", inset: 0, backgroundColor: "rgba(8,8,8,0.75)", backdropFilter: "blur(4px)", WebkitBackdropFilter: "blur(4px)" }} />

      {/* Modal */}
      <div
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          width: "min(900px, calc(100vw - 32px))",
          maxHeight: "90vh",
          backgroundColor: "#FAF8F4",
          display: "grid",
          gridTemplateColumns: "55% 45%",
          overflow: "hidden",
          animation: "qvSlideIn 0.35s ease",
        }}
      >
        {/* Image side */}
        <div style={{ position: "relative", overflow: "hidden", backgroundColor: "#EDE8DF", aspectRatio: "3/4", maxHeight: "90vh" }}>
          {images.map((src, i) => (
            <img
              key={i}
              src={src}
              alt={product.name}
              style={{
                position: "absolute",
                inset: 0,
                width: "100%",
                height: "100%",
                objectFit: "cover",
                opacity: imgIdx === i ? 1 : 0,
                transition: "opacity 1.2s ease",
              }}
            />
          ))}
          {/* Dot indicators */}
          <div style={{ position: "absolute", bottom: 16, left: 0, right: 0, display: "flex", justifyContent: "center", gap: 6 }}>
            {images.map((_, i) => (
              <button
                key={i}
                onClick={() => setImgIdx(i)}
                style={{ width: 5, height: 5, borderRadius: "50%", backgroundColor: imgIdx === i ? "#FAF8F4" : "rgba(250,248,244,0.35)", border: "none", cursor: "pointer", padding: 0, transition: "background-color 0.3s" }}
              />
            ))}
          </div>
        </div>

        {/* Data side */}
        <div style={{ padding: "clamp(28px, 4vw, 44px)", overflowY: "auto", display: "flex", flexDirection: "column", gap: 0 }}>
          {/* Close */}
          <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 20 }}>
            <button onClick={onClose} style={{ background: "none", border: "none", cursor: "pointer", color: "rgba(17,17,17,0.35)", padding: 0, transition: "color 0.2s" }}
              onMouseEnter={e => (e.currentTarget.style.color = "#111111")}
              onMouseLeave={e => (e.currentTarget.style.color = "rgba(17,17,17,0.35)")}>
              <X size={16} strokeWidth={1.5} />
            </button>
          </div>

          <p style={{ color: "rgba(17,17,17,0.35)", fontFamily: '"DM Sans", sans-serif', fontSize: "0.58rem", letterSpacing: "0.2em", textTransform: "uppercase", fontWeight: 300, marginBottom: 6 }}>
            {product.code}
          </p>
          <h2 style={{ color: "#111111", fontFamily: '"Bodoni Moda", serif', fontSize: "clamp(1.3rem, 2.5vw, 1.8rem)", fontWeight: 500, lineHeight: 1.15, letterSpacing: "-0.01em", marginBottom: 8 }}>
            {product.name}
          </h2>
          <p style={{ color: "#111111", fontFamily: '"DM Sans", sans-serif', fontSize: "0.95rem", fontWeight: 400, letterSpacing: "0.02em", marginBottom: 16 }}>
            {product.price}
          </p>
          <p style={{ color: "#7C7C75", fontFamily: '"DM Sans", sans-serif', fontSize: "0.8rem", lineHeight: 1.75, fontWeight: 300, marginBottom: 20 }}>
            {product.weight} heavyweight cotton. {product.fit}
          </p>

          <div style={{ borderTop: "1px solid rgba(17,17,17,0.1)", paddingTop: 18, marginBottom: 16 }}>
            <p style={{ color: "#7C7C75", fontFamily: '"DM Sans", sans-serif', fontSize: "0.6rem", letterSpacing: "0.2em", textTransform: "uppercase", fontWeight: 300, marginBottom: 10 }}>
              Color — <span style={{ color: "#111111", fontWeight: 400 }}>{product.colors[activeColor].name}</span>
            </p>
            <div style={{ display: "flex", gap: 8 }}>
              {product.colors.map((c, i) => (
                <button
                  key={c.name}
                  onClick={() => setActiveColor(i)}
                  aria-label={c.name}
                  style={{ width: 18, height: 18, borderRadius: "50%", backgroundColor: c.hex, border: activeColor === i ? "2px solid #111111" : c.border ? "1px solid rgba(17,17,17,0.25)" : "1px solid transparent", outline: activeColor === i ? "1px solid #111111" : "none", outlineOffset: "2px", cursor: "pointer", padding: 0, transition: "outline 0.15s" }}
                />
              ))}
            </div>
          </div>

          <div style={{ marginBottom: 20 }}>
            <p style={{ color: "#7C7C75", fontFamily: '"DM Sans", sans-serif', fontSize: "0.6rem", letterSpacing: "0.2em", textTransform: "uppercase", fontWeight: 300, marginBottom: 10 }}>
              Size{activeSize ? ` — ${activeSize}` : ""}
            </p>
            <div style={{ display: "flex", gap: 18 }}>
              {sizes.map((s) => (
                <button
                  key={s}
                  onClick={() => setActiveSize(activeSize === s ? null : s)}
                  style={{ background: "none", border: "none", borderBottom: activeSize === s ? "1px solid #111111" : "1px solid transparent", cursor: "pointer", padding: "2px 0 3px", color: activeSize === s ? "#111111" : "#7C7C75", fontFamily: '"DM Sans", sans-serif', fontSize: "0.72rem", fontWeight: activeSize === s ? 400 : 300, letterSpacing: "0.08em", transition: "color 0.15s, border-color 0.15s" }}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div style={{ borderTop: "1px solid rgba(17,17,17,0.1)", paddingTop: 18, display: "flex", flexDirection: "column", gap: 8, marginTop: "auto" }}>
            <button
              onClick={handleAdd}
              disabled={!activeSize}
              style={{ width: "100%", backgroundColor: activeSize ? "#111111" : "rgba(17,17,17,0.1)", color: activeSize ? "#FAF8F4" : "rgba(17,17,17,0.3)", fontFamily: '"DM Sans", sans-serif', fontSize: "0.68rem", letterSpacing: "0.2em", textTransform: "uppercase", fontWeight: 400, padding: "15px", border: "none", cursor: activeSize ? "pointer" : "not-allowed", transition: "background-color 0.2s, color 0.2s" }}
            >
              {added ? "ADDED" : !activeSize ? "SELECT A SIZE" : "ADD TO CART"}
            </button>
            <button
              onClick={() => { onClose(); navigate("product"); }}
              style={{ width: "100%", backgroundColor: "transparent", color: "#7C7C75", fontFamily: '"DM Sans", sans-serif', fontSize: "0.65rem", letterSpacing: "0.16em", textTransform: "uppercase", fontWeight: 300, padding: "12px", border: "1px solid rgba(17,17,17,0.12)", cursor: "pointer", transition: "border-color 0.2s, color 0.2s" }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = "rgba(17,17,17,0.3)"; e.currentTarget.style.color = "#111111"; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = "rgba(17,17,17,0.12)"; e.currentTarget.style.color = "#7C7C75"; }}
            >
              View Full Product
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes qvSlideIn {
          from { opacity: 0; transform: translate(-50%, calc(-50% + 20px)); }
          to { opacity: 1; transform: translate(-50%, -50%); }
        }
        @media (max-width: 640px) {
          .qv-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}

// ─── Section 04: Product Grid ─────────────────────────────────────────────────

function ProductCard({ product }: { product: typeof PRODUCTS[0] }) {
  const [hovered, setHovered] = useState(false);
  const [activeColor, setActiveColor] = useState(0);
  const [quickViewOpen, setQuickViewOpen] = useState(false);

  return (
    <article
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="flex flex-col"
    >
      {quickViewOpen && <QuickViewModal product={product} onClose={() => setQuickViewOpen(false)} />}
      {/* Image with slow fade hover */}
      <div
        className="relative overflow-hidden"
        style={{ backgroundColor: '#EDE8DF', aspectRatio: '3/4', marginBottom: '1.25rem', cursor: 'pointer' }}
        onClick={() => navigate("product")}
      >
        <img
          src={product.front}
          alt={product.name}
          className="absolute inset-0 w-full h-full object-cover"
          style={{
            transition: 'opacity 0.7s ease, transform 0.7s ease',
            opacity: hovered ? 0 : 1,
            transform: hovered ? 'scale(1.03)' : 'scale(1)',
          }}
        />
        <img
          src={product.hover}
          alt={`${product.name} — fabric detail`}
          className="absolute inset-0 w-full h-full object-cover"
          style={{
            transition: 'opacity 0.7s ease, transform 0.7s ease',
            opacity: hovered ? 1 : 0,
            transform: hovered ? 'scale(1)' : 'scale(1.03)',
          }}
        />
        {/* Quick View button */}
        <button
          onClick={(e) => { e.stopPropagation(); setQuickViewOpen(true); }}
          style={{
            position: 'absolute',
            bottom: 16,
            left: '50%',
            transform: hovered ? 'translateX(-50%) translateY(0)' : 'translateX(-50%) translateY(8px)',
            opacity: hovered ? 1 : 0,
            transition: 'opacity 0.3s ease, transform 0.3s ease',
            backgroundColor: 'rgba(8,8,8,0.82)',
            color: '#FAF8F4',
            fontFamily: '"DM Sans", sans-serif',
            fontSize: '0.62rem',
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            fontWeight: 400,
            padding: '10px 22px',
            border: 'none',
            cursor: 'pointer',
            whiteSpace: 'nowrap',
            backdropFilter: 'blur(4px)',
            WebkitBackdropFilter: 'blur(4px)',
          }}
        >
          Quick View
        </button>
      </div>

      {/* Info */}
      <p
        style={{
          color: 'rgba(17,17,17,0.35)',
          fontFamily: '"DM Sans", sans-serif',
          fontSize: '0.6rem',
          letterSpacing: '0.18em',
          textTransform: 'uppercase',
          marginBottom: '3px',
        }}
      >
        {product.code}
      </p>

      <div className="flex items-start justify-between gap-2 mb-1.5" style={{ cursor: 'pointer' }} onClick={() => navigate("product")}>
        <p
          style={{
            color: '#111111',
            fontFamily: '"Bodoni Moda", serif',
            fontSize: '1rem',
            fontWeight: 400,
            letterSpacing: '0.01em',
            lineHeight: 1.25,
          }}
        >
          {product.name}
        </p>
        <p
          style={{
            color: '#111111',
            fontFamily: '"DM Sans", sans-serif',
            fontSize: '0.82rem',
            fontWeight: 400,
            whiteSpace: 'nowrap',
          }}
        >
          {product.price}
        </p>
      </div>

      <p
        style={{
          color: '#7C7C75',
          fontFamily: '"DM Sans", sans-serif',
          fontSize: '0.72rem',
          letterSpacing: '0.04em',
          fontWeight: 300,
          marginBottom: '0.75rem',
        }}
      >
        {product.color} · {product.weight}
      </p>

      {/* Color dots */}
      <div className="flex items-center gap-1.5">
        {product.colors.map((c, i) => (
          <button
            key={c.name}
            onClick={(e) => { e.stopPropagation(); setActiveColor(i); }}
            aria-label={c.name}
            style={{
              width: '14px',
              height: '14px',
              borderRadius: '50%',
              backgroundColor: c.hex,
              border: activeColor === i ? '1.5px solid #111111' : c.border ? '1px solid rgba(17,17,17,0.22)' : '1px solid transparent',
              outline: activeColor === i ? '1px solid #111111' : 'none',
              outlineOffset: '1.5px',
              cursor: 'pointer',
              padding: 0,
              transition: 'outline 0.15s',
            }}
          />
        ))}
      </div>
    </article>
  );
}

interface ProductGridProps {
  filter: Category;
}

function ProductGrid({ filter }: ProductGridProps) {
  const filtered = filter === "all" ? PRODUCTS : PRODUCTS.filter((p) => p.category === filter);

  if (filtered.length === 0) {
    return (
      <div
        className="bg-[#FAF8F4] flex items-center justify-center"
        style={{ padding: '80px clamp(24px, 6vw, 80px)', minHeight: '320px' }}
      >
        <p style={{ color: '#7C7C75', fontFamily: '"DM Sans", sans-serif', fontSize: '0.82rem', fontWeight: 300 }}>
          No styles in this category yet.
        </p>
      </div>
    );
  }

  return (
    <section
      className="bg-[#FAF8F4]"
      style={{ padding: '0 clamp(24px, 6vw, 80px) clamp(80px, 10vw, 130px)' }}
    >
      <div className="max-w-[1400px] mx-auto">
        {/* Divider with count */}
        <div
          className="flex items-center justify-between py-5 mb-10"
          style={{ borderTop: '1px solid rgba(17,17,17,0.1)', borderBottom: '1px solid rgba(17,17,17,0.08)' }}
        >
          <p style={{ color: '#7C7C75', fontFamily: '"DM Sans", sans-serif', fontSize: '0.65rem', letterSpacing: '0.18em', textTransform: 'uppercase', fontWeight: 300 }}>
            The Uniform
          </p>
          <p style={{ color: 'rgba(17,17,17,0.35)', fontFamily: '"DM Sans", sans-serif', fontSize: '0.65rem', fontWeight: 300 }}>
            {filtered.length} {filtered.length === 1 ? 'style' : 'styles'}
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-14 md:gap-x-8 md:gap-y-20 lg:gap-x-10 lg:gap-y-24">
          {filtered.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Section 05: Fabric Break ─────────────────────────────────────────────────

function FabricBreak() {
  const { ref, visible } = useInView(0.1);
  return (
    <section
      ref={ref}
      style={{
        backgroundColor: '#111111',
        padding: 'clamp(64px, 9vw, 120px) clamp(24px, 6vw, 80px)',
      }}
    >
      <div className="max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center">
        {/* Text */}
        <div
          className="lg:col-span-6"
          style={{
            opacity: visible ? 1 : 0,
            transform: visible ? 'translateY(0)' : 'translateY(24px)',
            transition: 'opacity 1s ease, transform 1s ease',
          }}
        >
          <p
            style={{
              color: 'rgba(250,248,244,0.35)',
              fontFamily: '"DM Sans", sans-serif',
              fontSize: '0.62rem',
              letterSpacing: '0.28em',
              textTransform: 'uppercase',
              fontWeight: 300,
              marginBottom: '2rem',
            }}
          >
            The Material Standard
          </p>
          <p
            style={{
              color: '#FAF8F4',
              fontFamily: '"Bodoni Moda", serif',
              fontSize: 'clamp(2.4rem, 5vw, 4rem)',
              fontWeight: 500,
              lineHeight: 1.05,
              letterSpacing: '-0.01em',
              marginBottom: '2rem',
            }}
          >
            Fabric Before Fashion.
          </p>
          <p
            style={{
              color: 'rgba(250,248,244,0.55)',
              fontFamily: '"DM Sans", sans-serif',
              fontSize: '0.88rem',
              lineHeight: 1.85,
              fontWeight: 300,
              maxWidth: '420px',
            }}
          >
            Every QUTB piece begins with the fabric. We specify the GSM, the weave structure, the
            yarn count, and the finish before we design a single seam. The garment follows the
            material — never the other way around.
          </p>
        </div>

        {/* Image */}
        <div
          className="lg:col-span-5 lg:col-start-8 relative overflow-hidden"
          style={{
            backgroundColor: '#1D2635',
            aspectRatio: '4/3',
            opacity: visible ? 1 : 0,
            transition: 'opacity 1.2s ease 0.2s',
          }}
        >
          <img
            src="https://images.unsplash.com/photo-1606343131474-abc41dc6bb7d?w=800&h=600&fit=crop&auto=format"
            alt="Close-up macro of Egyptian cotton fabric texture"
            className="w-full h-full object-cover"
            style={{ opacity: 0.75 }}
          />
        </div>
      </div>
    </section>
  );
}

// ─── Section 06: Fit System ───────────────────────────────────────────────────

const RegularSVG = () => (
  <svg viewBox="0 0 100 130" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <path
      d="M 32 52 L 8 38 L 2 52 L 20 62 L 20 112 L 80 112 L 80 62 L 98 52 L 92 38 L 68 52 C 62 44 38 44 32 52 Z"
      stroke="#111111"
      strokeWidth="1.2"
      strokeLinejoin="round"
      strokeLinecap="round"
    />
  </svg>
);

const BoxSVG = () => (
  <svg viewBox="0 0 100 130" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <path
      d="M 28 60 L 0 44 L 0 60 L 18 70 L 18 114 L 82 114 L 82 70 L 100 60 L 100 44 L 72 60 C 66 48 34 48 28 60 Z"
      stroke="#111111"
      strokeWidth="1.2"
      strokeLinejoin="round"
      strokeLinecap="round"
    />
  </svg>
);

const RingerSVG = () => (
  <svg viewBox="0 0 100 130" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
    <path
      d="M 32 52 L 8 38 L 2 52 L 20 62 L 20 112 L 80 112 L 80 62 L 98 52 L 92 38 L 68 52 C 62 44 38 44 32 52 Z"
      stroke="#111111"
      strokeWidth="1.2"
      strokeLinejoin="round"
      strokeLinecap="round"
    />
    {/* Collar band */}
    <path
      d="M 32 52 C 38 44 62 44 68 52 L 65 56 C 59 50 41 50 35 56 Z"
      stroke="#111111"
      strokeWidth="1"
      fill="rgba(17,17,17,0.08)"
      strokeLinejoin="round"
    />
    {/* Left cuff */}
    <line x1="3" y1="51" x2="10" y2="48" stroke="#111111" strokeWidth="1" />
    {/* Right cuff */}
    <line x1="97" y1="51" x2="90" y2="48" stroke="#111111" strokeWidth="1" />
  </svg>
);

const fits = [
  {
    key: "regular",
    label: "Regular",
    subtitle: "Corniche · Sidi Gaber",
    weight: "180 GSM",
    philosophy:
      "A clean straight cut with a natural shoulder seam. Sits as a shirt should — not oversized, not restrictive. The base layer of a permanent wardrobe.",
    styling: "Wear untucked alone or layered under an open shirt. The versatile anchor piece.",
    Svg: RegularSVG,
  },
  {
    key: "box",
    label: "Box",
    subtitle: "Stanley · Ramleh · Bahary",
    weight: "220–260 GSM",
    philosophy:
      "Dropped shoulder seam. Straight body. Maximum ease through the torso. A deliberate oversized proportions designed with the weight to hold shape wash after wash.",
    styling: "Pairs with wide-leg trousers or shorts. Works tucked or untucked depending on occasion.",
    Svg: BoxSVG,
  },
  {
    key: "ringer",
    label: "Ringer",
    subtitle: "Montaza",
    weight: "200 GSM",
    philosophy:
      "The same clean cut as the regular, with contrast rib trim at the collar and cuff sleeve openings. The detail is subtle — a reference to workwear that never becomes a costume.",
    styling: "Layer under a jacket or wear alone. The collar band adds structure without formality.",
    Svg: RingerSVG,
  },
];

function FitSystem() {
  const { ref, visible } = useInView(0.1);
  return (
    <section
      ref={ref}
      className="bg-[#F5F0E8]"
      style={{ padding: 'clamp(80px, 10vw, 130px) clamp(24px, 6vw, 80px)' }}
    >
      <div className="max-w-[1400px] mx-auto">
        <div className="mb-16 md:mb-20">
          <p
            style={{
              color: '#7C7C75',
              fontFamily: '"DM Sans", sans-serif',
              fontSize: '0.65rem',
              letterSpacing: '0.28em',
              textTransform: 'uppercase',
              fontWeight: 300,
              marginBottom: '1rem',
              opacity: visible ? 1 : 0,
              transition: 'opacity 0.8s ease',
            }}
          >
            Fit Guide
          </p>
          <h2
            style={{
              color: '#111111',
              fontFamily: '"Bodoni Moda", serif',
              fontSize: 'clamp(2rem, 4vw, 3rem)',
              fontWeight: 500,
              lineHeight: 1.1,
              letterSpacing: '-0.01em',
              opacity: visible ? 1 : 0,
              transform: visible ? 'translateY(0)' : 'translateY(12px)',
              transition: 'opacity 0.9s ease 0.1s, transform 0.9s ease 0.1s',
            }}
          >
            The Fit System
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8 lg:gap-14">
          {fits.map((fit, i) => (
            <div
              key={fit.key}
              style={{
                opacity: visible ? 1 : 0,
                transform: visible ? 'translateY(0)' : 'translateY(24px)',
                transition: `opacity 0.9s ease ${0.1 + i * 0.15}s, transform 0.9s ease ${0.1 + i * 0.15}s`,
              }}
            >
              {/* Silhouette */}
              <div
                className="flex items-center justify-center mb-8"
                style={{ height: '160px' }}
              >
                <div style={{ width: '80px' }}>
                  <fit.Svg />
                </div>
              </div>

              {/* Divider */}
              <div style={{ borderTop: '1px solid rgba(17,17,17,0.12)', marginBottom: '1.5rem' }} />

              <p
                style={{
                  color: '#7C7C75',
                  fontFamily: '"DM Sans", sans-serif',
                  fontSize: '0.6rem',
                  letterSpacing: '0.2em',
                  textTransform: 'uppercase',
                  fontWeight: 300,
                  marginBottom: '4px',
                }}
              >
                {fit.subtitle}
              </p>

              <h3
                style={{
                  color: '#111111',
                  fontFamily: '"Bodoni Moda", serif',
                  fontSize: '1.5rem',
                  fontWeight: 500,
                  letterSpacing: '-0.01em',
                  marginBottom: '0.25rem',
                }}
              >
                {fit.label}
              </h3>

              <p
                style={{
                  color: '#7C7C75',
                  fontFamily: '"DM Sans", sans-serif',
                  fontSize: '0.68rem',
                  letterSpacing: '0.1em',
                  fontWeight: 300,
                  marginBottom: '1.25rem',
                }}
              >
                {fit.weight}
              </p>

              <p
                style={{
                  color: '#7C7C75',
                  fontFamily: '"DM Sans", sans-serif',
                  fontSize: '0.82rem',
                  lineHeight: 1.75,
                  fontWeight: 300,
                  marginBottom: '1rem',
                }}
              >
                {fit.philosophy}
              </p>

              <p
                style={{
                  color: 'rgba(17,17,17,0.45)',
                  fontFamily: '"DM Sans", sans-serif',
                  fontSize: '0.75rem',
                  lineHeight: 1.65,
                  fontWeight: 300,
                  fontStyle: 'italic',
                  paddingTop: '0.75rem',
                  borderTop: '1px solid rgba(17,17,17,0.08)',
                }}
              >
                {fit.styling}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Section 07: Footnote ─────────────────────────────────────────────────────

function CollectionFootnote() {
  const { ref, visible } = useInView(0.2);
  return (
    <section
      ref={ref}
      className="bg-[#FAF8F4] flex flex-col items-center justify-center text-center"
      style={{ padding: 'clamp(80px, 14vw, 160px) clamp(24px, 6vw, 80px)' }}
    >
      {['Fabric first.', 'Logo second.', 'Always.'].map((line, i) => (
        <span
          key={line}
          style={{
            display: 'block',
            color: '#111111',
            fontFamily: '"Bodoni Moda", serif',
            fontSize: 'clamp(2rem, 5.5vw, 5rem)',
            fontWeight: 500,
            lineHeight: 1.05,
            letterSpacing: '-0.01em',
            opacity: visible ? 1 : 0,
            transform: visible ? 'translateY(0)' : 'translateY(20px)',
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

export function CollectionPage() {
  const [filter, setFilter] = useState<Category>("all");

  return (
    <div style={{ backgroundColor: '#FAF8F4', fontFamily: '"DM Sans", sans-serif', overflowX: 'hidden' }}>
      <CollectionIntro />
      <FilterBar active={filter} onFilter={setFilter} />
      <FeaturedProduct />
      <ProductGrid filter={filter} />
      <FabricBreak />
      <FitSystem />
      <CollectionFootnote />
      <QutbFooter />
    </div>
  );
}
