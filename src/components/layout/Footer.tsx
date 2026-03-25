import logoLargo from "../../assets/Dmur-logo-largo.png";
import logoLargoDark from "../../assets/Dmur-logo-largo-dark.png";
import { useTheme } from "../../context/ThemeContext";

export const Footer = () => {
  const { theme } = useTheme();
  const logoSrc = theme === "dark" ? logoLargoDark : logoLargo;

  return (
    <footer className="border-t border-metallic-gold-400 bg-metallic-gold-400 dark:border-ocean-mist-700/60 dark:bg-slate-950/90">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-5 py-5 sm:flex-row">
        <div className="flex items-center gap-2">
          <img src={logoSrc} alt="Logo D'mur Joyería" className="h-12 w-auto object-contain mb-4" />
          <span className="font-serif text-xl text-metallic-gold-900 dark:text-ocean-mist-100">
            · {new Date().getFullYear()}
          </span>
        </div>
        <span className="font-serif text-xl text-metallic-gold-900 dark:text-ocean-mist-100">
          Todos los derechos reservados
        </span>
      </div>
    </footer>
  );
};
