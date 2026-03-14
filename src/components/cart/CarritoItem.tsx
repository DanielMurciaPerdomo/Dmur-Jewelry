import type { CarritoItem as CarritoItemType } from "../../types/joya.types";
import { formatCurrencyCOP } from "../../utils/formatters";

interface CarritoItemComponentProps {
  item: CarritoItemType;
  onRemove: (productId: string) => void;
  onUpdateQuantity: (productId: string, newQuantity: number) => void;
}

export const CarritoItemComponent = ({
  item,
  onRemove,
  onUpdateQuantity,
}: CarritoItemComponentProps) => {
  const { product, quantity } = item;
  const imageUrl = product.primary_image?.public_url ?? null;
  const alt = product.name;

  return (
    <article className="flex gap-4 p-4 border border-metallic-gold-300 bg-white rounded-lg shadow-sm dark:border-ocean-mist-800 dark:bg-slate-900/80">
      {/* Imagen */}
      <div className="w-20 h-20 flex-shrink-0 overflow-hidden rounded-md bg-metallic-gold-100 dark:bg-slate-800">
        {imageUrl ? (
          <img src={imageUrl} alt={alt} className="h-full w-full object-cover" loading="lazy" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-metallic-gold-500 dark:text-ocean-mist-600 text-xs">
            Sin imagen
          </div>
        )}
      </div>

      {/* Información */}
      <div className="flex-1 min-w-0">
        <h3 className="text-base font-medium text-metallic-gold-900 dark:text-ocean-mist-100 truncate">
          {product.name}
        </h3>
        <p className="text-sm text-metallic-gold-600 dark:text-ocean-mist-400 mt-0.5">
          {product.product_type?.name || "Tipo no especificado"}
          {product.material?.name ? ` · ${product.material.name}` : ""}
        </p>

        {/* Precio y cantidad */}
        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center gap-2">
            <button
              onClick={() => onUpdateQuantity(product.id, Math.max(1, quantity - 1))}
              className="w-7 h-7 flex items-center justify-center rounded bg-metallic-gold-200 dark:bg-ocean-mist-700 text-metallic-gold-900 dark:text-ocean-mist-100 hover:bg-metallic-gold-300 dark:hover:bg-ocean-mist-600 transition-colors"
              aria-label="Reducir cantidad"
            >
              −
            </button>
            <span className="w-8 text-center text-base text-metallic-gold-900 dark:text-ocean-mist-100">
              {quantity}
            </span>
            <button
              onClick={() => onUpdateQuantity(product.id, quantity + 1)}
              className="w-7 h-7 flex items-center justify-center rounded bg-metallic-gold-200 dark:bg-ocean-mist-700 text-metallic-gold-900 dark:text-ocean-mist-100 hover:bg-metallic-gold-300 dark:hover:bg-ocean-mist-600 transition-colors"
              aria-label="Aumentar cantidad"
            >
              +
            </button>
          </div>

          <div className="text-right">
            <p className="text-sm text-metallic-gold-600 dark:text-ocean-mist-400">
              {formatCurrencyCOP(product.final_price)} x {quantity}
            </p>
            <p className="text-base font-semibold text-metallic-gold-900 dark:text-ocean-mist-100">
              {formatCurrencyCOP(product.final_price * quantity)}
            </p>
          </div>
        </div>
      </div>

      {/* Botón eliminar */}
      <button
        onClick={() => onRemove(product.id)}
        className="self-start text-metallic-gold-500 hover:text-red-600 dark:text-ocean-mist-400 dark:hover:text-red-400 transition-colors"
        aria-label="Eliminar producto"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
            clipRule="evenodd"
          />
        </svg>
      </button>
    </article>
  );
};
