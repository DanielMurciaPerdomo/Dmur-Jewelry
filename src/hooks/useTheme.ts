import { useEffect, useState } from "react";

type Theme = "light" | "dark";

const THEME_KEY = "dmur-theme";

export const useTheme = () => {
  const [theme, setTheme] = useState<Theme>("dark");

  useEffect(() => {
    const stored = window.localStorage.getItem(THEME_KEY) as Theme | null;
    if (stored === "light" || stored === "dark") {
      applyTheme(stored);
      setTheme(stored);
    } else {
      applyTheme("dark");
      setTheme("dark");
    }
  }, []);

  const toggleTheme = () => {
    const next: Theme = theme === "dark" ? "light" : "dark";
    applyTheme(next);
    window.localStorage.setItem(THEME_KEY, next);
    setTheme(next);
  };

  return { theme, toggleTheme };
};

const applyTheme = (theme: Theme) => {
  const root = document.documentElement;
  if (theme === "dark") {
    root.classList.add("dark");
  } else {
    root.classList.remove("dark");
  }
};

