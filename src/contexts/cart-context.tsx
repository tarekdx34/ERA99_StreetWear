"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";

export type CartItem = {
  productId: string;
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

const STORAGE_KEY = "qutb-cart-v1";

const CartContext = createContext<CartContextValue | undefined>(undefined);

function itemKey(item: Pick<CartItem, "productId" | "size">) {
  return `${item.productId}::${item.size}`;
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    try {
      const parsed = JSON.parse(raw) as CartItem[];
      setItems(parsed);
    } catch {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items]);

  const count = useMemo(() => items.reduce((sum, item) => sum + item.qty, 0), [items]);
  const subtotal = useMemo(() => items.reduce((sum, item) => sum + item.unitPrice * item.qty, 0), [items]);

  const addItem = (incoming: CartItem) => {
    setItems((prev) => {
      const key = itemKey(incoming);
      const index = prev.findIndex((item) => itemKey(item) === key);
      if (index === -1) return [...prev, incoming];
      return prev.map((item, i) =>
        i === index
          ? {
              ...item,
              qty: item.qty + incoming.qty,
            }
          : item,
      );
    });
    setOpen(true);
  };

  const removeItem = (key: string) => setItems((prev) => prev.filter((item) => itemKey(item) !== key));

  const updateQty = (key: string, qty: number) => {
    if (qty <= 0) {
      removeItem(key);
      return;
    }
    setItems((prev) => prev.map((item) => (itemKey(item) === key ? { ...item, qty } : item)));
  };

  return (
    <CartContext.Provider
      value={{
        items,
        open,
        count,
        subtotal,
        openCart: () => setOpen(true),
        closeCart: () => setOpen(false),
        addItem,
        removeItem,
        updateQty,
        clear: () => setItems([]),
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
