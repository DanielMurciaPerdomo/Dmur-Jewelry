import { Route, Routes } from "react-router-dom";
import { Landing } from "../pages/Landing";
import { Catalogo } from "../pages/Catalogo";
import { CarritoPage } from "../pages/Carrito";
import { Admin } from "../pages/Admin";
import { NotFound } from "../pages/NotFound";
import { ProtectedRoute } from "./ProtectedRoute";

export const AppRouter = () => {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/catalogo" element={<Catalogo />} />
      <Route path="/carrito" element={<CarritoPage />} />
      <Route
        path="/admin"
        element={
          <ProtectedRoute>
            <Admin />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

