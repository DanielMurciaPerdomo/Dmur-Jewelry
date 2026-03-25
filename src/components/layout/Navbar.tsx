import { Link } from "react-router-dom";
import logoLargo from "../../assets/Dmur-logo-largo.png";
import { useCarrito } from "../../hooks/useCarrito";

export const Navbar = () => {
  const { items } = useCarrito();
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  return (
    <header className="sticky top-0 z-40 border-b border-metallic-gold-400 bg-metallic-gold-400 dark:border-ocean-mist-800/60 dark:bg-slate-950/95">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
        <Link to="/" className="xl:translate-x-[-20%]">
          <img
            src={logoLargo}
            alt="Logo D'mur Joyería"
            className="h-14 w-auto object-contain mb-3"
          />
        </Link>
        <div className="font-serif flex gap-6 text-xl text-metallic-gold-900 dark:text-ocean-mist-200">
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
              <span className="absolute -bottom-2 -right-4 flex h-5 w-5 items-center justify-center rounded-full bg-metallic-gold-600 text-xs text-white">
                {totalItems > 9 ? "9+" : totalItems}
              </span>
            )}
          </Link>
        </div>
      </nav>
    </header>
  );
};
