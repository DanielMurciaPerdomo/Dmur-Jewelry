import { Link } from "react-router-dom";
import { useFeaturedJoyas } from "../../hooks/useFeaturedJoyas";
import { formatCurrencyCOP } from "../../utils/formatters";
import { Spinner } from "../ui/Spinner";
import type { JoyaWithRelations } from "../../types/joya.types";

const MAX_FEATURED = 6;

const ProductCard = ({ joya }: { joya: JoyaWithRelations }) => {
  const imageUrl = joya.primary_image?.public_url ?? null;
  const alt = joya.name;

  return (
    <article className="overflow-hidden rounded-lg border border-metallic-gold-200 bg-white shadow-sm dark:border-ocean-mist-800 dark:bg-slate-900/80">
      <div className="aspect-square bg-metallic-gold-100 dark:bg-slate-800">
        {imageUrl ? (
          <img src={imageUrl} alt={alt} className="h-full w-full object-cover" loading="lazy" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-metallic-gold-500 dark:text-ocean-mist-600">
            <span className="text-sm">Sin imagen</span>
          </div>
        )}
      </div>
      <div className="p-4">
        <h3 className="line-clamp-2 text-base font-medium text-metallic-gold-900 dark:text-ocean-mist-100">
          {joya.name}
        </h3>
        <p className="mt-1 text-sm text-metallic-gold-600 dark:text-ocean-mist-400">
          {joya.product_type?.name}
          {joya.material?.name ? ` · ${joya.material.name}` : null}
        </p>
        <p className="mt-2 text-base font-medium text-metallic-gold-800 dark:text-ocean-mist-200">
          {formatCurrencyCOP(joya.final_price)}
        </p>
      </div>
    </article>
  );
};

export const FeaturedProducts = () => {
  const { joyas, isLoading, errorMessage } = useFeaturedJoyas();
  const displayed = joyas.slice(0, MAX_FEATURED);

  return (
    <section className="border-t border-metallic-gold-200/80 bg-metallic-gold-50/30 py-16 dark:border-ocean-mist-800 dark:bg-slate-950/50">
      <div className="mx-auto max-w-5xl px-4">
        <h2 className="text-center font-serif text-3xl font-light tracking-tight text-metallic-gold-900 dark:text-ocean-mist-100 sm:text-4xl">
          Productos destacados
        </h2>
        <p className="mx-auto mt-3 max-w-2xl text-center text-base text-metallic-gold-700 dark:text-ocean-mist-300">
          Una selección de piezas que nos gustaría que conocieras.
        </p>

        <div className="mt-10">
          {isLoading && (
            <div className="flex min-h-[200px] items-center justify-center">
              <Spinner />
            </div>
          )}

          {!isLoading && errorMessage && (
            <p className="rounded-md border border-metallic-gold-300 bg-metallic-gold-50 px-4 py-3 text-center text-base text-metallic-gold-800 dark:border-ocean-mist-700 dark:bg-slate-900 dark:text-ocean-mist-200">
              {errorMessage}
            </p>
          )}

          {!isLoading && !errorMessage && displayed.length === 0 && (
            <p className="text-center text-base text-metallic-gold-700 dark:text-ocean-mist-400">
              Pronto verás aquí nuestras joyas destacadas.
            </p>
          )}

          {!isLoading && !errorMessage && displayed.length > 0 && (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {displayed.map((joya) => (
                <ProductCard key={joya.id} joya={joya} />
              ))}
            </div>
          )}

          {!isLoading && !errorMessage && (
            <div className="mt-10 flex justify-center">
              <Link
                to="/catalogo"
                className="inline-flex rounded-md bg-metallic-gold-500 px-5 py-2.5 text-base font-medium text-metallic-gold-950 transition hover:bg-metallic-gold-600 dark:bg-ocean-mist-500 dark:text-slate-950 dark:hover:bg-ocean-mist-400"
              >
                Ver catálogo completo
              </Link>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
