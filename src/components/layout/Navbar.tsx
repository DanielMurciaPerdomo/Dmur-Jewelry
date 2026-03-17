import { Link } from "react-router-dom";

export const Navbar = () => {
  return (
    <header className="sticky top-0 z-40 border-b border-metallic-gold-400 bg-metallic-gold-400 dark:border-ocean-mist-800/60 dark:bg-slate-950/95">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
        <Link
          to="/"
          className="font-serif text-2xl font-semibold tracking-tight text-metallic-gold-900 transition hover:text-metallic-gold-950 dark:text-ocean-mist-100 dark:hover:text-ocean-mist-100"
        >
          Dmur Jewelry
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
            className="transition hover:text-metallic-gold-900 dark:hover:text-ocean-mist-100"
          >
            Carrito
          </Link>
        </div>
      </nav>
    </header>
  );
};
