"use client";

import { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import { useAnalytics } from "@/hooks/useAnalytics";
import { useMetaPixel } from "@/hooks/useMetaPixel";

export type CartItem = {
  id?: string;
  productId: string;
  variantId?: string;
  slug: string;
  name: string;
  color: string;
  size: string;
  qty: number;
  unitPrice: number;
  image: string;
};

type CartContextValue = {
  items: CartItem[];
  open: boolean;
  count: number;
  subtotal: number;
  openCart: () => void;
  closeCart: () => void;
  addItem: (item: CartItem) => void;
  removeItem: (key: string) => void;
  updateQty: (key: string, qty: number) => void;
  clear: () => void;
};

const STORAGE_KEY = "6street-cart-v1";
const NEW_STORAGE_KEY = "sixstreet_cart";

type PersistedGuestCart = {
  id: string;
  items: CartItem[];
};

const CartContext = createContext<CartContextValue | undefined>(undefined);

function itemKey(item: Pick<CartItem, "productId" | "size">) {
  return `${item.productId}::${item.size}`;
}

function makeGuestCartId() {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function normalizeIncoming(item: Partial<CartItem> & Pick<CartItem, "productId" | "name" | "color" | "size" | "qty" | "image">): CartItem {
  const variantId = item.variantId || item.size;
  const unitPrice = Number(item.unitPrice ?? 0);
  return {
    id: item.id,
    productId: item.productId,
    variantId,
    slug: item.slug || "",
    name: item.name,
    color: item.color,
    size: item.size,
    qty: Math.max(1, Math.floor(item.qty || 1)),
    unitPrice,
    image: item.image,
  };
}

function mapServerItem(item: any): CartItem {
  return {
    id: item.id,
    productId: item.productId,
    variantId: item.variantId,
    slug: "",
    name: item.name,
    color: item.color,
    size: item.variantId,
    qty: item.qty,
    unitPrice: item.price,
    image: item.image,
  };
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [open, setOpen] = useState(false);
  const [isShopperLoggedIn, setIsShopperLoggedIn] = useState(false);
  const guestCartIdRef = useRef<string>(makeGuestCartId());
  const { trackEvent } = useAnalytics();
  const { track } = useMetaPixel();

  const hydrateFromServer = async () => {
    const res = await fetch("/api/cart", { cache: "no-store" });
    if (!res.ok) throw new Error("SYNC_FAILED");
    const data = await res.json();
    setItems((data.items || []).map(mapServerItem));
  };

  useEffect(() => {
    const rawNew = localStorage.getItem(NEW_STORAGE_KEY);
    const rawLegacy = localStorage.getItem(STORAGE_KEY);
    try {
      if (rawNew) {
        const parsed = JSON.parse(rawNew) as PersistedGuestCart;
        if (parsed?.id) guestCartIdRef.current = parsed.id;
        if (Array.isArray(parsed?.items)) {
          setItems(parsed.items.map((item) => normalizeIncoming(item)));
          return;
        }
      }

      if (rawLegacy) {
        const parsed = JSON.parse(rawLegacy) as CartItem[];
        if (Array.isArray(parsed)) {
          setItems(parsed.map((item) => normalizeIncoming(item)));
        }
      }
    } catch {
      localStorage.removeItem(NEW_STORAGE_KEY);
      localStorage.removeItem(STORAGE_KEY);
    }

    const bootstrap = async () => {
      try {
        const sessionRes = await fetch("/api/auth/session", { cache: "no-store" });
        if (!sessionRes.ok) return;
        const session = await sessionRes.json();
        const isLoggedIn = session?.user?.role === "shopper";
        setIsShopperLoggedIn(Boolean(isLoggedIn));

        if (!isLoggedIn) return;

        const guest = localStorage.getItem(NEW_STORAGE_KEY);
        let guestItems: CartItem[] = [];
        if (guest) {
          try {
            const parsed = JSON.parse(guest) as PersistedGuestCart;
            guestItems = Array.isArray(parsed?.items)
              ? parsed.items.map((item) => normalizeIncoming(item))
              : [];
          } catch {
            guestItems = [];
          }
        }

        if (guestItems.length > 0) {
          const mergeRes = await fetch("/api/cart/merge", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              items: guestItems.map((item) => ({
                productId: item.productId,
                variantId: item.variantId,
                qty: item.qty,
                name: item.name,
                color: item.color,
                price: item.unitPrice,
                image: item.image,
              })),
            }),
          });

          if (mergeRes.ok) {
            const merged = await mergeRes.json();
            setItems((merged.items || []).map(mapServerItem));
            localStorage.removeItem(NEW_STORAGE_KEY);
            localStorage.removeItem(STORAGE_KEY);
          } else {
            await hydrateFromServer();
          }
        } else {
          await hydrateFromServer();
        }
      } catch {
        // Keep guest cart if auth/cart bootstrap fails.
      }
    };

    bootstrap();
  }, []);

  useEffect(() => {
    if (isShopperLoggedIn) return;
    const payload: PersistedGuestCart = {
      id: guestCartIdRef.current,
      items,
    };
    localStorage.setItem(NEW_STORAGE_KEY, JSON.stringify(payload));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items, isShopperLoggedIn]);

  const count = useMemo(
    () => items.reduce((sum, item) => sum + item.qty, 0),
    [items],
  );
  const subtotal = useMemo(
    () => items.reduce((sum, item) => sum + item.unitPrice * item.qty, 0),
    [items],
  );

  const addItem = (incoming: CartItem) => {
    const normalizedIncoming = normalizeIncoming(incoming);
    let snapshot: CartItem[] = [];

    setItems((prev) => {
      snapshot = prev;
      const key = itemKey(incoming);
      const index = prev.findIndex((item) => itemKey(item) === key);
      if (index === -1) return [...prev, normalizedIncoming];
      return prev.map((item, i) =>
        i === index
          ? {
              ...item,
              qty: item.qty + normalizedIncoming.qty,
            }
          : item,
      );
    });

    if (isShopperLoggedIn) {
      void fetch("/api/cart/items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: normalizedIncoming.productId,
          variantId: normalizedIncoming.variantId,
          qty: normalizedIncoming.qty,
        }),
      })
        .then(async (res) => {
          if (!res.ok) throw new Error("SYNC_FAILED");
          const data = await res.json();
          setItems((data.items || []).map(mapServerItem));
        })
        .catch(() => setItems(snapshot));
    }

    trackEvent("add_to_cart", {
      item_id: normalizedIncoming.productId,
      item_name: normalizedIncoming.name,
      size: normalizedIncoming.size,
      price: normalizedIncoming.unitPrice,
      quantity: normalizedIncoming.qty,
    });
    track("AddToCart", {
      content_ids: [normalizedIncoming.productId],
      content_name: normalizedIncoming.name,
      value: normalizedIncoming.unitPrice * normalizedIncoming.qty,
      currency: "EGP",
    });

    setOpen(true);
  };

  const removeItem = (key: string) => {
    let removed: CartItem | null = null;
    let snapshot: CartItem[] = [];

    setItems((prev) => {
      snapshot = prev;
      removed = prev.find((item) => itemKey(item) === key) || null;
      return prev.filter((item) => itemKey(item) !== key);
    });

    const removedItem = removed as CartItem | null;
    if (isShopperLoggedIn && removedItem && removedItem.id) {
      void fetch(`/api/cart/items/${removedItem.id}`, {
        method: "DELETE",
      })
        .then(async (res) => {
          if (!res.ok) throw new Error("SYNC_FAILED");
          const data = await res.json();
          setItems((data.items || []).map(mapServerItem));
        })
        .catch(() => setItems(snapshot));
    }

    if (removedItem) {
      trackEvent("remove_from_cart", {
        item_id: removedItem.productId,
        item_name: removedItem.name,
      });
    }
  };

  const updateQty = (key: string, qty: number) => {
    if (qty <= 0) {
      removeItem(key);
      return;
    }

    let target: CartItem | null = null;
    let snapshot: CartItem[] = [];

    setItems((prev) => {
      snapshot = prev;
      target = prev.find((item) => itemKey(item) === key) || null;
      return prev.map((item) => (itemKey(item) === key ? { ...item, qty } : item));
    });

    const targetItem = target as CartItem | null;
    if (isShopperLoggedIn && targetItem && targetItem.id) {
      void fetch(`/api/cart/items/${targetItem.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ qty }),
      })
        .then(async (res) => {
          if (!res.ok) throw new Error("SYNC_FAILED");
          const data = await res.json();
          setItems((data.items || []).map(mapServerItem));
        })
        .catch(() => setItems(snapshot));
    }
  };

  const clear = () => {
    const snapshot = items;
    setItems([]);

    if (isShopperLoggedIn) {
      void fetch("/api/cart", { method: "DELETE" })
        .then(async (res) => {
          if (!res.ok) throw new Error("SYNC_FAILED");
          setItems([]);
        })
        .catch(() => setItems(snapshot));
    }
  };

  return (
    <CartContext.Provider
      value={{
        items,
        open,
        count,
        subtotal,
        openCart: () => {
          setOpen(true);
          trackEvent("view_cart", {
            value: subtotal,
            currency: "EGP",
            items: items.map((item) => ({
              item_id: item.productId,
              item_name: item.name,
              quantity: item.qty,
              price: item.unitPrice,
            })),
          });
        },
        closeCart: () => setOpen(false),
        addItem,
        removeItem,
        updateQty,
        clear,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error("useCart must be used within CartProvider");
  return context;
}

export function makeItemKey(item: Pick<CartItem, "productId" | "size">) {
  return itemKey(item);
}
