import { useEffect } from "react";
import { AppRouter } from "./router/AppRouter";
import { Navbar } from "./components/layout/Navbar";
import { Footer } from "./components/layout/Footer";
import { SettingsProvider, useSettingsContext } from "./context/SettingsContext";

const AppContent = () => {
  const { settings } = useSettingsContext();

  useEffect(() => {
    if (settings?.business_name) {
      document.title = settings.business_name;
    }
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
      <AppContent />
    </SettingsProvider>
  );
}

export default App;
