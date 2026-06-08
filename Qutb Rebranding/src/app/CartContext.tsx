import { createContext, useContext, useState, ReactNode } from "react";

export interface CartItem {
  id: string;
  name: string;
  code: string;
  price: string;
  colorName: string;
  colorHex: string;
  colorBorder?: boolean;
  size: string;
  image: string;
  stylingNote: string;
}

interface CartContextValue {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (id: string) => void;
  count: number;
  isDrawerOpen: boolean;
  openDrawer: () => void;
  closeDrawer: () => void;
}

const CartContext = createContext<CartContextValue>({
  items: [],
  addItem: () => {},
  removeItem: () => {},
  count: 0,
  isDrawerOpen: false,
  openDrawer: () => {},
  closeDrawer: () => {},
});

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  function addItem(item: CartItem) {
    setItems(prev => {
      const exists = prev.find(i => i.id === item.id);
      if (exists) return prev;
      return [...prev, item];
    });
  }

  function removeItem(id: string) {
    setItems(prev => prev.filter(i => i.id !== id));
  }

  return (
    <CartContext.Provider value={{
      items,
      addItem,
      removeItem,
      count: items.length,
      isDrawerOpen,
      openDrawer: () => setIsDrawerOpen(true),
      closeDrawer: () => setIsDrawerOpen(false),
    }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}
