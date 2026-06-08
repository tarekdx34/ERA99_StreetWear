import { useEffect, useRef, useState } from "react";
import { QutbFooter } from "./QutbFooter";

function useInView(threshold = 0.15) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(([e]) => { if (e.isIntersecting) setVisible(true); }, { threshold });
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return { ref, visible };
}

function FadeIn({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const { ref, visible } = useInView();
  return (
    <div ref={ref} style={{ opacity: visible ? 1 : 0, transform: visible ? "none" : "translateY(24px)", transition: `opacity 1s ease ${delay}s, transform 1s ease ${delay}s` }}>
      {children}
    </div>
  );
}

const IMG = (id: string, w = 1200, h = 800) =>
  `https://images.unsplash.com/${id}?w=${w}&h=${h}&fit=crop&auto=format&q=80`;

export function ContactPage() {
  const [sent, setSent] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSent(true);
  }

  return (
    <div style={{ backgroundColor: "#FAF8F4", fontFamily: '"DM Sans", sans-serif', overflowX: "hidden", minHeight: "100vh" }}>

      {/* Hero — split layout */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", minHeight: "100vh" }}>
        {/* Image side */}
        <div style={{ position: "relative", overflow: "hidden" }}>
          <img
            src={IMG("photo-1496181133206-80ce9b88a853", 900, 1400)}
            alt="Alexandria"
            style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center" }}
          />
          <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.2)" }} />
          <div style={{ position: "absolute", bottom: "clamp(40px, 6vw, 80px)", left: "clamp(32px, 5vw, 60px)" }}>
            <p style={{ color: "rgba(250,248,244,0.6)", fontFamily: '"Bodoni Moda", serif', fontSize: "clamp(0.9rem, 1.5vw, 1.2rem)", fontStyle: "italic", fontWeight: 400 }}>
              Alexandria, Egypt
            </p>
          </div>
        </div>

        {/* Content side */}
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", padding: "clamp(80px, 8vw, 120px) clamp(32px, 5vw, 80px)", paddingTop: "clamp(120px, 12vw, 160px)" }}>
          <FadeIn>
            <p style={{ color: "#7C7C75", fontSize: "0.62rem", letterSpacing: "0.24em", textTransform: "uppercase", fontWeight: 300, marginBottom: 24 }}>
              Company
            </p>
            <h1 style={{ color: "#111111", fontFamily: '"Bodoni Moda", serif', fontSize: "clamp(3rem, 7vw, 6rem)", fontWeight: 400, letterSpacing: "0.04em", lineHeight: 0.9, margin: "0 0 40px" }}>
              CONTACT
            </h1>
            <p style={{ color: "#7C7C75", fontSize: "0.85rem", lineHeight: 1.85, fontWeight: 300, maxWidth: 380, marginBottom: 48 }}>
              We are a small team. We read everything. We respond when there is something to say.
            </p>
          </FadeIn>

          {/* Direct contact */}
          <FadeIn delay={0.15}>
            <div style={{ marginBottom: 48 }}>
              <div style={{ borderTop: "1px solid rgba(17,17,17,0.1)", paddingTop: 20, marginBottom: 20 }}>
                <p style={{ color: "#7C7C75", fontSize: "0.62rem", letterSpacing: "0.2em", textTransform: "uppercase", fontWeight: 300, marginBottom: 6 }}>Email</p>
                <a href="mailto:hello@qutb.co" style={{ color: "#111111", fontSize: "0.88rem", fontWeight: 300, textDecoration: "none", letterSpacing: "0.02em", transition: "opacity 0.2s" }} className="hover:opacity-60">
                  hello@qutb.co
                </a>
              </div>
              <div style={{ borderTop: "1px solid rgba(17,17,17,0.1)", paddingTop: 20, marginBottom: 20 }}>
                <p style={{ color: "#7C7C75", fontSize: "0.62rem", letterSpacing: "0.2em", textTransform: "uppercase", fontWeight: 300, marginBottom: 6 }}>Wholesale</p>
                <a href="mailto:trade@qutb.co" style={{ color: "#111111", fontSize: "0.88rem", fontWeight: 300, textDecoration: "none", letterSpacing: "0.02em", transition: "opacity 0.2s" }} className="hover:opacity-60">
                  trade@qutb.co
                </a>
              </div>
              <div style={{ borderTop: "1px solid rgba(17,17,17,0.1)", paddingTop: 20 }}>
                <p style={{ color: "#7C7C75", fontSize: "0.62rem", letterSpacing: "0.2em", textTransform: "uppercase", fontWeight: 300, marginBottom: 10 }}>Social</p>
                <div style={{ display: "flex", gap: 24 }}>
                  {["Instagram", "Pinterest"].map((s) => (
                    <a key={s} href="#" style={{ color: "#111111", fontSize: "0.75rem", letterSpacing: "0.1em", textTransform: "uppercase", fontWeight: 300, textDecoration: "none", transition: "opacity 0.2s" }} className="hover:opacity-50">
                      {s}
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </FadeIn>
        </div>
      </div>

      {/* Form section */}
      <div style={{ backgroundColor: "#F5F0E8", padding: "clamp(80px, 12vw, 160px) clamp(24px, 8vw, 120px)" }}>
        <div style={{ maxWidth: 640, margin: "0 auto" }}>
          <FadeIn>
            <h2 style={{ color: "#111111", fontFamily: '"Bodoni Moda", serif', fontSize: "clamp(1.8rem, 3.5vw, 3rem)", fontWeight: 400, letterSpacing: "0.03em", lineHeight: 1.1, marginBottom: 48, textAlign: "center" }}>
              Send a message.
            </h2>
          </FadeIn>

          {sent ? (
            <FadeIn>
              <div style={{ textAlign: "center", padding: "60px 0" }}>
                <p style={{ color: "#111111", fontFamily: '"Bodoni Moda", serif', fontSize: "1.5rem", fontStyle: "italic", marginBottom: 16 }}>Received.</p>
                <p style={{ color: "#7C7C75", fontSize: "0.82rem", lineHeight: 1.75, fontWeight: 300 }}>We will be in touch when there is something worth saying.</p>
              </div>
            </FadeIn>
          ) : (
            <FadeIn delay={0.1}>
              <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 32 }}>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  <label htmlFor="name" style={{ color: "#111111", fontSize: "0.68rem", letterSpacing: "0.18em", textTransform: "uppercase", fontWeight: 400 }}>
                    Name
                  </label>
                  <input
                    id="name"
                    type="text"
                    placeholder="Your name"
                    required
                    style={{ backgroundColor: "transparent", border: "none", borderBottom: "1px solid rgba(17,17,17,0.2)", padding: "10px 0", color: "#111111", fontFamily: '"DM Sans", sans-serif', fontSize: "0.88rem", fontWeight: 300, outline: "none", transition: "border-color 0.2s" }}
                    onFocus={(e) => (e.target.style.borderBottomColor = "#111111")}
                    onBlur={(e) => (e.target.style.borderBottomColor = "rgba(17,17,17,0.2)")}
                  />
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  <label htmlFor="email" style={{ color: "#111111", fontSize: "0.68rem", letterSpacing: "0.18em", textTransform: "uppercase", fontWeight: 400 }}>
                    Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    placeholder="your@email.com"
                    required
                    style={{ backgroundColor: "transparent", border: "none", borderBottom: "1px solid rgba(17,17,17,0.2)", padding: "10px 0", color: "#111111", fontFamily: '"DM Sans", sans-serif', fontSize: "0.88rem", fontWeight: 300, outline: "none", transition: "border-color 0.2s" }}
                    onFocus={(e) => (e.target.style.borderBottomColor = "#111111")}
                    onBlur={(e) => (e.target.style.borderBottomColor = "rgba(17,17,17,0.2)")}
                  />
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  <label htmlFor="message" style={{ color: "#111111", fontSize: "0.68rem", letterSpacing: "0.18em", textTransform: "uppercase", fontWeight: 400 }}>
                    Message
                  </label>
                  <textarea
                    id="message"
                    rows={6}
                    placeholder="What would you like to tell us?"
                    required
                    style={{ backgroundColor: "transparent", border: "1px solid rgba(17,17,17,0.15)", padding: "14px 16px", color: "#111111", fontFamily: '"DM Sans", sans-serif', fontSize: "0.85rem", fontWeight: 300, outline: "none", resize: "vertical", lineHeight: 1.75, transition: "border-color 0.2s" }}
                    onFocus={(e) => (e.target.style.borderColor = "#111111")}
                    onBlur={(e) => (e.target.style.borderColor = "rgba(17,17,17,0.15)")}
                  />
                </div>
                <div>
                  <button
                    type="submit"
                    style={{ backgroundColor: "#111111", color: "#FAF8F4", border: "none", padding: "16px 48px", fontFamily: '"DM Sans", sans-serif', fontSize: "0.7rem", letterSpacing: "0.2em", textTransform: "uppercase", cursor: "pointer", fontWeight: 400, transition: "opacity 0.2s" }}
                    className="hover:opacity-70"
                  >
                    Send
                  </button>
                </div>
              </form>
            </FadeIn>
          )}
        </div>
      </div>

      {/* Closing */}
      <div style={{ padding: "clamp(80px, 10vw, 140px) clamp(24px, 8vw, 120px)", textAlign: "center" }}>
        <FadeIn>
          <p style={{ color: "#111111", fontFamily: '"Bodoni Moda", serif', fontSize: "clamp(1rem, 2vw, 1.6rem)", fontWeight: 400, fontStyle: "italic", letterSpacing: "0.01em", lineHeight: 1.65 }}>
            We respond when it is necessary.
          </p>
        </FadeIn>
      </div>

      <style>{`
        @media (max-width: 768px) {
          .contact-split { grid-template-columns: 1fr !important; }
        }
      `}</style>
      <QutbFooter />
    </div>
  );
}
