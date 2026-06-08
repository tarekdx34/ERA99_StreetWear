import { useState, useEffect } from "react";
import { ShoppingBag, Search, X, Menu } from "lucide-react";
import { navigate } from "../nav";
import { useCart } from "../CartContext";

interface QutbNavProps {
  page: "home" | "collection" | "product" | "journey" | "salt" | "cart" | "alex" | "manufacturing" | "philosophy" | "packaging" | "sustainability" | "wholesale" | "contact" | "signin";
}

const linkStyle = (textColor: string, active = false) => ({
  color: textColor,
  fontFamily: '"DM Sans", sans-serif',
  fontSize: '0.75rem',
  letterSpacing: '0.12em',
  fontWeight: 400 as const,
  textTransform: 'uppercase' as const,
  textDecoration: 'none',
  background: 'none',
  border: 'none',
  cursor: 'pointer',
  padding: '4px 0',
  borderBottom: active ? `1px solid ${textColor}` : '1px solid transparent',
  transition: 'color 0.5s, opacity 0.2s, border-color 0.2s',
});

export function QutbNav({ page }: QutbNavProps) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { count, openDrawer } = useCart();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const solid = page !== "home" || scrolled || mobileOpen;
  const logoColor = solid ? "#111111" : "#FAF8F4";
  const bgClass = solid
    ? "bg-[#FAF8F4] border-b border-[rgba(17,17,17,0.1)]"
    : "bg-transparent";
  const textColor = solid ? "#111111" : "#FAF8F4";

  function NavLink({ label, homeHref, isCollection, isJourney, isSalt, isAlex }: { label: string; homeHref?: string; isCollection?: boolean; isJourney?: boolean; isSalt?: boolean; isAlex?: boolean }) {
    const active = (isCollection && (page === "collection" || page === "product")) || (isJourney && page === "journey") || (isSalt && page === "salt") || (isAlex && page === "alex");
    const style = { ...linkStyle(textColor, !!active) };

    if (isCollection) return <button onClick={() => navigate("collection")} style={style} className="hover:opacity-60">{label}</button>;
    if (isJourney) return <button onClick={() => navigate("journey")} style={style} className="hover:opacity-60">{label}</button>;
    if (isSalt) return <button onClick={() => navigate("salt")} style={style} className="hover:opacity-60">{label}</button>;
    if (isAlex) return <button onClick={() => navigate("alex")} style={style} className="hover:opacity-60">{label}</button>;
    if (page === "home" && homeHref) return <a href={homeHref} style={style} className="hover:opacity-60">{label}</a>;
    return <button onClick={() => navigate("home")} style={style} className="hover:opacity-60">{label}</button>;
  }

  function MobileLink({ label, homeHref, isCollection, isJourney, isSalt, isAlex }: { label: string; homeHref?: string; isCollection?: boolean; isJourney?: boolean; isSalt?: boolean; isAlex?: boolean }) {
    const isActive = (isCollection && (page === "collection" || page === "product")) || (isJourney && page === "journey") || (isSalt && page === "salt") || (isAlex && page === "alex");
    const s = {
      color: isActive ? '#111111' : '#7C7C75',
      fontFamily: '"DM Sans", sans-serif',
      fontSize: '0.8rem',
      letterSpacing: '0.14em',
      fontWeight: isActive ? 400 as const : 300 as const,
      textTransform: 'uppercase' as const,
      textDecoration: 'none',
      background: 'none',
      border: 'none',
      cursor: 'pointer',
      padding: 0,
      textAlign: 'left' as const,
    };
    if (isCollection) return <button style={s} onClick={() => { navigate("collection"); setMobileOpen(false); }}>{label}</button>;
    if (isJourney) return <button style={s} onClick={() => { navigate("journey"); setMobileOpen(false); }}>{label}</button>;
    if (isSalt) return <button style={s} onClick={() => { navigate("salt"); setMobileOpen(false); }}>{label}</button>;
    if (isAlex) return <button style={s} onClick={() => { navigate("alex"); setMobileOpen(false); }}>{label}</button>;
    if (page === "home" && homeHref) return <a style={s} href={homeHref} onClick={() => setMobileOpen(false)}>{label}</a>;
    return <button style={s} onClick={() => { navigate("home"); setMobileOpen(false); }}>{label}</button>;
  }

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${bgClass}`}
      style={{ fontFamily: '"DM Sans", sans-serif' }}
    >
      <div className="max-w-[1440px] mx-auto px-6 md:px-12 flex items-center justify-between h-[72px]">
        {/* Logo */}
        <button
          onClick={() => navigate("home")}
          className="hover:opacity-70 transition-opacity"
          aria-label="QUTB Home"
          style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
        >
          <span
            style={{
              color: logoColor,
              fontSize: '1.5rem',
              letterSpacing: '0.22em',
              fontWeight: 400,
              transition: 'color 0.5s',
              display: 'flex',
              alignItems: 'baseline',
            }}
          >
            <span style={{ fontFamily: '"Gwendolyn", cursive', fontWeight: 700 }}>Q</span>
            <span style={{ fontFamily: '"Cormorant Garamond", serif', fontWeight: 400, fontSize: '0.65em' }}>UTB</span>
          </span>
        </button>

        {/* Desktop links */}
        <div className="hidden md:flex items-center gap-10">
          <NavLink label="The Uniform" isCollection />
          <NavLink label="Cotton Journey" isJourney />
          <NavLink label="Alexandria" isAlex />
          <NavLink label="Salt Journal" isSalt />
        </div>

        {/* Icons */}
        <div className="flex items-center gap-5">
          <button
            onClick={() => navigate("signin")}
            className="hidden md:block"
            style={{
              color: textColor,
              fontFamily: '"DM Sans", sans-serif',
              fontWeight: 300,
              fontSize: '0.75rem',
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '4px 0',
              textDecoration: 'none',
              transition: 'color 0.5s',
            }}
            onMouseEnter={e => (e.currentTarget.style.textDecoration = 'underline')}
            onMouseLeave={e => (e.currentTarget.style.textDecoration = 'none')}
          >
            Sign In
          </button>
          <button
            aria-label="Search"
            className="hidden md:block hover:opacity-60 transition-opacity"
            style={{ color: textColor, transition: 'color 0.5s', background: 'none', border: 'none', cursor: 'pointer' }}
          >
            <Search size={17} strokeWidth={1.5} />
          </button>
          <button
            aria-label="Cart"
            onClick={openDrawer}
            className="flex items-center gap-1.5 hover:opacity-60 transition-opacity"
            style={{ color: textColor, transition: 'color 0.5s', background: 'none', border: 'none', cursor: 'pointer' }}
          >
            <ShoppingBag size={17} strokeWidth={1.5} />
            <span style={{ fontSize: '0.7rem', letterSpacing: '0.08em', fontFamily: '"DM Sans", sans-serif' }}>
              {count}
            </span>
          </button>
          <button
            className="md:hidden hover:opacity-60 transition-opacity"
            style={{ color: textColor, transition: 'color 0.5s', background: 'none', border: 'none', cursor: 'pointer' }}
            aria-label="Menu"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X size={18} strokeWidth={1.5} /> : <Menu size={18} strokeWidth={1.5} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden bg-[#FAF8F4] border-t border-[rgba(17,17,17,0.1)] px-6 py-8 flex flex-col gap-6">
          <MobileLink label="The Uniform" isCollection />
          <MobileLink label="Cotton Journey" isJourney />
          <MobileLink label="Alexandria" isAlex />
          <MobileLink label="Salt Journal" isSalt />
        </div>
      )}
    </nav>
  );
}
