import { Link } from "react-router-dom";
import { buildWhatsappUrl, FALLBACK_WHATSAPP_NUMBER } from "../../utils/whatsapp";
import logo from "../../assets/Dmur-logo.png";

type HeroProps = {
  whatsappNumber?: string | null;
  businessName?: string | null;
};

export const Hero = ({ whatsappNumber, businessName }: HeroProps) => {
  const number = whatsappNumber?.replace(/\D/g, "") || FALLBACK_WHATSAPP_NUMBER;
  const message = `Hola! Me gustaría conocer más sobre las piezas de ${businessName || "D´mur Joyería"}.`;
  const whatsappHref = buildWhatsappUrl(number, message);

  return (
    <section className="relative isolate min-h-[75vh] overflow-hidden">
      {/* Fondo: gradiente elegante; reemplazar por imagen local en src/assets cuando exista:
          style={{ backgroundImage: 'url(/hero-joyas.jpg)' }} + overlay */}
      <div
        className="absolute inset-0 bg-gradient-to-br from-metallic-gold-200 via-metallic-gold-100 to-white dark:from-slate-950 dark:via-slate-900 dark:to-slate-950"
        aria-hidden
      />
      <div
        className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-metallic-gold-200/40 via-transparent to-transparent dark:from-ocean-mist-900/20"
        aria-hidden
      />

      <div className="relative mx-auto flex min-h-[75vh] max-w-5xl flex-col items-center justify-center px-4 py-20 text-center">
        <img
          src={logo}
          alt="Logo D'mur Joyería"
          className="h-[154px] w-auto object-contain md:h-48 lg:h-60"
        />
        <p className="mt-2 text-sm font-medium uppercase tracking-[0.2em] text-metallic-gold-700 dark:text-ocean-mist-400">
          ARTESANAL
        </p>
        <p className="mt-4 max-w-xl text-lg text-metallic-gold-800/90 dark:text-ocean-mist-200/95 sm:text-xl">
          Elegancia en cada detalle. Piezas hechas a mano y personalizadas para acompañarte siempre.
        </p>

        <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Link
            to="/catalogo"
            className="inline-flex items-center justify-center rounded-md bg-metallic-gold-500 px-6 py-3 text-base font-medium text-metallic-gold-950 shadow-sm transition hover:bg-metallic-gold-600 dark:bg-ocean-mist-500 dark:text-slate-950 dark:hover:bg-ocean-mist-400"
          >
            Ver catálogo
          </Link>
          <a
            href={whatsappHref}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center rounded-md border border-metallic-gold-400 bg-white/80 px-6 py-3 text-base font-medium text-metallic-gold-900 backdrop-blur transition hover:bg-metallic-gold-100 dark:border-ocean-mist-600 dark:bg-slate-900/80 dark:text-ocean-mist-100 dark:hover:bg-slate-800"
          >
            Contactar al joyero
          </a>
        </div>
      </div>
    </section>
  );
};
