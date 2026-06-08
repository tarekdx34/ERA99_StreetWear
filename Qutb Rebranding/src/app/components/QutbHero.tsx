import { ChevronDown } from "lucide-react";

interface QutbHeroProps {
  onShopClick?: () => void;
}

export function QutbHero({ onShopClick }: QutbHeroProps) {
  return (
    <section
      className="relative w-full overflow-hidden"
      style={{ height: '100svh', minHeight: '600px', backgroundColor: '#1D2635' }}
    >
      {/* Background image */}
      <img
        src="https://images.unsplash.com/photo-1761503347697-ade0eb2fc097?w=1920&h=1200&fit=crop&auto=format"
        alt="Clear turquoise Mediterranean water with rocky shoreline"
        className="absolute inset-0 w-full h-full object-cover"
        style={{ objectPosition: 'center 60%' }}
      />

      {/* Gradient overlays */}
      <div
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(to bottom, rgba(17,17,17,0.35) 0%, rgba(17,17,17,0.1) 40%, rgba(17,17,17,0.65) 100%)',
        }}
      />

      {/* Content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center px-6 text-center">
        <p
          style={{
            color: 'rgba(250,248,244,0.7)',
            fontFamily: '"DM Sans", sans-serif',
            fontSize: '0.68rem',
            letterSpacing: '0.28em',
            textTransform: 'uppercase',
            marginBottom: '2rem',
            fontWeight: 300,
          }}
        >
          Alexandria, Egypt
        </p>

        <h1
          style={{
            color: '#FAF8F4',
            fontSize: 'clamp(5rem, 16vw, 11rem)',
            letterSpacing: '0.18em',
            fontWeight: 400,
            lineHeight: 1,
            marginBottom: '2rem',
            display: 'flex',
            alignItems: 'baseline',
          }}
        >
          <span style={{ fontFamily: '"Gwendolyn", cursive', fontWeight: 700 }}>Q</span>
          <span style={{ fontFamily: '"Cormorant Garamond", serif', fontWeight: 400, fontSize: '0.65em' }}>UTB</span>
        </h1>

        <p
          style={{
            color: 'rgba(250,248,244,0.85)',
            fontFamily: '"DM Sans", sans-serif',
            fontSize: 'clamp(0.8rem, 2vw, 1rem)',
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            fontWeight: 300,
            maxWidth: '380px',
            lineHeight: 1.8,
            marginBottom: '3rem',
          }}
        >
          Modern Mediterranean Essentials.<br />Born from the sea. Built to last.
        </p>

        <button
          onClick={onShopClick}
          style={{
            display: 'inline-block',
            color: '#FAF8F4',
            fontFamily: '"DM Sans", sans-serif',
            fontSize: '0.72rem',
            letterSpacing: '0.2em',
            textTransform: 'uppercase',
            fontWeight: 400,
            borderBottom: '1px solid rgba(250,248,244,0.6)',
            paddingBottom: '3px',
            background: 'none',
            borderTop: 'none',
            borderLeft: 'none',
            borderRight: 'none',
            cursor: 'pointer',
            transition: 'opacity 0.2s',
          }}
          className="hover:opacity-70"
        >
          Shop The Uniform
        </button>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1">
        <ChevronDown
          size={16}
          strokeWidth={1.5}
          style={{ color: 'rgba(250,248,244,0.5)', animation: 'bounce 2s infinite' }}
        />
      </div>

      <style>{`
        @keyframes bounce {
          0%, 100% { transform: translateY(0); opacity: 0.5; }
          50% { transform: translateY(5px); opacity: 0.9; }
        }
      `}</style>
    </section>
  );
}
