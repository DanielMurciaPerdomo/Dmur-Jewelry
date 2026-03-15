import { Link, NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { LogOut } from "lucide-react";

export const AdminLayout = () => {
  const { signOut } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut();
    navigate("/admin/login");
  };

  const activeClass =
    "bg-metallic-gold-100 text-metallic-gold-900 dark:bg-ocean-mist-800 dark:text-ocean-mist-100";
  const inactiveClass =
    "text-metallic-gold-700 hover:bg-metallic-gold-100 dark:text-ocean-mist-300 dark:hover:bg-ocean-mist-800";

  return (
    <div className="min-h-screen flex bg-metallic-gold-50 dark:bg-slate-950">
      {/* Sidebar */}
      <aside className="w-64 bg-white dark:bg-slate-900 shadow-md p-4 flex flex-col">
        <Link
          to="/"
          className="text-xl font-bold text-metallic-gold-600 dark:text-ocean-mist-400 mb-8 text-center"
        >
          DMur Joyería
        </Link>
        <nav className="flex-1 space-y-2">
          <NavLink
            to="/admin"
            end
            className={({ isActive }) =>
              `block px-4 py-2 rounded-md transition-colors ${isActive ? activeClass : inactiveClass}`
            }
          >
            Dashboard
          </NavLink>
          <NavLink
            to="/admin/productos"
            className={({ isActive }) =>
              `block px-4 py-2 rounded-md transition-colors ${isActive ? activeClass : inactiveClass}`
            }
          >
            Productos
          </NavLink>
          <NavLink
            to="/admin/configuracion"
            className={({ isActive }) =>
              `block px-4 py-2 rounded-md transition-colors ${isActive ? activeClass : inactiveClass}`
            }
          >
            Configuración
          </NavLink>
        </nav>
        <button
          onClick={handleLogout}
          className="flex items-center justify-center gap-2 w-full text-metallic-gold-700 hover:text-metallic-gold-900 dark:text-ocean-mist-400 dark:hover:text-ocean-mist-100 transition-colors duration-200 text-base font-medium"
        >
          <LogOut className="w-4 h-4" />
          <span>Cerrar sesión</span>
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
};
