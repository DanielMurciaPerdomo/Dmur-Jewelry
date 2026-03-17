import { useMaterials } from "../../hooks/useMaterials";
import { Spinner } from "../ui/Spinner";

export const Materials = () => {
  const { materials, isLoading, errorMessage } = useMaterials();

  return (
    <section className="py-16">
      <div className="mx-auto max-w-5xl px-4">
        <h2 className="text-center font-serif text-3xl font-light tracking-tight text-metallic-gold-900 dark:text-ocean-mist-100 sm:text-4xl">
          Materiales y garantía
        </h2>
        <p className="mx-auto mt-3 max-w-2xl text-center text-base text-metallic-gold-700 dark:text-ocean-mist-300">
          Trabajamos con materiales certificados y procesos que priorizan la calidad y tu
          tranquilidad.
        </p>

        {isLoading ? (
          <div className="mt-12 flex justify-center">
            <Spinner />
          </div>
        ) : errorMessage ? (
          <div className="mt-12 text-center text-red-500">{errorMessage}</div>
        ) : materials.length === 0 ? (
          <div className="mt-12 text-center text-metallic-gold-600 dark:text-ocean-mist-400">
            No hay materiales disponibles.
          </div>
        ) : (
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {materials.map((item) => (
              <article
                key={item.id}
                className="rounded-lg border border-metallic-gold-400 bg-metallic-gold-200 p-6 shadow-sm transition dark:border-ocean-mist-700 dark:bg-slate-900/60"
              >
                <h3 className="text-center text-lg font-medium text-metallic-gold-900 dark:text-ocean-mist-100">
                  {item.name}
                </h3>
                <p className="mt-2 text-base leading-relaxed text-metallic-gold-800/90 dark:text-ocean-mist-200/85 text-justify">
                  {item.description}
                </p>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
};
