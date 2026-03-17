import { Route, Routes } from "react-router-dom";
import { Landing } from "../pages/Landing";
import { Catalogo } from "../pages/Catalogo";
import { CarritoPage } from "../pages/Carrito";
import { DashboardAdmin } from "../components/admin/Dashboard-Admin";
import { NotFound } from "../pages/NotFound";
import { ProtectedRoute } from "./ProtectedRoute";
import { AdminLogin } from "../components/admin/AdminLogin";
import { AdminLayout } from "../components/admin/AdminLayout";
import { JoyaTabla } from "../components/admin/JoyaTabla";
import { JoyaForm } from "../components/admin/JoyaForm";
import { Configuracion } from "../pages/Configuracion";
import { PiedrasTabla } from "../components/admin/PiedrasTabla";
import { PiedrasForm } from "../components/admin/PiedrasForm";

export const AppRouter = () => {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/catalogo" element={<Catalogo />} />
      <Route path="/carrito" element={<CarritoPage />} />

      {/* Admin Routes */}
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route
        path="/admin"
        element={
          <ProtectedRoute>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<DashboardAdmin />} />
        <Route path="productos" element={<JoyaTabla />} />
        <Route path="productos/nuevo" element={<JoyaForm />} />
        <Route path="productos/:id/editar" element={<JoyaForm />} />
        <Route path="piedras" element={<PiedrasTabla />} />
        <Route path="piedras/nueva" element={<PiedrasForm />} />
        <Route path="piedras/:id/editar" element={<PiedrasForm />} />
        <Route path="configuracion" element={<Configuracion />} />
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};
