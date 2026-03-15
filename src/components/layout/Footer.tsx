import { useSettingsContext } from "../../context/SettingsContext";

export const Footer = () => {
  const { settings } = useSettingsContext();
  const businessName = settings?.business_name || "Joyas";

  return (
    <footer className="border-t border-metallic-gold-400 bg-metallic-gold-400 dark:border-ocean-mist-800/60 dark:bg-slate-950/90">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-5 py-5 font-serif text-xl text-metallic-gold-900 dark:text-ocean-mist-100 sm:flex-row">
        <span>
          {businessName} · {new Date().getFullYear()}
        </span>
        <span>Todos los derechos reservados</span>
      </div>
    </footer>
  );
};
