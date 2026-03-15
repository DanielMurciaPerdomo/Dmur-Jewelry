import { useSettingsContext } from "../../context/SettingsContext";

export const About = () => {
  const { settings } = useSettingsContext();
  const businessName = settings?.business_name || "Dmur Jewelry";

  return (
    <section className="border-t border-metallic-gold-400/80 bg-metallic-gold-200 py-16 dark:border-ocean-mist-800 dark:bg-slate-950">
      <div className="mx-auto max-w-3xl px-4">
        <h2 className="text-center font-serif text-3xl font-light tracking-tight text-metallic-gold-900 dark:text-ocean-mist-100 sm:text-4xl">
          Sobre nosotros
        </h2>
        <div className="mt-10 space-y-4 text-left text-lg text-metallic-gold-800/95 dark:text-ocean-mist-200/90">
          <p className="leading-relaxed">
            En{" "}
            <strong className="font-medium text-metallic-gold-900 dark:text-ocean-mist-100">
              {businessName}
            </strong>{" "}
            creemos que una joya debe contar una historia. Trabajamos con dedicación para ofrecer
            piezas que combinan diseño atemporal y acabados cuidados, pensadas para quienes buscan
            algo más que un accesorio.
          </p>
          <p className="leading-relaxed">
            Nuestro enfoque es artesanal y personalizado: escuchamos lo que buscas y te acompañamos
            en la elección o en el diseño a medida, para que el resultado refleje tu estilo y
            momentos únicos.
          </p>
          <p className="leading-relaxed">
            Seleccionamos materiales de calidad —oro, plata y aceros que cumplen estándares
            exigentes— y cuidamos cada detalle para que lleves contigo una pieza hecha para durar.
          </p>
        </div>
      </div>
    </section>
  );
};
