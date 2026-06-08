import { useState, useEffect } from "react";
import { Eye, EyeOff, Check } from "lucide-react";
import { navigate } from "../nav";

function passwordStrength(pw: string): number {
  if (!pw) return 0;
  let score = 0;
  if (pw.length >= 6) score++;
  if (pw.length >= 10) score++;
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) score++;
  if (/[0-9]/.test(pw) || /[^A-Za-z0-9]/.test(pw)) score++;
  return Math.min(score, 4);
}

const STRENGTH_OPACITY = [0, 0.22, 0.42, 0.65, 0.9];
const STRENGTH_WIDTH   = [0, 25, 50, 75, 100];

export function RegisterPage() {
  const [first, setFirst]           = useState("");
  const [last, setLast]             = useState("");
  const [email, setEmail]           = useState("");
  const [password, setPassword]     = useState("");
  const [confirm, setConfirm]       = useState("");
  const [agreed, setAgreed]         = useState(false);
  const [showPw, setShowPw]         = useState(false);
  const [loading, setLoading]       = useState(false);
  const [visible, setVisible]       = useState(false);
  const [errors, setErrors]         = useState<Record<string, string>>({});

  const [focus, setFocus] = useState<Record<string, boolean>>({});
  const setF = (k: string, v: boolean) => setFocus(f => ({ ...f, [k]: v }));

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 60);
    return () => clearTimeout(t);
  }, []);

  const strength = passwordStrength(password);
  const confirmMatch = confirm.length > 0 && confirm === password;

  function validate() {
    const e: Record<string, string> = {};
    if (!first.trim()) e.first = "Required";
    if (!last.trim()) e.last = "Required";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) e.email = "Enter a valid email address.";
    if (password.length < 6) e.password = "Minimum 6 characters.";
    if (confirm !== password) e.confirm = "Passwords do not match.";
    if (!agreed) e.agreed = "You must agree to continue.";
    return e;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setErrors({});
    setLoading(true);
    await new Promise(r => setTimeout(r, 1600));
    setLoading(false);
  }

  const fd = (d = 0): React.CSSProperties => ({
    opacity: visible ? 1 : 0,
    transform: visible ? "translateY(0)" : "translateY(16px)",
    transition: `opacity 0.9s ease ${d}s, transform 0.9s ease ${d}s`,
  });

  const inp = (key: string, hasErr = false): React.CSSProperties => ({
    width: "100%",
    boxSizing: "border-box" as const,
    backgroundColor: "#F5F0E8",
    border: `1px solid ${hasErr ? "#8B3A3A" : focus[key] ? "#111111" : "rgba(17,17,17,0.12)"}`,
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

  const errText = (msg: string) => (
    <p style={{ fontFamily: '"DM Sans", sans-serif', fontWeight: 300, fontSize: "0.72rem", color: "#8B3A3A", margin: "5px 0 0", letterSpacing: "0.02em" }}>
      {msg}
    </p>
  );

  return (
    <div style={{
      minHeight: "100svh",
      backgroundColor: "#FAF8F4",
      fontFamily: '"DM Sans", sans-serif',
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "space-between",
      padding: "clamp(40px,6vw,64px) clamp(20px,5vw,40px)",
    }}>
      <div style={{ flex: 1, display: "flex", alignItems: "center", width: "100%", justifyContent: "center" }}>
        <div style={{ width: "100%", maxWidth: 420 }}>

          {/* Wordmark */}
          <div style={{ textAlign: "center", marginBottom: "clamp(32px,5vw,44px)", ...fd(0) }}>
            <button
              onClick={() => navigate("home")}
              style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }}
              aria-label="QUTB Home"
            >
              <div style={{ display: "flex", alignItems: "baseline", justifyContent: "center" }}>
                <span style={{ fontFamily: '"Gwendolyn", cursive', fontWeight: 700, fontSize: "2.8rem", color: "#111111", lineHeight: 1 }}>Q</span>
                <span style={{ fontFamily: '"Cormorant Garamond", serif', fontWeight: 400, fontSize: "1.82rem", color: "#111111", letterSpacing: "0.06em" }}>UTB</span>
              </div>
              <p style={{ fontFamily: '"DM Sans", sans-serif', fontWeight: 300, fontSize: "0.62rem", letterSpacing: "0.22em", textTransform: "uppercase", color: "#7C7C75", margin: "6px 0 0" }}>
                Alexandria
              </p>
            </button>
          </div>

          {/* Heading */}
          <div style={{ marginBottom: 6, ...fd(0.1) }}>
            <h1 style={{ fontFamily: '"Bodoni Moda", serif', fontStyle: "italic", fontWeight: 400, fontSize: "1.75rem", color: "#111111", margin: 0, letterSpacing: "0.01em" }}>
              Create Account
            </h1>
          </div>
          <p style={{ fontFamily: '"DM Sans", sans-serif', fontWeight: 300, fontStyle: "italic", fontSize: "0.88rem", color: "#7C7C75", margin: "0 0 clamp(24px,4vw,32px)", ...fd(0.14) }}>
            Join the uniform.
          </p>

          {/* Form */}
          <form onSubmit={handleSubmit} noValidate style={{ ...fd(0.18) }}>

            {/* Name row */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 14 }}>
              <div>
                <input
                  type="text" value={first} placeholder="First name" autoComplete="given-name"
                  onChange={e => { setFirst(e.target.value); setErrors(x => ({ ...x, first: "" })); }}
                  onFocus={() => setF("first", true)} onBlur={() => setF("first", false)}
                  style={inp("first", !!errors.first)}
                />
                {errors.first && errText(errors.first)}
              </div>
              <div>
                <input
                  type="text" value={last} placeholder="Last name" autoComplete="family-name"
                  onChange={e => { setLast(e.target.value); setErrors(x => ({ ...x, last: "" })); }}
                  onFocus={() => setF("last", true)} onBlur={() => setF("last", false)}
                  style={inp("last", !!errors.last)}
                />
                {errors.last && errText(errors.last)}
              </div>
            </div>

            {/* Email */}
            <div style={{ marginBottom: 14 }}>
              <input
                type="email" value={email} placeholder="Email address" autoComplete="email"
                onChange={e => { setEmail(e.target.value); setErrors(x => ({ ...x, email: "" })); }}
                onFocus={() => setF("email", true)} onBlur={() => setF("email", false)}
                style={inp("email", !!errors.email)}
              />
              {errors.email && errText(errors.email)}
            </div>

            {/* Password */}
            <div style={{ marginBottom: 6 }}>
              <div style={{ position: "relative" }}>
                <input
                  type={showPw ? "text" : "password"} value={password} placeholder="Password" autoComplete="new-password"
                  onChange={e => { setPassword(e.target.value); setErrors(x => ({ ...x, password: "" })); }}
                  onFocus={() => setF("pw", true)} onBlur={() => setF("pw", false)}
                  style={{ ...inp("pw", !!errors.password), paddingRight: 44 }}
                />
                <button
                  type="button" onClick={() => setShowPw(v => !v)}
                  style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#7C7C75", padding: 0, display: "flex" }}
                  aria-label={showPw ? "Hide password" : "Show password"}
                >
                  {showPw ? <EyeOff size={15} strokeWidth={1.5} /> : <Eye size={15} strokeWidth={1.5} />}
                </button>
              </div>
              {/* Strength bar */}
              <div style={{ height: 2, backgroundColor: "rgba(17,17,17,0.08)", marginTop: 6, position: "relative" }}>
                <div style={{
                  position: "absolute", left: 0, top: 0, height: "100%",
                  width: `${STRENGTH_WIDTH[strength]}%`,
                  backgroundColor: "#111111",
                  opacity: STRENGTH_OPACITY[strength],
                  transition: "width 0.35s ease, opacity 0.35s ease",
                }} />
              </div>
              {errors.password && errText(errors.password)}
            </div>

            {/* Confirm password */}
            <div style={{ marginBottom: 20 }}>
              <div style={{ position: "relative" }}>
                <input
                  type="password" value={confirm} placeholder="Confirm password" autoComplete="new-password"
                  onChange={e => { setConfirm(e.target.value); setErrors(x => ({ ...x, confirm: "" })); }}
                  onFocus={() => setF("confirm", true)} onBlur={() => setF("confirm", false)}
                  style={{ ...inp("confirm", !!errors.confirm), paddingRight: 44 }}
                />
                {confirmMatch && (
                  <span style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", color: "#111111", display: "flex" }}>
                    <Check size={14} strokeWidth={2} />
                  </span>
                )}
              </div>
              {errors.confirm && errText(errors.confirm)}
            </div>

            {/* Checkbox */}
            <div style={{ marginBottom: "clamp(20px,3.5vw,28px)" }}>
              <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}>
                <span
                  onClick={() => { setAgreed(v => !v); setErrors(x => ({ ...x, agreed: "" })); }}
                  style={{
                    width: 14, height: 14, flexShrink: 0,
                    border: `1px solid ${errors.agreed ? "#8B3A3A" : "rgba(17,17,17,0.25)"}`,
                    borderRadius: 0,
                    backgroundColor: agreed ? "#111111" : "transparent",
                    display: "flex", alignItems: "center", justifyContent: "center",
                    cursor: "pointer",
                    transition: "background-color 0.15s",
                  }}
                >
                  {agreed && <Check size={9} strokeWidth={2.5} color="#FAF8F4" />}
                </span>
                <span style={{ fontFamily: '"DM Sans", sans-serif', fontWeight: 300, fontSize: "0.75rem", color: "#7C7C75", lineHeight: 1.5, userSelect: "none" }}>
                  I agree to the{" "}
                  <span style={{ color: "#111111", textDecoration: "underline", textUnderlineOffset: "2px", cursor: "pointer" }}>
                    Terms & Conditions
                  </span>
                </span>
              </label>
              {errors.agreed && errText(errors.agreed)}
            </div>

            {/* Submit */}
            <button
              type="submit" disabled={loading}
              style={{
                width: "100%", height: 52,
                backgroundColor: "#111111", color: "#FAF8F4",
                border: "none", borderRadius: 0,
                fontFamily: '"DM Sans", sans-serif', fontWeight: 400,
                fontSize: "0.8rem", letterSpacing: "0.16em", textTransform: "uppercase",
                cursor: loading ? "default" : "pointer",
                opacity: loading ? 0.55 : 1,
                transition: "opacity 0.25s",
                display: "flex", alignItems: "center", justifyContent: "center",
              }}
              onMouseEnter={e => { if (!loading) (e.currentTarget as HTMLElement).style.opacity = "0.75"; }}
              onMouseLeave={e => { if (!loading) (e.currentTarget as HTMLElement).style.opacity = "1"; }}
            >
              {loading
                ? <span style={{ letterSpacing: "0.3em", fontSize: "1.1rem" }}>···</span>
                : "Create Account"
              }
            </button>

            {/* Divider */}
            <div style={{ display: "flex", alignItems: "center", margin: "clamp(18px,3vw,26px) 0", gap: 14 }}>
              <div style={{ flex: 1, height: 1, backgroundColor: "rgba(17,17,17,0.1)" }} />
              <span style={{ fontFamily: '"DM Sans", sans-serif', fontWeight: 300, fontSize: "0.75rem", color: "#7C7C75", letterSpacing: "0.06em" }}>or</span>
              <div style={{ flex: 1, height: 1, backgroundColor: "rgba(17,17,17,0.1)" }} />
            </div>

            {/* Sign in link */}
            <p style={{ textAlign: "center", fontFamily: '"DM Sans", sans-serif', fontWeight: 300, fontSize: "0.8rem", color: "#7C7C75", margin: 0 }}>
              Already have an account?{" "}
              <button
                type="button" onClick={() => navigate("signin")}
                style={{ background: "none", border: "none", cursor: "pointer", fontFamily: '"DM Sans", sans-serif', fontWeight: 400, fontSize: "0.8rem", color: "#111111", padding: 0, textDecoration: "underline", textUnderlineOffset: "3px" }}
              >
                Sign In
              </button>
            </p>
          </form>
        </div>
      </div>

      {/* Instagram footer */}
      <div style={{ textAlign: "center", paddingTop: 28, ...fd(0.35) }}>
        <a
          href="https://instagram.com/qutbstudio" target="_blank" rel="noopener noreferrer"
          style={{ fontFamily: '"DM Sans", sans-serif', fontWeight: 300, fontSize: "0.68rem", color: "#7C7C75", letterSpacing: "0.1em", textDecoration: "none", transition: "color 0.2s" }}
          onMouseEnter={e => (e.currentTarget.style.color = "#111111")}
          onMouseLeave={e => (e.currentTarget.style.color = "#7C7C75")}
        >
          @qutbstudio
        </a>
      </div>
    </div>
  );
}
