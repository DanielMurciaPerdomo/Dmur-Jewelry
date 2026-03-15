import { useState, useEffect } from "react";
import type { CarritoItem } from "../../types/joya.types";
import {
  buildWhatsappMessage,
  buildWhatsappUrl,
  FALLBACK_WHATSAPP_NUMBER,
} from "../../utils/whatsapp";
import { getSettings } from "../../services/settingsService";
import { formatCurrencyCOP } from "../../utils/formatters";

interface BotonContactarProps {
  items: CarritoItem[];
  className?: string;
}

export const BotonContactar = ({ items, className = "" }: BotonContactarProps) => {
  const [whatsappUrl, setWhatsappUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const obtenerNumeroWhatsApp = async () => {
      setIsLoading(true);
      try {
        const settings = await getSettings();
        const numero = settings?.whatsapp_number ?? FALLBACK_WHATSAPP_NUMBER;
        const businessName = settings?.business_name || "nuestra joyería";
        const mensaje = buildWhatsappMessage(items, businessName);
        const url = buildWhatsappUrl(numero, mensaje);
        setWhatsappUrl(url);
      } catch (error) {
        // Fallback en caso de error
        const mensaje = buildWhatsappMessage(items, "nuestra joyería");
        const url = buildWhatsappUrl(FALLBACK_WHATSAPP_NUMBER, mensaje);
        setWhatsappUrl(url);
      } finally {
        setIsLoading(false);
      }
    };

    obtenerNumeroWhatsApp();
  }, [items]);

  const total = items.reduce((sum, item) => sum + item.product.final_price * item.quantity, 0);

  return (
    <div className={`flex flex-col gap-3 ${className}`}>
      <div className="flex justify-between text-base">
        <span className="text-metallic-gold-700 dark:text-ocean-mist-300">Total:</span>
        <span className="font-semibold text-metallic-gold-900 dark:text-ocean-mist-100">
          {formatCurrencyCOP(total)}
        </span>
      </div>
      {whatsappUrl ? (
        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center justify-center gap-2 rounded-md bg-green-600 px-5 py-3 text-base font-medium text-white transition-colors hover:bg-green-700 dark:bg-green-500 dark:text-slate-900 dark:hover:bg-green-400"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
          </svg>
          <span>Contactar por WhatsApp</span>
        </a>
      ) : (
        <span className="inline-flex items-center justify-center gap-2 rounded-md bg-metallic-gold-200 px-5 py-3 text-base font-medium text-metallic-gold-700 opacity-50 cursor-not-allowed dark:bg-ocean-mist-800 dark:text-ocean-mist-400">
          Cargando...
        </span>
      )}
    </div>
  );
};
