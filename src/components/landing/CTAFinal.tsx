import { buildWhatsappUrl, FALLBACK_WHATSAPP_NUMBER } from "../../utils/whatsapp";

const CTA_MESSAGE = "Hola! Me gustaría diseñar o consultar una joya a medida con Dmur Jewelry.";

type CTAFinalProps = {
  whatsappNumber?: string | null;
};

export const CTAFinal = ({ whatsappNumber }: CTAFinalProps) => {
  const number = whatsappNumber?.replace(/\D/g, "") || FALLBACK_WHATSAPP_NUMBER;
  const href = buildWhatsappUrl(number, CTA_MESSAGE);

  return (
    <section className="bg-metallic-gold-700 py-16 dark:bg-metallic-gold-700">
      <div className="mx-auto max-w-3xl px-4 text-center">
        <h2 className="font-serif text-3xl font-light tracking-tight text-metallic-gold-50 sm:text-4xl dark:text-ocean-mist-100">
          ¿Buscas algo especial?
        </h2>
        <p className="mt-3 text-xl text-metallic-gold-100/90 dark:text-ocean-mist-200/90">
          Diseñamos tu joya a medida. Cuéntanos tu idea y te acompañamos en el proceso.
        </p>
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-8 inline-flex items-center justify-center rounded-md bg-metallic-gold-500 px-8 py-3 text-base font-medium text-metallic-gold-950 shadow-lg transition hover:bg-metallic-gold-600 dark:bg-ocean-mist-500 dark:text-slate-950 dark:hover:bg-ocean-mist-400"
        >
          Contactar por WhatsApp
        </a>
      </div>
    </section>
  );
};
