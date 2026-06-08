import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { useCart } from "../CartContext";
import { navigate } from "../nav";
import { QutbFooter } from "./QutbFooter";

// ─── Empty State ──────────────────────────────────────────────────────────────

function EmptyCart() {
  const [vis, setVis] = useState(false);
  useEffect(() => { const t = setTimeout(() => setVis(true), 80); return () => clearTimeout(t); }, []);

  return (
    <div style={{
      minHeight: "70vh", display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center", textAlign: "center",
      padding: "clamp(48px,10vw,120px) clamp(24px,6vw,80px)",
      opacity: vis ? 1 : 0, transition: "opacity 0.9s ease",
    }}>
      <p style={{
        fontFamily: '"DM Sans", sans-serif', fontSize: "0.6rem",
        letterSpacing: "0.24em", textTransform: "uppercase",
        color: "#7C7C75", marginBottom: "clamp(24px,4vw,40px)",
      }}>
        Your Selection
      </p>
      <h2 style={{
        fontFamily: '"Bodoni Moda", serif', fontWeight: 400,
        fontSize: "clamp(1.8rem,4vw,3.2rem)", lineHeight: 1.1,
        color: "#111111", margin: "0 0 clamp(12px,2vw,20px)",
      }}>
        Nothing selected yet.
      </h2>
      <p style={{
        fontFamily: '"Bodoni Moda", serif', fontStyle: "italic",
        fontSize: "clamp(1rem,1.8vw,1.4rem)", color: "rgba(17,17,17,0.4)",
        margin: "0 0 clamp(40px,6vw,72px)",
      }}>
        Take your time.
      </p>
      <button
        onClick={() => navigate("collection")}
        style={{
          fontFamily: '"DM Sans", sans-serif', fontSize: "0.68rem",
          letterSpacing: "0.2em", textTransform: "uppercase",
          color: "#111111", background: "none", border: "none",
          borderBottom: "1px solid rgba(17,17,17,0.35)", paddingBottom: "4px",
          cursor: "pointer",
        }}
      >
        View The Uniform
      </button>
    </div>
  );
}

// ─── Cart Item ────────────────────────────────────────────────────────────────

