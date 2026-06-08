import { useState, useRef, useEffect } from "react";
import { navigate } from "../nav";

export function SignInPage() {
  const [email, setEmail]         = useState("");
  const [password, setPassword]   = useState("");
  const [emailFocus, setEmailFocus]       = useState(false);
  const [passwordFocus, setPasswordFocus] = useState(false);
  const [emailError, setEmailError]   = useState("");
  const [loading, setLoading]     = useState(false);
  const [visible, setVisible]     = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 60);
    return () => clearTimeout(t);
  }, []);

  function validateEmail(val: string) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validateEmail(email)) {
      setEmailError("Enter a valid email address.");
      return;
    }
    setEmailError("");
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1600));
    setLoading(false);
  }

  const fd = (d = 0): React.CSSProperties => ({
    opacity: visible ? 1 : 0,
    transform: visible ? "translateY(0)" : "translateY(16px)",
    transition: `opacity 0.9s ease ${d}s, transform 0.9s ease ${d}s`,
  });

  const inputStyle = (focused: boolean, hasError = false): React.CSSProperties => ({
    width: "100%",
    boxSizing: "border-box",
    backgroundColor: "#F5F0E8",
    border: `1px solid ${hasError ? "#8B3A3A" : focused ? "#111111" : "rgba(17,17,17,0.12)"}`,
    borderRadius: 0,
    padding: "14px 16px",
    fontFamily: '"DM Sans", sans-serif',
    fontWeight: 300,
    fontSize: "0.9rem",
    color: "#111111",
    outline: "none",
    letterSpacing: "0.02em",
    transition: "border-color 0.2s",
  });

  return (
    <div
      style={{
        minHeight: "100svh",
        backgroundColor: "#FAF8F4",
        fontFamily: '"DM Sans", sans-serif',
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "clamp(48px,8vw,80px) clamp(20px,5vw,40px)",
      }}
    >
      {/* ── Main card ── */}
      <div style={{ flex: 1, display: "flex", alignItems: "center", width: "100%", justifyContent: "center" }}>
        <div style={{ width: "100%", maxWidth: 420 }}>

          {/* Wordmark */}
          <div style={{ textAlign: "center", marginBottom: "clamp(40px,7vw,56px)", ...fd(0) }}>
            <button
              onClick={() => navigate("home")}
              style={{ background: "none", border: "none", cursor: "pointer", padding: 0, display: "inline-block" }}
              aria-label="QUTB Home"
            >
              <div style={{ display: "flex", alignItems: "baseline", justifyContent: "center", gap: 0 }}>
                <span style={{
                  fontFamily: '"Gwendolyn", cursive', fontWeight: 700,
                  fontSize: "2.8rem", color: "#111111", lineHeight: 1,
                }}>Q</span>
                <span style={{
                  fontFamily: '"Cormorant Garamond", serif', fontWeight: 400,
                  fontSize: "1.82rem", color: "#111111", letterSpacing: "0.06em",
                }}>UTB</span>
              </div>
              <p style={{
                fontFamily: '"DM Sans", sans-serif', fontWeight: 300,
                fontSize: "0.62rem", letterSpacing: "0.22em",
                textTransform: "uppercase", color: "#7C7C75",
                margin: "6px 0 0",
              }}>
                Alexandria
              </p>
            </button>
          </div>

          {/* Heading */}
          <div style={{ marginBottom: "clamp(28px,5vw,40px)", ...fd(0.12) }}>
            <h1 style={{
              fontFamily: '"Bodoni Moda", serif', fontStyle: "italic",
              fontWeight: 400, fontSize: "1.75rem",
              color: "#111111", margin: 0, letterSpacing: "0.01em",
            }}>
              Sign In
            </h1>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} noValidate style={{ ...fd(0.2) }}>

            {/* Email */}
            <div style={{ marginBottom: emailError ? 6 : 14 }}>
              <input
                type="email"
                value={email}
                placeholder="Email address"
                autoComplete="email"
                onChange={(e) => { setEmail(e.target.value); if (emailError) setEmailError(""); }}
                onFocus={() => setEmailFocus(true)}
                onBlur={() => setEmailFocus(false)}
                style={inputStyle(emailFocus, !!emailError)}
              />
              {emailError && (
                <p style={{
                  fontFamily: '"DM Sans", sans-serif', fontWeight: 300,
                  fontSize: "0.72rem", color: "#8B3A3A",
                  margin: "5px 0 0", letterSpacing: "0.02em",
                }}>
                  {emailError}
                </p>
              )}
            </div>

            {/* Password */}
            <div style={{ marginBottom: 8 }}>
              <input
                type="password"
                value={password}
                placeholder="Password"
                autoComplete="current-password"
                onChange={(e) => setPassword(e.target.value)}
                onFocus={() => setPasswordFocus(true)}
                onBlur={() => setPasswordFocus(false)}
                style={inputStyle(passwordFocus)}
              />
            </div>

            {/* Forgot */}
            <div style={{ textAlign: "right", marginBottom: "clamp(24px,4vw,32px)" }}>
              <button
                type="button"
                style={{
                  background: "none", border: "none", cursor: "pointer",
                  fontFamily: '"DM Sans", sans-serif', fontWeight: 300,
                  fontSize: "0.75rem", color: "#7C7C75",
                  padding: 0, letterSpacing: "0.02em",
                  textDecoration: "none",
                  transition: "color 0.2s",
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLElement).style.textDecoration = "underline";
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLElement).style.textDecoration = "none";
                }}
              >
                Forgot password?
              </button>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              style={{
                width: "100%",
                height: 52,
                backgroundColor: "#111111",
                color: "#FAF8F4",
                border: "none",
                borderRadius: 0,
                fontFamily: '"DM Sans", sans-serif',
                fontWeight: 400,
                fontSize: "0.8rem",
                letterSpacing: "0.16em",
                textTransform: "uppercase",
                cursor: loading ? "default" : "pointer",
                opacity: loading ? 0.55 : 1,
                transition: "opacity 0.25s",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
              onMouseEnter={e => { if (!loading) (e.currentTarget as HTMLElement).style.opacity = "0.75"; }}
              onMouseLeave={e => { if (!loading) (e.currentTarget as HTMLElement).style.opacity = "1"; }}
            >
              {loading ? (
                <span style={{ letterSpacing: "0.3em", fontSize: "1.1rem" }}>···</span>
              ) : (
                "Sign In"
              )}
            </button>

            {/* Divider */}
            <div style={{
              display: "flex", alignItems: "center",
              margin: "clamp(20px,3.5vw,28px) 0",
              gap: 14,
            }}>
              <div style={{ flex: 1, height: 1, backgroundColor: "rgba(17,17,17,0.1)" }} />
              <span style={{
                fontFamily: '"DM Sans", sans-serif', fontWeight: 300,
                fontSize: "0.75rem", color: "#7C7C75",
                letterSpacing: "0.06em",
              }}>
                or
              </span>
              <div style={{ flex: 1, height: 1, backgroundColor: "rgba(17,17,17,0.1)" }} />
            </div>

            {/* Register link */}
            <p style={{
              textAlign: "center",
              fontFamily: '"DM Sans", sans-serif', fontWeight: 300,
              fontSize: "0.8rem", color: "#7C7C75",
              letterSpacing: "0.02em",
              margin: 0,
            }}>
              New to QUTB?{" "}
              <button
                type="button"
                onClick={() => navigate("register")}
                style={{
                  background: "none", border: "none", cursor: "pointer",
                  fontFamily: '"DM Sans", sans-serif', fontWeight: 400,
                  fontSize: "0.8rem", color: "#111111",
                  padding: 0, letterSpacing: "0.02em",
                  textDecoration: "underline",
                  textUnderlineOffset: "3px",
                }}
              >
                Register
              </button>
            </p>
          </form>
        </div>
      </div>

      {/* Instagram footer */}
      <div style={{ textAlign: "center", paddingTop: 32, ...fd(0.4) }}>
        <a
          href="https://instagram.com/qutbstudio"
          target="_blank"
          rel="noopener noreferrer"
          style={{
            fontFamily: '"DM Sans", sans-serif', fontWeight: 300,
            fontSize: "0.68rem", color: "#7C7C75",
            letterSpacing: "0.1em", textDecoration: "none",
            transition: "color 0.2s",
          }}
          onMouseEnter={e => (e.currentTarget.style.color = "#111111")}
          onMouseLeave={e => (e.currentTarget.style.color = "#7C7C75")}
        >
          @qutbstudio
        </a>
      </div>
    </div>
  );
}
