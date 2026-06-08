import { useEffect, useRef, useState } from "react";

const quotes = [
  "Made by people who grew up around fabric.",
  "From Alexandria. Built to stay.",
  "Fabric first. Always.",
];

export function PackagingStory() {
  const ref = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);
  const [activeQuote, setActiveQuote] = useState(0);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold: 0.2 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!visible) return;
    const interval = setInterval(() => {
      setActiveQuote((prev) => (prev + 1) % quotes.length);
    }, 3200);
    return () => clearInterval(interval);
  }, [visible]);

  return (
    <section
      ref={ref}
      style={{
        backgroundColor: '#111111',
        padding: 'clamp(80px, 10vw, 140px) clamp(24px, 6vw, 80px)',
      }}
    >
      <div className="max-w-[1400px] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-8 items-center">
          {/* Left: image */}
          <div
            className="lg:col-span-5 relative overflow-hidden"
            style={{
              backgroundColor: '#1D2635',
              aspectRatio: '3/4',
              opacity: visible ? 1 : 0,
              transition: 'opacity 1s ease 0.2s',
            }}
          >
            <img
              src="https://images.unsplash.com/photo-1612654516785-0e1a96be21d1?w=700&h=933&fit=crop&auto=format"
              alt="White cotton fabric folded on wooden surface"
              className="w-full h-full object-cover"
              style={{ opacity: 0.7 }}
            />
            {/* Packaging overlay text */}
            <div
              className="absolute inset-0 flex flex-col items-center justify-end"
              style={{ padding: '40px 32px' }}
            >
              <div
                style={{
                  border: '1px solid rgba(250,248,244,0.25)',
                  padding: '20px 28px',
                  width: '100%',
                  maxWidth: '280px',
                  textAlign: 'center',
                }}
              >
                <p
                  style={{
                    color: 'rgba(250,248,244,0.4)',
                    fontFamily: '"DM Sans", sans-serif',
                    fontSize: '0.55rem',
                    letterSpacing: '0.3em',
                    textTransform: 'uppercase',
                    marginBottom: '8px',
                  }}
                >
                  Alexandria, Egypt
                </p>
                <p
                  style={{
                    color: '#FAF8F4',
                    fontFamily: '"Bodoni Moda", serif',
                    fontSize: '1.6rem',
                    letterSpacing: '0.15em',
                    fontWeight: 500,
                  }}
                >
                  QUTB
                </p>
                <div
                  style={{
                    width: '30px',
                    height: '1px',
                    backgroundColor: 'rgba(250,248,244,0.3)',
                    margin: '10px auto',
                  }}
                />
                <p
                  style={{
                    color: 'rgba(250,248,244,0.45)',
                    fontFamily: '"DM Sans", sans-serif',
                    fontSize: '0.58rem',
                    letterSpacing: '0.18em',
                    fontWeight: 300,
                    textTransform: 'uppercase',
                  }}
                >
                  100% Egyptian Cotton
                </p>
              </div>
            </div>
          </div>

          {/* Right: text */}
          <div
            className="lg:col-span-6 lg:col-start-7 flex flex-col"
            style={{
              opacity: visible ? 1 : 0,
              transform: visible ? 'translateY(0)' : 'translateY(24px)',
              transition: 'opacity 1s ease 0.35s, transform 1s ease 0.35s',
            }}
          >
            <p
              style={{
                color: 'rgba(250,248,244,0.35)',
                fontFamily: '"DM Sans", sans-serif',
                fontSize: '0.65rem',
                letterSpacing: '0.28em',
                textTransform: 'uppercase',
                fontWeight: 300,
                marginBottom: '2.5rem',
              }}
            >
              Packaging Philosophy
            </p>

            {/* Animated quote */}
            <div style={{ minHeight: '120px', marginBottom: '2.5rem' }}>
              {quotes.map((quote, i) => (
                <p
                  key={quote}
                  style={{
                    color: '#FAF8F4',
                    fontFamily: '"Bodoni Moda", serif',
                    fontSize: 'clamp(1.6rem, 3.5vw, 2.4rem)',
                    fontWeight: 400,
                    lineHeight: 1.3,
                    letterSpacing: '-0.01em',
                    position: i === 0 ? 'relative' : 'absolute',
                    opacity: activeQuote === i ? 1 : 0,
                    transform: activeQuote === i ? 'translateY(0)' : 'translateY(12px)',
                    transition: 'opacity 0.7s ease, transform 0.7s ease',
                    pointerEvents: activeQuote === i ? 'auto' : 'none',
                  }}
                >
                  "{quote}"
                </p>
              ))}
            </div>

            <p
              style={{
                color: 'rgba(250,248,244,0.5)',
                fontFamily: '"DM Sans", sans-serif',
                fontSize: '0.88rem',
                lineHeight: 1.8,
                fontWeight: 300,
                maxWidth: '440px',
                marginBottom: '3rem',
              }}
            >
              Every piece ships in packaging designed to feel like an arrival — not a transaction.
              Tissue paper. A handwritten slip. A label worth keeping. The box is the first thing
              you touch. We thought about that.
            </p>

            {/* Quote dots */}
            <div className="flex items-center gap-2.5 mb-12">
              {quotes.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActiveQuote(i)}
                  aria-label={`Quote ${i + 1}`}
                  style={{
                    width: activeQuote === i ? '24px' : '6px',
                    height: '2px',
                    backgroundColor: activeQuote === i ? '#FAF8F4' : 'rgba(250,248,244,0.25)',
                    border: 'none',
                    padding: 0,
                    cursor: 'pointer',
                    transition: 'width 0.3s ease, background-color 0.3s ease',
                  }}
                />
              ))}
            </div>

            {/* Detail list */}
            <div
              className="flex flex-col gap-0 border-t"
              style={{ borderColor: 'rgba(250,248,244,0.1)' }}
            >
              {[
                "Unbleached cotton tissue",
                "Recycled kraft card box",
                "Soy-based ink printing",
                "No single-use plastic",
              ].map((item) => (
                <div
                  key={item}
                  className="flex items-center gap-4 py-4 border-b"
                  style={{ borderColor: 'rgba(250,248,244,0.08)' }}
                >
                  <span
                    style={{
                      width: '4px',
                      height: '4px',
                      borderRadius: '50%',
                      backgroundColor: 'rgba(250,248,244,0.35)',
                      flexShrink: 0,
                    }}
                  />
                  <span
                    style={{
                      color: 'rgba(250,248,244,0.6)',
                      fontFamily: '"DM Sans", sans-serif',
                      fontSize: '0.82rem',
                      fontWeight: 300,
                      letterSpacing: '0.04em',
                    }}
                  >
                    {item}
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
