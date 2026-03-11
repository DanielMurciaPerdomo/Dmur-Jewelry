import { Link } from "react-router-dom";

export const NotFound = () => {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-4">
      <h1 className="text-3xl font-semibold text-amber-300">404</h1>
      <p className="text-sm text-slate-300">La página que buscas no existe.</p>
      <Link
        to="/"
        className="rounded-md bg-amber-400 px-4 py-2 text-sm font-medium text-slate-950 hover:bg-amber-300"
      >
        Volver al inicio
      </Link>
    </main>
  );
};

