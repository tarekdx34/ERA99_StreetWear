import { useState, useEffect } from "react";
import { Instagram } from "lucide-react";

export function EarlyAccessPage() {
  const [email, setEmail]     = useState("");
  const [focused, setFocused] = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone]       = useState(false);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 80);
    return () => clearTimeout(t);
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return;
    setLoading(true);
    await new Promise(r => setTimeout(r, 1500));
    setLoading(false);
    setDone(true);
  }

  const fd = (d = 0): React.CSSProperties => ({
    opacity: visible ? 1 : 0,
    transform: visible ? "translateY(0)" : "translateY(14px)",
    transition: `opacity 1s ease ${d}s, transform 1s ease ${d}s`,
  });

  return (
    <div style={{
      minHeight: "100svh",
      backgroundColor: "#1A2332",
      fontFamily: '"DM Sans", sans-serif',
      display: "flex",
      flexDirection: "column",
    }}>
      {/* Top banner */}
      <div style={{ borderBottom: "1px solid rgba(250,248,244,0.1)", padding: "10px 0", textAlign: "center" }}>
        <p style={{
          fontFamily: '"DM Sans", sans-serif', fontWeight: 300,
          fontSize: "0.62rem", letterSpacing: "0.22em",
          textTransform: "uppercase", color: "rgba(250,248,244,0.4)",
          margin: 0,
        }}>
          QUTB.STUDIO — Development Build
        </p>
      </div>

      {/* Main content */}
      <div style={{
        flex: 1,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "clamp(48px,8vw,80px) clamp(24px,6vw,48px)",
      }}>
        <div style={{ width: "100%", maxWidth: 480 }}>

          {/* Wordmark */}
          <div style={{ textAlign: "center", marginBottom: "clamp(36px,6vw,52px)", ...fd(0) }}>
            <div style={{ display: "flex", alignItems: "baseline", justifyContent: "center" }}>
              <span style={{
                fontFamily: '"Gwendolyn", cursive', fontWeight: 700,
                fontSize: "clamp(4.5rem,12vw,5.5rem)", color: "#FAF8F4", lineHeight: 1,
              }}>Q</span>
              <span style={{
                fontFamily: '"Cormorant Garamond", serif', fontWeight: 400,
                fontSize: "clamp(2.9rem,7.8vw,3.58rem)", color: "#FAF8F4",
                letterSpacing: "0.06em",
              }}>UTB</span>
            </div>
            <p style={{
              fontFamily: '"DM Sans", sans-serif', fontWeight: 300,
              fontSize: "0.68rem", letterSpacing: "0.22em",
              textTransform: "uppercase", color: "rgba(250,248,244,0.45)",
              margin: "10px 0 0",
            }}>
              Alexandria, Egypt
            </p>
          </div>

          {/* Rule */}
          <div style={{ height: 1, backgroundColor: "rgba(250,248,244,0.12)", marginBottom: "clamp(32px,5vw,44px)", ...fd(0.1) }} />

          {/* Heading + body */}
          <div style={{ marginBottom: "clamp(28px,4.5vw,40px)", ...fd(0.18) }}>
            <h1 style={{
              fontFamily: '"Bodoni Moda", serif', fontStyle: "italic",
              fontWeight: 400, fontSize: "clamp(1.2rem,3vw,1.5rem)",
              color: "#FAF8F4", margin: "0 0 clamp(14px,2.5vw,20px)",
              letterSpacing: "0.01em",
            }}>
              Something is being built.
            </h1>
            <p style={{
              fontFamily: '"DM Sans", sans-serif', fontWeight: 300,
              fontSize: "0.9rem", color: "rgba(250,248,244,0.5)",
              lineHeight: 1.85, margin: 0,
            }}>
              Drop 001 is coming. Egyptian Giza cotton, boxy fit, made in Alexandria.<br />
              Be the first to know.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} noValidate style={{ ...fd(0.26) }}>
            <input
              type="email"
              value={email}
              placeholder="Your email address"
              disabled={done}
              onChange={e => setEmail(e.target.value)}
              onFocus={() => setFocused(true)}
              onBlur={() => setFocused(false)}
              style={{
                width: "100%",
                boxSizing: "border-box",
                backgroundColor: "rgba(250,248,244,0.07)",
                border: `1px solid ${focused ? "rgba(250,248,244,0.6)" : "rgba(250,248,244,0.15)"}`,
                borderRadius: 0,
                padding: "14px 16px",
                fontFamily: '"DM Sans", sans-serif',
                fontWeight: 300,
                fontSize: "0.9rem",
                color: "#FAF8F4",
                outline: "none",
                letterSpacing: "0.02em",
                marginBottom: 10,
                transition: "border-color 0.2s",
                opacity: done ? 0.45 : 1,
              }}
            />

            <button
              type="submit"
              disabled={loading || done}
              style={{
                width: "100%",
                height: 52,
                backgroundColor: done ? "rgba(250,248,244,0.15)" : "#FAF8F4",
                color: done ? "rgba(250,248,244,0.7)" : "#111111",
                border: "none",
                borderRadius: 0,
                fontFamily: '"DM Sans", sans-serif',
                fontWeight: 400,
                fontSize: "0.78rem",
                letterSpacing: "0.16em",
                textTransform: "uppercase",
                cursor: loading || done ? "default" : "pointer",
                opacity: loading ? 0.7 : 1,
                transition: "opacity 0.25s, background-color 0.4s, color 0.4s",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                marginBottom: 14,
              }}
              onMouseEnter={e => { if (!loading && !done) (e.currentTarget as HTMLElement).style.opacity = "0.82"; }}
              onMouseLeave={e => { if (!loading && !done) (e.currentTarget as HTMLElement).style.opacity = "1"; }}
            >
              {loading ? (
                <span style={{ letterSpacing: "0.3em", fontSize: "1.1rem" }}>···</span>
              ) : done ? (
                <>
                  <span style={{ fontSize: "0.85rem" }}>✓</span>
                  <span>You're on the list.</span>
                </>
              ) : (
                "Request Early Access"
              )}
            </button>

            <p style={{
              textAlign: "center",
              fontFamily: '"DM Sans", sans-serif', fontWeight: 300,
              fontSize: "0.68rem", color: "rgba(250,248,244,0.35)",
              letterSpacing: "0.04em", margin: 0,
            }}>
              No spam. First drop notification only.
            </p>
          </form>

          {/* Bottom rule */}
          <div style={{ height: 1, backgroundColor: "rgba(250,248,244,0.1)", margin: "clamp(32px,5vw,48px) 0 clamp(20px,3vw,28px)", ...fd(0.35) }} />

          {/* Footer row */}
          <div style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            ...fd(0.4),
          }}>
            <p style={{ fontFamily: '"DM Sans", sans-serif', fontWeight: 300, fontSize: "0.68rem", color: "rgba(250,248,244,0.35)", margin: 0, letterSpacing: "0.06em" }}>
              © QUTB 2025
            </p>
            <a
              href="https://instagram.com/qutbstudio"
              target="_blank" rel="noopener noreferrer"
              style={{
                display: "flex", alignItems: "center", gap: 6,
                fontFamily: '"DM Sans", sans-serif', fontWeight: 300,
                fontSize: "0.68rem", color: "rgba(250,248,244,0.35)",
                letterSpacing: "0.06em", textDecoration: "none",
                transition: "color 0.2s",
              }}
              onMouseEnter={e => (e.currentTarget.style.color = "rgba(250,248,244,0.8)")}
              onMouseLeave={e => (e.currentTarget.style.color = "rgba(250,248,244,0.35)")}
            >
              <Instagram size={12} strokeWidth={1.5} />
              @qutbstudio
            </a>
            <p style={{ fontFamily: '"DM Sans", sans-serif', fontWeight: 300, fontSize: "0.68rem", color: "rgba(250,248,244,0.35)", margin: 0, letterSpacing: "0.06em" }}>
              Cairo · Alexandria
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
