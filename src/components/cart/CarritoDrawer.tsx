import { CarritoItemComponent } from "./CarritoItem";
import { BotonContactar } from "./BotonContactar";
import { useCarrito } from "../../hooks/useCarrito";

export const CarritoDrawer = () => {
  const { items, removeItem, updateItem, clear } = useCarrito();

  const handleUpdateQuantity = (productId: string, newQuantity: number) => {
    updateItem(productId, newQuantity);
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold text-metallic-gold-900 dark:text-ocean-mist-100 mb-6">
        Tu Carrito
      </h2>

      {items.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-metallic-gold-600 dark:text-ocean-mist-300">Tu carrito está vacío.</p>
          <a
            href="/catalogo"
            className="mt-4 inline-block text-metallic-gold-700 dark:text-ocean-mist-300 underline hover:text-metallic-gold-800"
          >
            Explora nuestro catálogo
          </a>
        </div>
      ) : (
        <>
          <div className="space-y-4 mb-6">
            {items.map((item) => (
              <CarritoItemComponent
                key={item.product.id}
                item={item}
                onRemove={removeItem}
                onUpdateQuantity={handleUpdateQuantity}
              />
            ))}
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-between items-center border-t border-metallic-gold-300 dark:border-ocean-mist-700 pt-6">
            <button
              onClick={clear}
              className="text-sm text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
            >
              Vaciar carrito
            </button>
            <BotonContactar items={items} className="w-full sm:w-auto" />
          </div>
        </>
      )}
    </div>
  );
};
