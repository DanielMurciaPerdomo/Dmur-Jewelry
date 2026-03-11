import { Link } from "react-router-dom";

export const Navbar = () => {
  return (
    <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur">
      <nav className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        <Link to="/" className="text-sm font-semibold tracking-tight text-amber-300">
          Dmur Jewelry
        </Link>
        <div className="flex gap-4 text-xs text-slate-200">
          <Link to="/catalogo" className="hover:text-amber-300">
            Catálogo
          </Link>
          <Link to="/carrito" className="hover:text-amber-300">
            Carrito
          </Link>
        </div>
      </nav>
    </header>
  );
};

