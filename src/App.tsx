import { useEffect } from "react";
import { AppRouter } from "./router/AppRouter";
import { Navbar } from "./components/layout/Navbar";
import { Footer } from "./components/layout/Footer";
import { SettingsProvider, useSettingsContext } from "./context/SettingsContext";
import { FiltrosProvider } from "./context/FiltrosContext";

const AppContent = () => {
  const { settings } = useSettingsContext();

  useEffect(() => {
    const name = settings?.business_name || "D´mur Joyería";
    document.title = name;
  }, [settings?.business_name]);

  return (
    <div className="flex min-h-screen flex-col bg-metallic-gold-50 text-metallic-gold-900 dark:bg-slate-950 dark:text-slate-50">
      <Navbar />
      <div className="flex-1">
        <AppRouter />
      </div>
      <Footer />
    </div>
  );
};

function App() {
  return (
    <SettingsProvider>
      <FiltrosProvider>
        <AppContent />
      </FiltrosProvider>
    </SettingsProvider>
  );
}

export default App;
