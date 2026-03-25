import { Link } from "react-router-dom";
import { useEffect, useState, useCallback } from "react";
// @ts-ignore
import useEmblaCarousel from "embla-carousel-react";
// @ts-ignore
import Autoplay from "embla-carousel-autoplay";
import { useFeaturedJoyas } from "../../hooks/useFeaturedJoyas";
import { formatCurrencyCOP } from "../../utils/formatters";
import { Spinner } from "../ui/Spinner";
import type { JoyaWithRelations } from "../../types/joya.types";

const MAX_FEATURED = 6;

const ProductCard = ({ joya, isActive }: { joya: JoyaWithRelations; isActive: boolean }) => {
  const imageUrl = joya.primary_image?.public_url ?? null;
  const alt = joya.name;

  return (
    <div className="flex h-full min-w-0 flex-shrink-0 snap-center justify-center px-3 md:px-4">
      <Link
        to={`/joya/${joya.slug ?? joya.id}`}
        className={`block h-full w-full max-w-[300px] transition-all duration-300 ${
          isActive ? "scale-105 z-10" : "scale-100 opacity-70 hover:opacity-90"
        }`}
      >
        <article
          className={`flex h-full flex-col overflow-hidden rounded-xl border-2 bg-white shadow-lg transition-shadow ${
            isActive
              ? "border-metallic-gold-400 dark:border-ocean-mist-300 shadow-xl dark:bg-slate-900/90"
              : "border-metallic-gold-200 dark:border-ocean-mist-700 shadow-md hover:shadow-lg dark:bg-slate-900/80"
          }`}
        >
          <div className="relative flex-shrink-0 bg-white p-1.5 dark:bg-slate-900/80">
            <div className="aspect-[4/3] overflow-hidden rounded-lg bg-white dark:bg-slate-900">
              {imageUrl ? (
                <img
                  src={imageUrl}
                  alt={alt}
                  className={`h-full w-full object-cover transition-transform duration-300 ${
                    isActive ? "scale-105" : ""
                  }`}
                  loading="lazy"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-metallic-gold-500 dark:text-ocean-mist-500">
                  <span className="text-sm">Sin imagen</span>
                </div>
              )}
            </div>
          </div>
          <div className="flex flex-1 flex-col p-5">
            <h3
              className={`line-clamp-2 font-medium ${
                isActive
                  ? "text-xl text-metallic-gold-900 dark:text-ocean-mist-50"
                  : "text-lg text-metallic-gold-800 dark:text-ocean-mist-100"
              }`}
            >
              {joya.name}
            </h3>
            <p className="mt-1 text-base text-metallic-gold-600 dark:text-ocean-mist-300">
              {joya.product_type?.name}
              {joya.material?.name ? ` · ${joya.material.name}` : null}
            </p>
            <div className="mt-auto pt-3">
              <p
                className={`font-medium ${
                  isActive
                    ? "text-xl text-metallic-gold-700 dark:text-ocean-mist-200"
                    : "text-lg text-metallic-gold-800 dark:text-ocean-mist-200"
                }`}
              >
                {formatCurrencyCOP(joya.final_price)}
              </p>
            </div>
          </div>
        </article>
      </Link>
    </div>
  );
};

interface CarouselProps {
  joyas: JoyaWithRelations[];
}

