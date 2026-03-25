import { createContext, ReactNode, useMemo, useState, useEffect } from "react";
import type { CarritoItem } from "../types/joya.types";

interface CarritoContextValue {
  items: CarritoItem[];
  addItem: (item: CarritoItem) => void;
  removeItem: (productId: string) => void;
  updateItem: (productId: string, newQuantity: number) => void;
  clear: () => void;
}

export const CarritoContext = createContext<CarritoContextValue | undefined>(undefined);

const STORAGE_KEY = "dmur_carrito";

interface CarritoProviderProps {
  children: ReactNode;
}

export const CarritoProvider = ({ children }: CarritoProviderProps) => {
  const [items, setItems] = useState<CarritoItem[]>(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        try {
          return JSON.parse(stored);
        } catch {
          return [];
        }
      }
    }
    return [];
  });

  // Persistir en localStorage cuando cambian los items
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    }
  }, [items]);

  const value: CarritoContextValue = useMemo(
    () => ({
      items,
      addItem: (newItem) => {
        setItems((prevItems) => {
          const existingItemIndex = prevItems.findIndex(
            (item) => item.product.id === newItem.product.id
          );

          if (existingItemIndex > -1) {
            const updatedItems = [...prevItems];
            updatedItems[existingItemIndex] = {
              ...updatedItems[existingItemIndex],
              quantity: updatedItems[existingItemIndex].quantity + newItem.quantity,
            };
            return updatedItems;
          } else {
            return [...prevItems, newItem];
          }
        });
      },
      removeItem: (id) => {
        setItems((prev) => prev.filter((item) => item.product.id !== id));
      },
      updateItem: (productId, newQuantity) => {
        if (newQuantity <= 0) {
          setItems((prev) => prev.filter((item) => item.product.id !== productId));
        } else {
          setItems((prev) =>
            prev.map((item) =>
              item.product.id === productId ? { ...item, quantity: newQuantity } : item
            )
          );
        }
      },
      clear: () => setItems([]),
    }),
    [items]
  );

  return <CarritoContext.Provider value={value}>{children}</CarritoContext.Provider>;
};
