import { Link } from "react-router-dom";
import logoLargo from "../../assets/Dmur-logo-largo.png";
import logoLargoDark from "../../assets/Dmur-logo-largo-dark.png";
import { useCarrito } from "../../hooks/useCarrito";
import { ThemeToggle } from "../ui/ThemeToggle";
import { useTheme } from "../../context/ThemeContext";

export const Navbar = () => {
  const { items } = useCarrito();
  const { theme } = useTheme();
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const logoSrc = theme === "dark" ? logoLargoDark : logoLargo;

  return (
    <header className="sticky top-0 z-40 border-b border-metallic-gold-400 bg-metallic-gold-400 dark:border-ocean-mist-700/60 dark:bg-slate-950/95">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
        <Link to="/" className="xl:translate-x-[-20%]">
          <img src={logoSrc} alt="Logo D'mur Joyería" className="h-14 w-auto object-contain mb-3" />
        </Link>
        <div className="font-serif flex items-center gap-4 text-xl text-metallic-gold-900 dark:text-ocean-mist-200">
          <Link
            to="/catalogo"
            className="transition hover:text-metallic-gold-900 dark:hover:text-ocean-mist-100"
          >
            Catálogo
          </Link>
          <Link
            to="/carrito"
            className="relative transition hover:text-metallic-gold-900 dark:hover:text-ocean-mist-100"
          >
            Carrito
            {totalItems > 0 && (
              <span className="absolute -bottom-2 -right-4 flex h-5 w-5 items-center justify-center rounded-full bg-metallic-gold-600 text-xs dark:bg-ocean-mist-700 text-white">
                {totalItems > 9 ? "9+" : totalItems}
              </span>
            )}
          </Link>
          <ThemeToggle />
        </div>
      </nav>
    </header>
  );
};
