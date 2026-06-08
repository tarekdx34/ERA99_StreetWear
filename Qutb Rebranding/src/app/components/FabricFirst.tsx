import { useEffect, useRef, useState } from "react";

export function FabricFirst() {
  const ref = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold: 0.2 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={ref}
      className="w-full flex flex-col items-center justify-center px-6 md:px-16"
      style={{
        backgroundColor: '#111111',
        padding: 'clamp(80px, 12vw, 160px) clamp(24px, 8vw, 120px)',
      }}
    >
      <p
        style={{
          color: 'rgba(250,248,244,0.4)',
          fontFamily: '"DM Sans", sans-serif',
          fontSize: '0.65rem',
          letterSpacing: '0.3em',
          textTransform: 'uppercase',
          fontWeight: 300,
          marginBottom: '4rem',
          opacity: visible ? 1 : 0,
          transform: visible ? 'translateY(0)' : 'translateY(12px)',
          transition: 'opacity 0.8s ease, transform 0.8s ease',
        }}
      >
        The Philosophy
      </p>

      <div className="text-center max-w-[1200px] mx-auto">
        {['FABRIC FIRST.', 'LOGO SECOND.', 'ALWAYS.'].map((line, i) => (
          <div
            key={line}
            style={{
              color: '#FAF8F4',
              fontFamily: '"Bodoni Moda", serif',
              fontSize: 'clamp(2.8rem, 8vw, 7.5rem)',
              fontWeight: 500,
              lineHeight: 1.05,
              letterSpacing: '-0.01em',
              opacity: visible ? 1 : 0,
              transform: visible ? 'translateY(0)' : 'translateY(24px)',
              transition: `opacity 0.9s ease ${i * 0.18}s, transform 0.9s ease ${i * 0.18}s`,
              display: 'block',
            }}
          >
            {line}
          </div>
        ))}
      </div>

      <div
        className="mt-16 md:mt-24 flex flex-col md:flex-row gap-12 md:gap-24 max-w-[800px] mx-auto"
        style={{
          opacity: visible ? 1 : 0,
          transform: visible ? 'translateY(0)' : 'translateY(16px)',
          transition: 'opacity 1s ease 0.6s, transform 1s ease 0.6s',
        }}
      >
        {[
          { label: 'Fabric', desc: 'Egyptian Giza cotton. Chosen for hand, weight, and longevity.' },
          { label: 'Fit', desc: 'Proportions developed over months of wear testing in Alexandria.' },
          { label: 'Construction', desc: 'Every stitch reflects decades of garment industry knowledge.' },
        ].map(({ label, desc }) => (
          <div key={label} className="flex-1">
            <p
              style={{
                color: 'rgba(250,248,244,0.35)',
                fontFamily: '"DM Sans", sans-serif',
                fontSize: '0.62rem',
                letterSpacing: '0.22em',
                textTransform: 'uppercase',
                marginBottom: '0.75rem',
              }}
            >
              {label}
            </p>
            <p
              style={{
                color: 'rgba(250,248,244,0.65)',
                fontFamily: '"DM Sans", sans-serif',
                fontSize: '0.85rem',
                lineHeight: 1.75,
                fontWeight: 300,
              }}
            >
              {desc}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
