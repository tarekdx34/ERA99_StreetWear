import { useEffect, useRef, useState } from "react";

export function AlexandriaStory() {
  const ref = useRef<HTMLElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold: 0.1 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <section
      id="alexandria"
      ref={ref}
      className="bg-[#FAF8F4]"
      style={{ padding: 'clamp(80px, 10vw, 140px) clamp(24px, 6vw, 80px)' }}
    >
      <div className="max-w-[1400px] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-start">
          {/* Images — left, 5 cols */}
          <div
            className="lg:col-span-5 relative"
            style={{
              opacity: visible ? 1 : 0,
              transform: visible ? 'translateY(0)' : 'translateY(24px)',
              transition: 'opacity 1s ease, transform 1s ease',
            }}
          >
            {/* Primary image */}
            <div
              className="relative overflow-hidden"
              style={{ backgroundColor: '#EDE8DF', aspectRatio: '4/5' }}
            >
              <img
                src="https://images.unsplash.com/photo-1718846526824-f7f30a177d3a?w=700&h=875&fit=crop&auto=format"
                alt="Alexandria waterfront with concrete sea barriers and fishing pier"
                className="w-full h-full object-cover"
              />
              <div
                className="absolute bottom-0 left-0 right-0"
                style={{
                  background: 'linear-gradient(to top, rgba(17,17,17,0.4) 0%, transparent 60%)',
                  padding: '24px',
                }}
              >
                <p
                  style={{
                    color: 'rgba(250,248,244,0.9)',
                    fontFamily: '"DM Sans", sans-serif',
                    fontSize: '0.65rem',
                    letterSpacing: '0.22em',
                    textTransform: 'uppercase',
                    fontWeight: 300,
                  }}
                >
                  Alexandria — الإسكندرية
                </p>
              </div>
            </div>

            {/* Secondary image — offset */}
            <div
              className="absolute overflow-hidden hidden lg:block"
              style={{
                backgroundColor: '#EDE8DF',
                width: '55%',
                aspectRatio: '3/4',
                bottom: '-60px',
                right: '-40px',
                border: '6px solid #FAF8F4',
              }}
            >
              <img
                src="https://images.unsplash.com/photo-1607718330023-64d147bac374?w=420&h=560&fit=crop&auto=format"
                alt="People working in a textile factory"
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* Text — right, 6 cols offset by 1 */}
          <div
            className="lg:col-span-6 lg:col-start-7 lg:pt-16"
            style={{
              opacity: visible ? 1 : 0,
              transform: visible ? 'translateY(0)' : 'translateY(24px)',
              transition: 'opacity 1s ease 0.25s, transform 1s ease 0.25s',
            }}
          >
            <p
              style={{
                color: '#7C7C75',
                fontFamily: '"DM Sans", sans-serif',
                fontSize: '0.65rem',
                letterSpacing: '0.28em',
                textTransform: 'uppercase',
                fontWeight: 300,
                marginBottom: '1.5rem',
              }}
            >
              Alexandria is not a location. It is a character.
            </p>

            <h2
              style={{
                color: '#111111',
                fontFamily: '"Bodoni Moda", serif',
                fontSize: 'clamp(2rem, 4.5vw, 3.2rem)',
                fontWeight: 500,
                lineHeight: 1.1,
                letterSpacing: '-0.01em',
                marginBottom: '2rem',
              }}
            >
              Built on a City's<br />Industrial Memory
            </h2>

            <div
              className="flex flex-col gap-5"
              style={{
                color: '#7C7C75',
                fontFamily: '"DM Sans", sans-serif',
                fontSize: '0.9rem',
                lineHeight: 1.85,
                fontWeight: 300,
                maxWidth: '480px',
              }}
            >
              <p>
                QUTB was founded by a new generation that grew up inside the Egyptian garment industry —
                through a father with decades of manufacturing experience, through the workshops and
                cutting rooms of Alexandria.
              </p>
              <p>
                We did not start a brand to become a fashion label. We started to make the shirt we
                always wanted — with the fabric we had access to, using knowledge passed across a table.
              </p>
              <p>
                Alexandria is salt air, concrete sea barriers, and cotton. It is old textile factories
                and the smell of new fabric. It is the city that made us, and the city we make for.
              </p>
            </div>

            <div
              className="mt-10 pt-8 border-t flex flex-col gap-5"
              style={{ borderColor: 'rgba(17,17,17,0.1)' }}
            >
              {[
                { figure: "30+", label: "Years of manufacturing knowledge" },
                { figure: "100%", label: "Egyptian Giza cotton" },
              ].map(({ figure, label }) => (
                <div key={label} className="flex items-baseline gap-4">
                  <span
                    style={{
                      color: '#111111',
                      fontFamily: '"Bodoni Moda", serif',
                      fontSize: '2rem',
                      fontWeight: 400,
                      letterSpacing: '-0.02em',
                      lineHeight: 1,
                    }}
                  >
                    {figure}
                  </span>
                  <span
                    style={{
                      color: '#7C7C75',
                      fontFamily: '"DM Sans", sans-serif',
                      fontSize: '0.78rem',
                      fontWeight: 300,
                      letterSpacing: '0.06em',
                    }}
                  >
                    {label}
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