function CartItemRow({ item, index }: { item: ReturnType<typeof useCart>["items"][0]; index: number }) {
  const { removeItem } = useCart();
  const [removing, setRemoving] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [vis, setVis] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVis(true), 80 + index * 120);
    return () => clearTimeout(t);
  }, [index]);

  function handleRemove() {
    setRemoving(true);
    setTimeout(() => removeItem(item.id), 550);
  }

  return (
    <div style={{
      display: "grid",
      gridTemplateColumns: "clamp(160px,28vw,320px) 1fr",
      gap: "clamp(24px,4vw,72px)",
      alignItems: "start",
      padding: "clamp(32px,5vw,64px) 0",
      borderBottom: "1px solid rgba(17,17,17,0.08)",
      opacity: vis && !removing ? 1 : 0,
      transform: vis && !removing ? "translateY(0)" : removing ? "translateX(-20px)" : "translateY(16px)",
      transition: removing
        ? "opacity 0.55s ease, transform 0.55s ease"
        : `opacity 0.7s ease ${index * 0.1}s, transform 0.7s ease ${index * 0.1}s`,
    }}>
      {/* Left: image */}
      <div
        style={{ overflow: "hidden", cursor: "pointer" }}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        onClick={() => navigate("product")}
      >
        <img
          src={item.image}
          alt={item.name}
          style={{
            width: "100%",
            aspectRatio: "3/4",
            objectFit: "cover",
            objectPosition: "center top",
            display: "block",
            filter: "brightness(0.95) saturate(0.8)",
            transform: hovered ? "scale(1.04)" : "scale(1)",
            transition: "transform 0.85s ease",
          }}
        />
      </div>

      {/* Right: info */}
      <div style={{ paddingTop: "clamp(8px,1.5vw,20px)" }}>
        {/* Code */}
        <p style={{
          fontFamily: '"DM Sans", sans-serif', fontSize: "0.58rem",
          letterSpacing: "0.2em", textTransform: "uppercase",
          color: "rgba(17,17,17,0.35)", marginBottom: "clamp(8px,1.2vw,14px)",
        }}>
          {item.code}
        </p>

        {/* Name + price */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "16px", marginBottom: "clamp(12px,2vw,20px)" }}>
          <h3 style={{
            fontFamily: '"Bodoni Moda", serif', fontWeight: 400,
            fontSize: "clamp(1.2rem,2.5vw,2rem)", lineHeight: 1.1,
            color: "#111111", margin: 0,
          }}>
            {item.name}
          </h3>
          <p style={{
            fontFamily: '"DM Sans", sans-serif', fontSize: "clamp(0.8rem,1.2vw,1rem)",
            color: "#111111", whiteSpace: "nowrap", paddingTop: "4px",
          }}>
            {item.price}
          </p>
        </div>

        {/* Color + size */}
        <div style={{ display: "flex", gap: "clamp(16px,3vw,36px)", marginBottom: "clamp(20px,3vw,32px)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <div style={{
              width: "14px", height: "14px",
              backgroundColor: item.colorHex,
              border: item.colorBorder ? "1px solid rgba(17,17,17,0.2)" : "none",
              flexShrink: 0,
            }} />
            <p style={{
              fontFamily: '"DM Sans", sans-serif', fontSize: "0.68rem",
              letterSpacing: "0.08em", color: "#7C7C75", margin: 0,
            }}>
              {item.colorName}
            </p>
          </div>
          <p style={{
            fontFamily: '"DM Sans", sans-serif', fontSize: "0.68rem",
            letterSpacing: "0.12em", textTransform: "uppercase",
            color: "#7C7C75", margin: 0,
          }}>
            Size {item.size}
          </p>
        </div>

        {/* Styling note */}
        {item.stylingNote && (
          <div style={{
            padding: "clamp(14px,2vw,20px) clamp(16px,2.5vw,24px)",
            backgroundColor: "#F5F0E8",
            marginBottom: "clamp(20px,3vw,32px)",
          }}>
            <p style={{
              fontFamily: '"DM Sans", sans-serif', fontSize: "0.6rem",
              letterSpacing: "0.18em", textTransform: "uppercase",
              color: "#7C7C75", marginBottom: "6px",
            }}>
              Styling note
            </p>
            <p style={{
              fontFamily: '"Bodoni Moda", serif', fontStyle: "italic",
              fontSize: "clamp(0.85rem,1.4vw,1.05rem)", lineHeight: 1.6,
              color: "rgba(17,17,17,0.65)", margin: 0,
            }}>
              {item.stylingNote}
            </p>
          </div>
        )}

        {/* Remove */}
        <button
          onClick={handleRemove}
          style={{
            display: "inline-flex", alignItems: "center", gap: "6px",
            fontFamily: '"DM Sans", sans-serif', fontSize: "0.58rem",
            letterSpacing: "0.18em", textTransform: "uppercase",
            color: "rgba(17,17,17,0.35)", background: "none", border: "none",
            cursor: "pointer", padding: 0, transition: "color 0.2s",
          }}
          onMouseEnter={e => (e.currentTarget.style.color = "#111111")}
          onMouseLeave={e => (e.currentTarget.style.color = "rgba(17,17,17,0.35)")}
        >
          <X size={11} strokeWidth={1.5} />
          Remove
        </button>
      </div>
    </div>
  );
}

// ─── Summary ──────────────────────────────────────────────────────────────────

