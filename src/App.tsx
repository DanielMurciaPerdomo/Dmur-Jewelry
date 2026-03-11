import { AppRouter } from "./router/AppRouter";
import { Navbar } from "./components/layout/Navbar";
import { Footer } from "./components/layout/Footer";

function App() {
  return (
    <div className="flex min-h-screen flex-col bg-slate-950 text-slate-50">
      <Navbar />
      <div className="flex-1">
        <AppRouter />
      </div>
      <Footer />
    </div>
  );
}

export default App;
