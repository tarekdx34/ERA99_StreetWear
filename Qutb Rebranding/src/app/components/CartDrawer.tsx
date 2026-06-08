import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { useCart } from "../CartContext";
import { navigate } from "../nav";

function parsePriceEGP(price: string): number {
  return parseInt(price.replace(/[^0-9]/g, ""), 10) || 0;
}

export function CartDrawer() {
  const { items, removeItem, count, isDrawerOpen, closeDrawer } = useCart();
  const [visible, setVisible] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [removingId, setRemovingId] = useState<string | null>(null);

  useEffect(() => {
    if (isDrawerOpen) {
      setMounted(true);
      requestAnimationFrame(() => requestAnimationFrame(() => setVisible(true)));
    } else {
      setVisible(false);
      const t = setTimeout(() => setMounted(false), 380);
      return () => clearTimeout(t);
    }
  }, [isDrawerOpen]);

  useEffect(() => {
    if (isDrawerOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [isDrawerOpen]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") closeDrawer(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [closeDrawer]);

  const subtotal = items.reduce((sum, item) => sum + parsePriceEGP(item.price), 0);

  function handleRemove(id: string) {
    setRemovingId(id);
    setTimeout(() => { removeItem(id); setRemovingId(null); }, 420);
  }

  if (!mounted) return null;

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 300 }}>
      {/* Backdrop */}
      <div
        onClick={closeDrawer}
        style={{
          position: "absolute",
          inset: 0,
          backgroundColor: "rgba(17,17,17,0.4)",
          opacity: visible ? 1 : 0,
          transition: "opacity 0.35s ease",
        }}
      />

      {/* Drawer panel */}
      <div
        style={{
          position: "absolute",
          top: 0,
          right: 0,
          bottom: 0,
          width: "min(440px, 100vw)",
          backgroundColor: "#FAF8F4",
          borderLeft: "1px solid rgba(17,17,17,0.1)",
          display: "flex",
          flexDirection: "column",
          transform: visible ? "translateX(0)" : "translateX(100%)",
          transition: "transform 0.4s cubic-bezier(0.22, 1, 0.36, 1)",
          fontFamily: '"DM Sans", sans-serif',
        }}
      >
        {/* Header */}
        <div style={{
          padding: "clamp(28px, 4vw, 40px) clamp(24px, 4vw, 36px) 20px",
          borderBottom: "1px solid rgba(17,17,17,0.08)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "baseline",
          flexShrink: 0,
        }}>
          <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
            <h2 style={{
              fontFamily: '"Bodoni Moda", serif',
              color: "#111111",
              fontSize: "1.35rem",
              fontWeight: 500,
              letterSpacing: "0.04em",
              margin: 0,
            }}>
              Selection
            </h2>
            {count > 0 && (
              <span style={{
                color: "#7C7C75",
                fontSize: "0.62rem",
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                fontWeight: 300,
              }}>
                {count} {count === 1 ? "item" : "items"}
              </span>
            )}
          </div>
          <button
            onClick={closeDrawer}
            aria-label="Close"
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              color: "#7C7C75",
              padding: 0,
              transition: "color 0.15s",
            }}
            onMouseEnter={e => (e.currentTarget.style.color = "#111111")}
            onMouseLeave={e => (e.currentTarget.style.color = "#7C7C75")}
          >
            <X size={16} strokeWidth={1.5} />
          </button>
        </div>

        {/* Items */}
        <div style={{ flex: 1, overflowY: "auto", padding: "0 clamp(24px, 4vw, 36px)" }}>
          {items.length === 0 ? (
            <div style={{ paddingTop: 80, textAlign: "center" }}>
              <p style={{
                fontFamily: '"Bodoni Moda", serif',
                color: "#7C7C75",
                fontSize: "1.1rem",
                fontStyle: "italic",
                fontWeight: 400,
                marginBottom: 10,
              }}>
                Nothing selected yet.
              </p>
              <p style={{
                color: "rgba(17,17,17,0.3)",
                fontSize: "0.65rem",
                letterSpacing: "0.18em",
                textTransform: "uppercase",
                fontWeight: 300,
              }}>
                Take your time.
              </p>
            </div>
          ) : (
            <div style={{ paddingTop: 4 }}>
              {items.map((item, i) => (
                <div
                  key={item.id}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "68px 1fr auto",
                    gap: 16,
                    padding: "22px 0",
                    borderBottom: i < items.length - 1 ? "1px solid rgba(17,17,17,0.07)" : "none",
                    opacity: removingId === item.id ? 0 : 1,
                    transform: removingId === item.id ? "translateX(10px)" : "none",
                    transition: "opacity 0.38s ease, transform 0.38s ease",
                  }}
                >
                  {/* Image */}
                  <div style={{
                    width: 68,
                    aspectRatio: "3/4",
                    overflow: "hidden",
                    backgroundColor: "#EDE8DF",
                    flexShrink: 0,
                  }}>
                    <img
                      src={item.image}
                      alt={item.name}
                      style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                    />
                  </div>

                  {/* Info */}
                  <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", minHeight: "calc(68px * 4/3)" }}>
                    <div>
                      <p style={{
                        color: "#111111",
                        fontFamily: '"Bodoni Moda", serif',
                        fontSize: "0.9rem",
                        fontWeight: 400,
                        letterSpacing: "0.01em",
                        marginBottom: 4,
                        lineHeight: 1.25,
                      }}>
                        {item.name}
                      </p>
                      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 2 }}>
                        <span
                          style={{
                            display: "inline-block",
                            width: 10,
                            height: 10,
                            borderRadius: "50%",
                            backgroundColor: item.colorHex,
                            border: item.colorBorder ? "1px solid rgba(17,17,17,0.25)" : "1px solid transparent",
                            flexShrink: 0,
                          }}
                        />
                        <span style={{
                          color: "#7C7C75",
                          fontSize: "0.68rem",
                          letterSpacing: "0.08em",
                          fontWeight: 300,
                        }}>
                          {item.colorName} · {item.size}
                        </span>
                      </div>
                    </div>
                    <p style={{
                      color: "#111111",
                      fontSize: "0.82rem",
                      fontWeight: 400,
                      letterSpacing: "0.03em",
                    }}>
                      {item.price}
                    </p>
                  </div>

                  {/* Remove */}
                  <button
                    onClick={() => handleRemove(item.id)}
                    aria-label={`Remove ${item.name}`}
                    style={{
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      color: "rgba(17,17,17,0.2)",
                      padding: "2px 0 0 0",
                      alignSelf: "start",
                      transition: "color 0.15s",
                    }}
                    onMouseEnter={e => (e.currentTarget.style.color = "#111111")}
                    onMouseLeave={e => (e.currentTarget.style.color = "rgba(17,17,17,0.2)")}
                  >
                    <X size={13} strokeWidth={1.5} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Summary + CTA */}
        {items.length > 0 && (
          <div style={{
            padding: "20px clamp(24px, 4vw, 36px) clamp(28px, 4vw, 40px)",
            borderTop: "1px solid rgba(17,17,17,0.08)",
            flexShrink: 0,
            backgroundColor: "#F5F0E8",
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 6 }}>
              <span style={{ color: "#7C7C75", fontSize: "0.62rem", letterSpacing: "0.18em", textTransform: "uppercase", fontWeight: 300 }}>
                Subtotal
              </span>
              <span style={{ color: "#111111", fontSize: "0.9rem", fontWeight: 400, letterSpacing: "0.03em" }}>
                EGP {subtotal.toLocaleString()}
              </span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 24 }}>
              <span style={{ color: "rgba(17,17,17,0.3)", fontSize: "0.6rem", letterSpacing: "0.14em", textTransform: "uppercase", fontWeight: 300 }}>
                Shipping
              </span>
              <span style={{ color: "rgba(17,17,17,0.35)", fontSize: "0.7rem", fontWeight: 300, fontStyle: "italic" }}>
                Calculated at checkout
              </span>
            </div>

            <button
              onClick={() => { closeDrawer(); navigate("cart"); }}
              style={{
                display: "block",
                width: "100%",
                backgroundColor: "#111111",
                color: "#FAF8F4",
                border: "none",
                padding: "16px",
                fontFamily: '"DM Sans", sans-serif',
                fontSize: "0.68rem",
                letterSpacing: "0.22em",
                textTransform: "uppercase",
                fontWeight: 400,
                cursor: "pointer",
                marginBottom: 8,
                transition: "opacity 0.2s",
              }}
              className="hover:opacity-75"
            >
              Continue to Checkout
            </button>

            <button
              onClick={closeDrawer}
              style={{
                display: "block",
                width: "100%",
                backgroundColor: "transparent",
                color: "#7C7C75",
                border: "none",
                padding: "12px",
                fontFamily: '"DM Sans", sans-serif',
                fontSize: "0.65rem",
                letterSpacing: "0.16em",
                textTransform: "uppercase",
                fontWeight: 300,
                cursor: "pointer",
                transition: "color 0.15s",
              }}
              onMouseEnter={e => (e.currentTarget.style.color = "#111111")}
              onMouseLeave={e => (e.currentTarget.style.color = "#7C7C75")}
            >
              Continue Exploring
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