const FeaturedCarousel = ({ joyas }: CarouselProps) => {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, align: "center" }, [
    Autoplay({
      delay: 4000,
      stopOnInteraction: false,
    }),
  ]);

  const [selectedIndex, setSelectedIndex] = useState(0);
  const [scrollPrev, setScrollPrev] = useState(false);
  const [scrollNext, setScrollNext] = useState(false);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
    setScrollPrev(emblaApi.canScrollPrev());
    setScrollNext(emblaApi.canScrollNext());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);
  }, [emblaApi, onSelect]);

  const scrollPrevFn = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNextFn = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  return (
    <div className="relative group/carousel px-4 md:px-12 lg:px-16">
      <div className="overflow-hidden py-4" ref={emblaRef}>
        <div className="flex items-center">
          {joyas.map((joya, index) => (
            <ProductCard key={joya.id} joya={joya} isActive={index === selectedIndex} />
          ))}
        </div>
      </div>

      <button
        onClick={scrollPrevFn}
        disabled={!scrollPrev}
        className="absolute left-2 top-1/2 z-20 flex -translate-y-1/2 items-center justify-center rounded-full bg-white p-3 text-metallic-gold-800 shadow-lg transition-all hover:bg-metallic-gold-50 hover:scale-110 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:scale-100 dark:bg-slate-800 dark:text-ocean-mist-100 dark:hover:bg-slate-700 disabled:dark:opacity-30"
        aria-label="Producto anterior"
      >
        <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      <button
        onClick={scrollNextFn}
        disabled={!scrollNext}
        className="absolute right-2 top-1/2 z-20 flex -translate-y-1/2 items-center justify-center rounded-full bg-white p-3 text-metallic-gold-800 shadow-lg transition-all hover:bg-metallic-gold-50 hover:scale-110 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:scale-100 dark:bg-slate-800 dark:text-ocean-mist-100 dark:hover:bg-slate-700 disabled:dark:opacity-30"
        aria-label="Siguiente producto"
      >
        <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </button>

      <div className="mt-6 flex justify-center gap-2">
        {joyas.map((_, index) => (
          <button
            key={index}
            onClick={() => emblaApi?.scrollTo(index)}
            className={`h-2.5 rounded-full transition-all duration-300 ${
              index === selectedIndex
                ? "w-8 bg-metallic-gold-500 dark:bg-ocean-mist-300"
                : "w-2.5 bg-metallic-gold-300 hover:bg-metallic-gold-400 dark:bg-ocean-mist-500 dark:hover:bg-ocean-mist-400"
            }`}
            aria-label={`Ir a producto ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

export const FeaturedProducts = () => {
  const { joyas, isLoading, errorMessage } = useFeaturedJoyas();
  const displayed = joyas.slice(0, MAX_FEATURED);

  return (
    <section className="border-t border-metallic-gold-400/80 bg-metallic-gold-200 py-16 dark:border-ocean-mist-800 dark:bg-ocean-mist-800">
      <div className="mx-auto max-w-6xl px-4">
        <h2 className="text-center font-serif text-3xl font-light tracking-tight text-metallic-gold-900 dark:text-ocean-mist-100 sm:text-4xl">
          Productos destacados
        </h2>
        <p className="mx-auto mt-3 max-w-2xl text-center text-base text-metallic-gold-700 dark:text-ocean-mist-300">
          Una selección de piezas que nos gustaría que conocieras.
        </p>

        <div className="mt-10">
          {isLoading && (
            <div className="flex min-h-[300px] items-center justify-center">
              <Spinner />
            </div>
          )}

          {!isLoading && errorMessage && (
            <p className="rounded-md border border-metallic-gold-400 bg-metallic-gold-50 px-4 py-3 text-center text-base text-metallic-gold-800 dark:border-ocean-mist-700 dark:bg-slate-900 dark:text-ocean-mist-200">
              {errorMessage}
            </p>
          )}

          {!isLoading && !errorMessage && displayed.length === 0 && (
            <p className="text-center text-base text-metallic-gold-700 dark:text-ocean-mist-300">
              Pronto verás aquí nuestras joyas destacadas.
            </p>
          )}

          {!isLoading && !errorMessage && displayed.length > 0 && (
            <FeaturedCarousel joyas={displayed} />
          )}

          {!isLoading && !errorMessage && (
            <div className="mt-12 flex justify-center">
              <Link
                to="/catalogo"
                className="inline-flex rounded-md bg-metallic-gold-500 px-5 py-2.5 text-base font-medium text-metallic-gold-950 transition hover:bg-metallic-gold-600 dark:bg-ocean-mist-400 dark:text-slate-950 dark:hover:bg-ocean-mist-300"
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
