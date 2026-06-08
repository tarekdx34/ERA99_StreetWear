import { useState } from "react";
import { ArrowRight } from "lucide-react";

const products = [
  {
    id: 1,
    name: "Stanley Box Tee",
    code: "QT-001",
    price: "EGP 890",
    description: "Boxy silhouette. Dropped shoulders. Egyptian Giza 30/1 cotton.",
    image: "https://images.unsplash.com/photo-1581655353564-df123a1eb820?w=600&h=780&fit=crop&auto=format",
    colors: [
      { name: "Salt White", hex: "#FAF8F4", border: true },
      { name: "Charcoal", hex: "#111111" },
      { name: "Stone", hex: "#7C7C75" },
      { name: "Sand", hex: "#C9B99A" },
    ],
    tag: "The Original",
  },
  {
    id: 2,
    name: "Montaza Ringer",
    code: "QT-002",
    price: "EGP 950",
    description: "Contrast trim at collar and cuffs. Regular fit. Two-ply rib.",
    image: "https://images.unsplash.com/photo-1722310752951-4d459d28c678?w=600&h=780&fit=crop&auto=format",
    colors: [
      { name: "Salt White / Navy", hex: "#FAF8F4", border: true },
      { name: "Bone / Charcoal", hex: "#F5F0E8", border: true },
      { name: "Sage", hex: "#8A9E85" },
    ],
    tag: "New Season",
  },
  {
    id: 3,
    name: "Corniche Regular Tee",
    code: "QT-003",
    price: "EGP 820",
    description: "Straight fit. Clean silhouette. The everyday essential.",
    image: "https://images.unsplash.com/photo-1651761179569-4ba2aa054997?w=600&h=780&fit=crop&auto=format",
    colors: [
      { name: "Salt White", hex: "#FAF8F4", border: true },
      { name: "Charcoal", hex: "#111111" },
      { name: "Navy", hex: "#1D2635" },
    ],
    tag: "Everyday",
  },
];

function ProductCard({ product, featured }: { product: typeof products[0]; featured?: boolean }) {
  const [activeColor, setActiveColor] = useState(0);
  const [hovered, setHovered] = useState(false);

  return (
    <div
      className="flex flex-col"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Image */}
      <div
        className="relative overflow-hidden"
        style={{
          backgroundColor: '#F5F0E8',
          aspectRatio: featured ? '3/4' : '3/4',
        }}
      >
        <img
          src={product.image}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-700"
          style={{ transform: hovered ? 'scale(1.03)' : 'scale(1)' }}
        />
        {/* Tag */}
        <div
          className="absolute top-4 left-4"
          style={{
            backgroundColor: 'rgba(17,17,17,0.85)',
            padding: '4px 10px',
          }}
        >
          <span
            style={{
              color: '#FAF8F4',
              fontFamily: '"DM Sans", sans-serif',
              fontSize: '0.6rem',
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              fontWeight: 400,
            }}
          >
            {product.tag}
          </span>
        </div>
        {/* Quick view overlay */}
        <div
          className="absolute inset-x-0 bottom-0 flex items-center justify-center transition-all duration-300"
          style={{
            backgroundColor: 'rgba(17,17,17,0.85)',
            height: '48px',
            opacity: hovered ? 1 : 0,
            transform: hovered ? 'translateY(0)' : 'translateY(8px)',
          }}
        >
          <span
            style={{
              color: '#FAF8F4',
              fontFamily: '"DM Sans", sans-serif',
              fontSize: '0.68rem',
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              fontWeight: 400,
            }}
          >
            Quick View
          </span>
        </div>
      </div>

      {/* Info */}
      <div className="pt-4 flex flex-col gap-2">
        <div className="flex items-start justify-between gap-2">
          <div>
            <p
              style={{
                color: 'rgba(17,17,17,0.4)',
                fontFamily: '"DM Sans", sans-serif',
                fontSize: '0.6rem',
                letterSpacing: '0.18em',
                textTransform: 'uppercase',
                marginBottom: '2px',
              }}
            >
              {product.code}
            </p>
            <p
              style={{
                color: '#111111',
                fontFamily: '"Bodoni Moda", serif',
                fontSize: '1.05rem',
                fontWeight: 400,
                letterSpacing: '0.01em',
              }}
            >
              {product.name}
            </p>
          </div>
          <p
            style={{
              color: '#111111',
              fontFamily: '"DM Sans", sans-serif',
              fontSize: '0.85rem',
              fontWeight: 400,
              letterSpacing: '0.04em',
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
            fontSize: '0.78rem',
            lineHeight: 1.65,
            fontWeight: 300,
          }}
        >
          {product.description}
        </p>

        {/* Color selector */}
        <div className="flex items-center gap-2 mt-1">
          {product.colors.map((color, i) => (
            <button
              key={color.name}
              onClick={() => setActiveColor(i)}
              aria-label={color.name}
              className="rounded-full transition-all duration-200"
              style={{
                width: '18px',
                height: '18px',
                backgroundColor: color.hex,
                border: activeColor === i
                  ? '2px solid #111111'
                  : color.border
                    ? '1px solid rgba(17,17,17,0.25)'
                    : '1px solid transparent',
                outline: activeColor === i ? '1px solid #111111' : 'none',
                outlineOffset: '2px',
              }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

interface UniformCollectionProps {
  onViewAll?: () => void;
}

export function UniformCollection({ onViewAll }: UniformCollectionProps) {
  return (
    <section id="uniform" className="bg-[#FAF8F4]" style={{ padding: 'clamp(80px, 10vw, 140px) clamp(24px, 6vw, 80px)' }}>
      <div className="max-w-[1400px] mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-16 md:mb-20">
          <div>
            <p
              style={{
                color: '#7C7C75',
                fontFamily: '"DM Sans", sans-serif',
                fontSize: '0.65rem',
                letterSpacing: '0.28em',
                textTransform: 'uppercase',
                fontWeight: 300,
                marginBottom: '1rem',
              }}
            >
              Permanent Collection
            </p>
            <h2
              style={{
                color: '#111111',
                fontFamily: '"Bodoni Moda", serif',
                fontSize: 'clamp(2rem, 5vw, 3.5rem)',
                fontWeight: 500,
                lineHeight: 1.1,
                letterSpacing: '-0.01em',
              }}
            >
              The Uniform
            </h2>
          </div>

          <button
            onClick={onViewAll}
            className="flex items-center gap-2 group self-start md:self-auto hover:opacity-60 transition-opacity"
            style={{
              color: '#111111',
              fontFamily: '"DM Sans", sans-serif',
              fontSize: '0.72rem',
              letterSpacing: '0.15em',
              textTransform: 'uppercase',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: 0,
            }}
          >
            <span>View All</span>
            <ArrowRight size={14} strokeWidth={1.5} className="transition-transform group-hover:translate-x-1" />
          </button>
        </div>

        {/* Philosophy line */}
        <div
          className="border-t border-b py-4 mb-16 md:mb-20"
          style={{ borderColor: 'rgba(17,17,17,0.1)' }}
        >
          <p
            style={{
              color: '#7C7C75',
              fontFamily: '"DM Sans", sans-serif',
              fontSize: '0.72rem',
              letterSpacing: '0.14em',
              fontWeight: 300,
              textAlign: 'center',
              textTransform: 'uppercase',
            }}
          >
            Not seasonal. Not limited. Only the colors evolve.
          </p>
        </div>

        {/* Products grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-10 lg:gap-14">
          {products.map((product, i) => (
            <ProductCard key={product.id} product={product} featured={i === 1} />
          ))}
        </div>
      </div>
    </section>
  );
}
