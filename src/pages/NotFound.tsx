import { Link } from "react-router-dom";

export const NotFound = () => {
  return (
    <main className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-4">
      <h1 className="text-3xl font-semibold text-metallic-gold-900 dark:text-ocean-mist-100">
        404
      </h1>
      <p className="text-sm text-metallic-gold-700 dark:text-ocean-mist-300">
        La página que buscas no existe.
      </p>
      <Link
        to="/"
        className="rounded-md bg-metallic-gold-500 px-4 py-2 text-sm font-medium text-metallic-gold-950 shadow-sm transition hover:bg-metallic-gold-600 dark:bg-ocean-mist-500 dark:text-slate-950 dark:hover:bg-ocean-mist-400"
      >
        Volver al inicio
      </Link>
    </main>
  );
};
