import { createContext, ReactNode, useMemo, useState } from "react";
import type { CarritoContextValue, CarritoItem } from "../types/joya.types";

export const CarritoContext = createContext<CarritoContextValue | undefined>(undefined);

interface CarritoProviderProps {
  children: ReactNode;
}

export const CarritoProvider = ({ children }: CarritoProviderProps) => {
  const [items, setItems] = useState<CarritoItem[]>([]);

  const value: CarritoContextValue = useMemo(
    () => ({
      items,
      addItem: (item) => {
        setItems((prev) => [...prev, item]);
      },
      removeItem: (id) => {
        setItems((prev) => prev.filter((item) => item.product.id !== id));
      },
      clear: () => setItems([])
    }),
    [items]
  );

  return <CarritoContext.Provider value={value}>{children}</CarritoContext.Provider>;
};

