import { Link } from "react-router-dom";
import type { JoyaWithRelations } from "../../types/joya.types";
import { formatCurrencyCOP } from "../../utils/formatters";
import { useCarrito } from "../../hooks/useCarrito";
import { Button } from "../ui/Button";

interface JoyaCardProps {
  joya: JoyaWithRelations;
}

export const JoyaCard = ({ joya }: JoyaCardProps) => {
  const imageUrl = joya.primary_image?.public_url ?? null;
  const alt = joya.name;
  const { addItem } = useCarrito();

  const handleAddToCart = () => {
    addItem({ product: joya, quantity: 1 });
  };

  return (
    <article className="group relative overflow-hidden rounded-lg border border-metallic-gold-400 bg-white shadow-sm transition-all duration-300 hover:shadow-md dark:border-ocean-mist-800 dark:bg-slate-900/80">
      <Link to={`/joya/${joya.slug ?? joya.id}`}>
        <div className="aspect-square bg-metallic-gold-100 dark:bg-slate-800">
          {imageUrl ? (
            <img
              src={imageUrl}
              alt={alt}
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
              loading="lazy"
            />
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
      </Link>
      <div className="px-4 pb-4">
        <Button onClick={handleAddToCart} className="w-full justify-center text-sm">
          Agregar al carrito
        </Button>
      </div>
    </article>
  );
};
