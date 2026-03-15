import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { Button } from "../ui/Button";
import { Spinner } from "../ui/Spinner";

export const AdminLogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { signIn } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      await signIn({ email, password });
      navigate("/admin");
    } catch (err) {
      setError("Credenciales inválidas. Por favor, intenta de nuevo.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-metallic-gold-50 dark:bg-slate-950 p-4">
      <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-lg shadow-lg p-8">
        <h1 className="text-2xl font-bold text-center text-metallic-gold-900 dark:text-ocean-mist-100 mb-6">
          Iniciar Sesión
        </h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-metallic-gold-700 dark:text-ocean-mist-300 mb-1"
            >
              Correo Electrónico
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-metallic-gold-300 dark:border-ocean-mist-600 rounded-md bg-white dark:bg-slate-800 text-metallic-gold-900 dark:text-ocean-mist-100 focus:outline-none focus:ring-2 focus:ring-metallic-gold-500"
              required
            />
          </div>
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-metallic-gold-700 dark:text-ocean-mist-300 mb-1"
            >
              Contraseña
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-metallic-gold-300 dark:border-ocean-mist-600 rounded-md bg-white dark:bg-slate-800 text-metallic-gold-900 dark:text-ocean-mist-100 focus:outline-none focus:ring-2 focus:ring-metallic-gold-500"
              required
            />
          </div>
          {error && <div className="text-red-500 text-sm text-center">{error}</div>}
          <Button type="submit" className="w-full flex justify-center" disabled={isLoading}>
            {isLoading ? <Spinner /> : "Iniciar Sesión"}
          </Button>
        </form>
      </div>
    </div>
  );
};
