import { useEffect, useState, useCallback } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { fetchProductBySlug } from "../services/joyasService";
import type { JoyaWithRelations } from "../types/joya.types";
import { formatCurrencyCOP } from "../utils/formatters";
import { buildSingleProductMessage, buildWhatsappUrl } from "../utils/whatsapp";
import { useCarrito } from "../hooks/useCarrito";
import { useSettingsContext } from "../context/SettingsContext";
import { Button } from "../components/ui/Button";
import { Spinner } from "../components/ui/Spinner";

export const DetalleJoya = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { addItem } = useCarrito();
  const { settings } = useSettingsContext();

  const [joya, setJoya] = useState<JoyaWithRelations | null>(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadProduct = useCallback(async () => {
    if (!slug) {
      setError("Producto no encontrado");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const product = await fetchProductBySlug(slug);
      if (!product) {
        setError(
          "No encontramos este producto. Puede que haya sido eliminado o no esté disponible."
        );
        setLoading(false);
        return;
      }
      setJoya(product);
      setCurrentImageIndex(0);
    } catch {
      setError("Error al cargar el producto. Por favor intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    loadProduct();
  }, [loadProduct]);

  const handlePreviousImage = () => {
    if (!joya) return;
    setCurrentImageIndex((prev) => (prev === 0 ? joya.images.length - 1 : prev - 1));
  };

  const handleNextImage = () => {
    if (!joya) return;
    setCurrentImageIndex((prev) => (prev === joya.images.length - 1 ? 0 : prev + 1));
  };

  const handleAddToCart = () => {
    if (!joya) return;
    addItem({ product: joya, quantity: 1 });
  };

  const handleWhatsApp = () => {
    if (!joya || !settings?.whatsapp_number) return;
    const message = buildSingleProductMessage(joya);
    const url = buildWhatsappUrl(settings.whatsapp_number, message);
    window.open(url, "_blank");
  };

  if (loading) {
    return (
      <main className="flex min-h-[60vh] items-center justify-center">
        <Spinner />
      </main>
    );
  }

  if (error || !joya) {
    return (
      <main className="mx-auto max-w-2xl p-6">
        <div className="rounded-lg border border-metallic-gold-200 bg-white p-8 text-center shadow-sm dark:border-ocean-mist-700 dark:bg-slate-900">
          <svg
            className="mx-auto h-16 w-16 text-metallic-gold-400 dark:text-ocean-mist-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M12 2a10 10 0 100 20 10 10 0 000-20z"
            />
          </svg>
          <h2 className="mt-4 text-xl font-semibold text-metallic-gold-900 dark:text-ocean-mist-100">
            {error || "Producto no encontrado"}
          </h2>
          <p className="mt-2 text-metallic-gold-600 dark:text-ocean-mist-400">
            Lo sentimos, no pudimos cargar los detalles de este producto.
          </p>
          <div className="mt-6 flex justify-center gap-4">
            <Button onClick={() => navigate("/catalogo")}>Volver al Catálogo</Button>
          </div>
        </div>
      </main>
    );
  }

  const currentImage = joya.images[currentImageIndex];
  const whatsappNumber = settings?.whatsapp_number || "573000000000";
  const whatsappMessage = buildSingleProductMessage(joya);
  const whatsappUrl = buildWhatsappUrl(whatsappNumber, whatsappMessage);

  return (
    <main className="mx-auto max-w-6xl p-6">
      <nav className="mb-6 flex items-center gap-2 text-sm text-metallic-gold-600 dark:text-ocean-mist-400">
        <Link
          to="/catalogo"
          className="transition-colors hover:text-metallic-gold-800 dark:hover:text-ocean-mist-200"
        >
          Catálogo
        </Link>
        <span>/</span>
        <span className="text-metallic-gold-800 dark:text-ocean-mist-200">{joya.name}</span>
      </nav>

      <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
        <div className="space-y-4">
          <div className="relative overflow-hidden rounded-lg border border-metallic-gold-200 bg-metallic-gold-100 dark:border-ocean-mist-700 dark:bg-slate-800">
            {joya.images.length > 0 && currentImage?.public_url ? (
              <img
                src={currentImage.public_url}
                alt={`${joya.name} - Imagen ${currentImageIndex + 1}`}
                className="aspect-square w-full object-cover"
              />
            ) : (
              <div className="flex aspect-square w-full items-center justify-center">
                <span className="text-metallic-gold-500 dark:text-ocean-mist-600">
                  Sin imagen disponible
                </span>
              </div>
            )}

            {joya.images.length > 1 && (
              <>
                <button
                  onClick={handlePreviousImage}
                  className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-2 shadow-md transition hover:bg-white dark:bg-slate-800/90 dark:hover:bg-slate-800"
                  aria-label="Imagen anterior"
                >
                  <svg
                    className="h-5 w-5 text-metallic-gold-800 dark:text-ocean-mist-100"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 19l-7-7 7-7"
                    />
                  </svg>
                </button>
                <button
                  onClick={handleNextImage}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-white/90 p-2 shadow-md transition hover:bg-white dark:bg-slate-800/90 dark:hover:bg-slate-800"
                  aria-label="Siguiente imagen"
                >
                  <svg
                    className="h-5 w-5 text-metallic-gold-800 dark:text-ocean-mist-100"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                </button>
              </>
            )}
          </div>

          {joya.images.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-2">
              {joya.images.map((image, index) => (
                <button
                  key={image.id}
                  onClick={() => setCurrentImageIndex(index)}
                  className={`relative flex-shrink-0 overflow-hidden rounded-md border-2 transition-all ${
                    index === currentImageIndex
                      ? "border-metallic-gold-500 ring-2 ring-metallic-gold-400 dark:border-ocean-mist-500 dark:ring-ocean-mist-400"
                      : "border-transparent hover:border-metallic-gold-300 dark:hover:border-ocean-mist-600"
                  }`}
                >
                  <img
                    src={image.public_url || ""}
                    alt={`Miniatura ${index + 1}`}
                    className="h-16 w-16 object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-6">
          <div>
            <p className="text-sm font-medium uppercase tracking-wider text-metallic-gold-500 dark:text-ocean-mist-400">
              {joya.product_type?.name}
            </p>
            <h1 className="mt-2 text-3xl font-bold text-metallic-gold-900 dark:text-ocean-mist-100">
              {joya.name}
            </h1>
            <p className="mt-2 text-3xl font-semibold text-metallic-gold-600 dark:text-ocean-mist-300">
              {formatCurrencyCOP(joya.final_price)}
            </p>
          </div>

          <div className="space-y-4 rounded-lg border border-metallic-gold-200 bg-white p-5 shadow-sm dark:border-ocean-mist-700 dark:bg-slate-900/50">
            <h3 className="text-lg font-semibold text-metallic-gold-800 dark:text-ocean-mist-100">
              Detalles del Producto
            </h3>
            <dl className="space-y-3">
              <div className="flex justify-between">
                <dt className="text-metallic-gold-600 dark:text-ocean-mist-400">Material</dt>
                <dd className="font-medium text-metallic-gold-900 dark:text-ocean-mist-100">
                  {joya.material?.name || "No especificado"}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-metallic-gold-600 dark:text-ocean-mist-400">Tipo</dt>
                <dd className="font-medium text-metallic-gold-900 dark:text-ocean-mist-100">
                  {joya.product_type?.name}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-metallic-gold-600 dark:text-ocean-mist-400">Peso</dt>
                <dd className="font-medium text-metallic-gold-900 dark:text-ocean-mist-100">
                  {joya.weight_grams.toFixed(2)} g
                </dd>
              </div>
            </dl>
          </div>

          {joya.stones && joya.stones.length > 0 && (
            <div className="space-y-4 rounded-lg border border-metallic-gold-200 bg-white p-5 shadow-sm dark:border-ocean-mist-700 dark:bg-slate-900/50">
              <h3 className="text-lg font-semibold text-metallic-gold-800 dark:text-ocean-mist-100">
                Piedras
              </h3>
              <ul className="space-y-2">
                {joya.stones.map((stone) => (
                  <li key={stone.id} className="flex items-center justify-between text-sm">
                    <span className="text-metallic-gold-700 dark:text-ocean-mist-300">
                      {stone.stone_type}
                      {stone.stone_size && ` (${stone.stone_size})`}
                    </span>
                    <span className="font-medium text-metallic-gold-600 dark:text-ocean-mist-400">
                      x{stone.quantity}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {joya.description && (
            <div className="space-y-2">
              <h3 className="text-lg font-semibold text-metallic-gold-800 dark:text-ocean-mist-100">
                Descripción
              </h3>
              <p className="text-metallic-gold-600 dark:text-ocean-mist-300">{joya.description}</p>
            </div>
          )}

          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              onClick={handleAddToCart}
              className="flex flex-1 items-center justify-center gap-2 rounded-md bg-metallic-gold-500 px-4 py-2.5 text-sm font-medium text-metallic-gold-950 shadow-sm transition hover:bg-metallic-gold-600 focus:outline-none focus:ring-2 focus:ring-metallic-gold-400 focus:ring-offset-2 dark:bg-ocean-mist-500 dark:text-slate-950 dark:hover:bg-ocean-mist-400 dark:focus:ring-ocean-mist-500 dark:focus:ring-offset-slate-950"
            >
              <svg
                className="h-5 w-5 flex-shrink-0"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
              Agregar al Carrito
            </button>
            <button
              onClick={handleWhatsApp}
              className="flex flex-1 items-center justify-center gap-2 rounded-md bg-green-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
            >
              <svg className="h-5 w-5 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              Contactar por WhatsApp
            </button>
          </div>

          <button
            onClick={() => navigate("/catalogo")}
            className="flex w-full items-center justify-center gap-2 rounded-md border border-metallic-gold-300 bg-transparent px-4 py-2 text-sm font-medium text-metallic-gold-700 transition hover:bg-metallic-gold-100 focus:outline-none focus:ring-2 focus:ring-metallic-gold-400 focus:ring-offset-2 dark:border-ocean-mist-600 dark:text-ocean-mist-300 dark:hover:bg-ocean-mist-900/30"
          >
            Volver al Catálogo
          </button>
        </div>
      </div>
    </main>
  );
};
