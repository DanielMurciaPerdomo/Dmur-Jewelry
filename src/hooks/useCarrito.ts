import { useContext } from "react";
import { CarritoContext } from "../context/CarritoContext";

export const useCarrito = () => {
  const ctx = useContext(CarritoContext);

  if (!ctx) {
    throw new Error("useCarrito debe usarse dentro de CarritoProvider");
  }

  return ctx;
};

