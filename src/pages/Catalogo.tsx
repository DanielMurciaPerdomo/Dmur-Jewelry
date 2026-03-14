import { JoyaGrid } from "../components/catalog/JoyaGrid";
import { FiltrosCatalogo } from "../components/catalog/FiltrosCatalogo";

export const Catalogo = () => {
  return (
    <main className="mx-auto max-w-6xl p-6">
      <h1 className="text-3xl font-bold tracking-tight text-metallic-gold-900 dark:text-ocean-mist-100 sm:text-4xl">
        Nuestro Catálogo
      </h1>
      <p className="mt-2 text-lg text-metallic-gold-700 dark:text-ocean-mist-300">
        Explora nuestra exclusiva colección de joyas.
      </p>

      <div className="mt-8 grid grid-cols-1 gap-8 md:grid-cols-4">
        <aside className="md:col-span-1">
          <FiltrosCatalogo />
        </aside>
        <section className="md:col-span-3">
          <JoyaGrid />
        </section>
      </div>
    </main>
  );
};
