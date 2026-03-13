import { AppRouter } from "./router/AppRouter";
import { Navbar } from "./components/layout/Navbar";
import { Footer } from "./components/layout/Footer";

function App() {
  return (
    <div className="flex min-h-screen flex-col bg-metallic-gold-50 text-metallic-gold-900 dark:bg-slate-950 dark:text-slate-50">
      <Navbar />
      <div className="flex-1">
        <AppRouter />
      </div>
      <Footer />
    </div>
  );
}

export default App;