function Summary({ items }: { items: ReturnType<typeof useCart>["items"] }) {
  const [confirmed, setConfirmed] = useState(false);

  const subtotalNum = items.reduce((acc, item) => {
    const num = parseInt(item.price.replace(/[^0-9]/g, ""), 10);
    return acc + (isNaN(num) ? 0 : num);
  }, 0);

  const rows = [
    { label: "Subtotal", value: `EGP ${subtotalNum.toLocaleString()}` },
    { label: "Shipping", value: "Calculated at confirmation" },
    { label: "Total", value: `EGP ${subtotalNum.toLocaleString()}`, strong: true },
  ];

  return (
    <div style={{
      borderTop: "1px solid rgba(17,17,17,0.1)",
      paddingTop: "clamp(32px,5vw,56px)",
      maxWidth: "380px",
      marginLeft: "auto",
    }}>
      {/* Line items */}
      {rows.map(row => (
        <div key={row.label} style={{
          display: "flex", justifyContent: "space-between",
          marginBottom: row.strong ? "clamp(28px,4vw,48px)" : "clamp(10px,1.5vw,16px)",
          borderTop: row.strong ? "1px solid rgba(17,17,17,0.1)" : "none",
          paddingTop: row.strong ? "clamp(16px,2vw,24px)" : 0,
        }}>
          <p style={{
            fontFamily: '"DM Sans", sans-serif',
            fontSize: row.strong ? "0.72rem" : "0.65rem",
            letterSpacing: "0.12em", textTransform: "uppercase",
            color: row.strong ? "#111111" : "#7C7C75", margin: 0,
          }}>
            {row.label}
          </p>
          <p style={{
            fontFamily: '"DM Sans", sans-serif',
            fontSize: row.strong ? "0.88rem" : "0.72rem",
            color: "#111111", margin: 0,
            fontWeight: row.strong ? 400 : 300,
          }}>
            {row.value}
          </p>
        </div>
      ))}

      {/* Continue button */}
      <button
        onClick={() => setConfirmed(true)}
        style={{
          width: "100%",
          backgroundColor: confirmed ? "#7C7C75" : "#111111",
          color: "#FAF8F4",
          fontFamily: '"DM Sans", sans-serif', fontSize: "0.68rem",
          letterSpacing: "0.22em", textTransform: "uppercase",
          padding: "18px", border: "none", cursor: "pointer",
          marginBottom: "12px",
          transition: "background-color 0.4s ease",
        }}
      >
        {confirmed ? "Order Placed" : "Continue"}
      </button>

      {/* Secondary action */}
      <button
        onClick={() => navigate("collection")}
        style={{
          width: "100%",
          backgroundColor: "transparent",
          color: "#7C7C75",
          fontFamily: '"DM Sans", sans-serif', fontSize: "0.65rem",
          letterSpacing: "0.18em", textTransform: "uppercase",
          padding: "14px", border: "1px solid rgba(17,17,17,0.12)",
          cursor: "pointer",
          transition: "border-color 0.3s, color 0.3s",
        }}
        onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = "#111111"; (e.currentTarget as HTMLElement).style.borderColor = "rgba(17,17,17,0.4)"; }}
        onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = "#7C7C75"; (e.currentTarget as HTMLElement).style.borderColor = "rgba(17,17,17,0.12)"; }}
      >
        Return to Collection
      </button>

      <p style={{
        fontFamily: '"DM Sans", sans-serif', fontSize: "0.58rem",
        letterSpacing: "0.1em", color: "rgba(17,17,17,0.3)",
        textAlign: "center", marginTop: "clamp(16px,2.5vw,28px)",
        lineHeight: 1.7,
      }}>
        Free returns within 14 days.<br />Made in Alexandria.
      </p>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export function CartPage() {
  const { items } = useCart();
  const [vis, setVis] = useState(false);
  useEffect(() => { const t = setTimeout(() => setVis(true), 60); return () => clearTimeout(t); }, []);

  return (
    <div style={{ backgroundColor: "#FAF8F4", fontFamily: '"DM Sans", sans-serif', overflowX: "hidden" }}>
      <style>{`
        @media (max-width: 640px) {
          .cart-item-grid { grid-template-columns: clamp(120px,38vw,200px) 1fr !important; gap: 16px !important; }
        }
      `}</style>

      {/* Header */}
      <header style={{
        maxWidth: "1400px", margin: "0 auto",
        padding: "clamp(100px,14vw,140px) clamp(20px,4vw,48px) 0",
        borderBottom: "1px solid rgba(17,17,17,0.08)",
        paddingBottom: "clamp(24px,4vw,48px)",
        opacity: vis ? 1 : 0,
        transform: vis ? "translateY(0)" : "translateY(16px)",
        transition: "opacity 0.8s ease, transform 0.8s ease",
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
          <div>
            <p style={{
              fontFamily: '"DM Sans", sans-serif', fontSize: "0.58rem",
              letterSpacing: "0.26em", textTransform: "uppercase",
              color: "#7C7C75", marginBottom: "clamp(8px,1.2vw,14px)",
            }}>
              {items.length === 0 ? "Empty" : `${items.length} piece${items.length > 1 ? "s" : ""} selected`}
            </p>
            <h1 style={{
              fontFamily: '"Bodoni Moda", serif', fontWeight: 400,
              fontSize: "clamp(2.4rem,6vw,5.5rem)", lineHeight: 0.95,
              letterSpacing: "-0.01em", color: "#111111", margin: 0,
            }}>
              Your<br /><em>Selection.</em>
            </h1>
          </div>
          <p style={{
            fontFamily: '"Bodoni Moda", serif', fontStyle: "italic",
            fontSize: "clamp(0.8rem,1.4vw,1.05rem)", color: "rgba(17,17,17,0.35)",
            textAlign: "right", maxWidth: "220px", lineHeight: 1.6,
          }}>
            A quiet inventory<br />of what you've chosen.
          </p>
        </div>
      </header>

      {/* Content */}
      <main style={{ maxWidth: "1400px", margin: "0 auto", padding: "0 clamp(20px,4vw,48px)" }}>
        {items.length === 0 ? (
          <EmptyCart />
        ) : (
          <>
            {/* Items */}
            <div style={{ marginBottom: "clamp(48px,7vw,96px)" }}>
              {items.map((item, i) => (
                <CartItemRow key={item.id} item={item} index={i} />
              ))}
            </div>

            {/* Summary */}
            <div style={{ marginBottom: "clamp(64px,10vw,120px)" }}>
              <Summary items={items} />
            </div>
          </>
        )}
      </main>

      <QutbFooter />
    </div>
  );
}
