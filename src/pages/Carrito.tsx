import { CarritoDrawer } from "../components/cart/CarritoDrawer";

export const CarritoPage = () => {
  return (
    <main className="mx-auto max-w-4xl p-6">
      <h1 className="text-3xl font-bold tracking-tight text-metallic-gold-900 dark:text-ocean-mist-100 sm:text-4xl">
        Carrito de Interés
      </h1>
      <p className="mt-2 text-lg text-metallic-gold-700 dark:text-ocean-mist-300">
        Revisa tu selección y contáctanos por WhatsApp para comprar.
      </p>
      <div className="mt-8">
        <CarritoDrawer />
      </div>
    </main>
  );
};
