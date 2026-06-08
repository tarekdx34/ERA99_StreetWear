import { useEffect, useRef, useState } from "react";

const steps = [
  {
    num: "01",
    title: "Cotton",
    subtitle: "Giza, Egypt",
    desc: "Egyptian Giza cotton grows in the Nile Delta. Long staple fibres. Rare. The softest raw material on earth. We trace it from the field.",
    image: "https://images.unsplash.com/photo-1761069183877-fe29a212e5eb?w=720&h=480&fit=crop&auto=format",
    imgAlt: "Cotton field at sunrise with bolls ready for harvest",
  },
  {
    num: "02",
    title: "Knitting",
    subtitle: "Delta Region",
    desc: "The fibre is spun and knitted into jersey. We specify the exact GSM, loop density, and hand feel. Nothing is left to chance.",
    image: "https://images.unsplash.com/photo-1606343131474-abc41dc6bb7d?w=720&h=480&fit=crop&auto=format",
    imgAlt: "Close-up of knitted fabric texture",
  },
  {
    num: "03",
    title: "Dyeing",
    subtitle: "Alexandria",
    desc: "Reactive dyeing in controlled baths. Colour consistency across every piece. Wash after wash, the tone holds.",
    image: "https://images.unsplash.com/photo-1632844384543-bb1b2c3900d7?w=720&h=480&fit=crop&auto=format",
    imgAlt: "Fabric close-up showing refined grey textile",
  },
  {
    num: "04",
    title: "Cutting & Sewing",
    subtitle: "Our Workshop",
    desc: "Cut by experienced hands. Sewn with reinforced seams. Each garment passes through a quality check before it leaves.",
    image: "https://images.unsplash.com/photo-1741176506261-73218298e4d8?w=720&h=480&fit=crop&auto=format",
    imgAlt: "Textile workers sorting fabric in a factory",
  },
  {
    num: "05",
    title: "Your Wardrobe",
    subtitle: "Wherever You Are",
    desc: "From Alexandria to your hands. Built to outlast trends. Worn until it becomes yours.",
    image: "https://images.unsplash.com/photo-1779828077473-ba0af3ea068a?w=720&h=480&fit=crop&auto=format",
    imgAlt: "Mediterranean coastline, calm blue water meeting stone",
  },
];

function StepCard({ step, index }: { step: typeof steps[0]; index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => { if (entry.isIntersecting) setVisible(true); },
      { threshold: 0.15 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  const isEven = index % 2 === 0;

  return (
    <div
      ref={ref}
      className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-16 items-center"
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0)' : 'translateY(32px)',
        transition: 'opacity 0.9s ease, transform 0.9s ease',
      }}
    >
      {/* Image — alternates sides on desktop */}
      <div
        className={`${isEven ? 'md:order-1' : 'md:order-2'} relative overflow-hidden`}
        style={{ backgroundColor: '#E8E2D8', aspectRatio: '4/3' }}
      >
        <img
          src={step.image}
          alt={step.imgAlt}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Text */}
      <div className={isEven ? 'md:order-2' : 'md:order-1'}>
        <div className="flex items-center gap-4 mb-6">
          <span
            style={{
              color: 'rgba(17,17,17,0.12)',
              fontFamily: '"Bodoni Moda", serif',
              fontSize: 'clamp(3rem, 6vw, 4.5rem)',
              fontWeight: 500,
              lineHeight: 1,
              letterSpacing: '-0.02em',
            }}
          >
            {step.num}
          </span>
          <div
            style={{
              width: '40px',
              height: '1px',
              backgroundColor: 'rgba(17,17,17,0.15)',
            }}
          />
        </div>

        <p
          style={{
            color: '#7C7C75',
            fontFamily: '"DM Sans", sans-serif',
            fontSize: '0.62rem',
            letterSpacing: '0.22em',
            textTransform: 'uppercase',
            fontWeight: 300,
            marginBottom: '0.75rem',
          }}
        >
          {step.subtitle}
        </p>

        <h3
          style={{
            color: '#111111',
            fontFamily: '"Bodoni Moda", serif',
            fontSize: 'clamp(1.8rem, 4vw, 2.8rem)',
            fontWeight: 500,
            lineHeight: 1.1,
            letterSpacing: '-0.01em',
            marginBottom: '1.25rem',
          }}
        >
          {step.title}
        </h3>

        <p
          style={{
            color: '#7C7C75',
            fontFamily: '"DM Sans", sans-serif',
            fontSize: '0.9rem',
            lineHeight: 1.8,
            fontWeight: 300,
            maxWidth: '400px',
          }}
        >
          {step.desc}
        </p>
      </div>
    </div>
  );
}

export function CottonJourney() {
  return (
    <section
      id="journey"
      style={{
        backgroundColor: '#F5F0E8',
        padding: 'clamp(80px, 10vw, 140px) clamp(24px, 6vw, 80px)',
      }}
    >
      <div className="max-w-[1280px] mx-auto">
        {/* Header */}
        <div className="mb-20 md:mb-28">
          <p
            style={{
              color: '#7C7C75',
              fontFamily: '"DM Sans", sans-serif',
              fontSize: '0.65rem',
              letterSpacing: '0.3em',
              textTransform: 'uppercase',
              fontWeight: 300,
              marginBottom: '1.25rem',
            }}
          >
            From Field to Form
          </p>
          <h2
            style={{
              color: '#111111',
              fontFamily: '"Bodoni Moda", serif',
              fontSize: 'clamp(2rem, 5vw, 3.5rem)',
              fontWeight: 500,
              lineHeight: 1.1,
              letterSpacing: '-0.01em',
              maxWidth: '520px',
            }}
          >
            The Cotton Journey
          </h2>
        </div>

        {/* Steps */}
        <div className="flex flex-col gap-20 md:gap-28">
          {steps.map((step, i) => (
            <StepCard key={step.num} step={step} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
