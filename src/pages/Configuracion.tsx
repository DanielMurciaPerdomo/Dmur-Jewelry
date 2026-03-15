import { useState, useEffect } from "react";
import { getSettings, updateSettings, Settings } from "../services/settingsService";
import { Button } from "../components/ui/Button";
import { Spinner } from "../components/ui/Spinner";

export const Configuracion = () => {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [settings, setSettings] = useState<Settings | null>(null);
  const [formData, setFormData] = useState({
    whatsapp_number: "",
    currency: "",
    business_name: "",
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      setLoading(true);
      const data = await getSettings();
      setSettings(data);
      if (data) {
        setFormData({
          whatsapp_number: data.whatsapp_number || "",
          currency: data.currency || "",
          business_name: data.business_name || "",
        });
      }
    } catch (err) {
      setError("Error al cargar la configuración.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);
    setSubmitting(true);

    try {
      if (!settings) {
        throw new Error("No se pudo obtener la configuración actual.");
      }
      await updateSettings(settings.id, formData);
      setSuccess(true);
      // Hide success message after 3 seconds
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError("Error al guardar la configuración.");
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-metallic-gold-900 dark:text-ocean-mist-100 mb-6">
        Configuración
      </h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white dark:bg-slate-900 p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4 text-metallic-gold-900 dark:text-ocean-mist-100">
            Información de Contacto
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-metallic-gold-700 dark:text-ocean-mist-300 mb-1">
                Número de WhatsApp
              </label>
              <input
                type="text"
                name="whatsapp_number"
                value={formData.whatsapp_number}
                onChange={handleChange}
                placeholder="Ej: 5491112345678"
                className="w-full px-3 py-2 border border-metallic-gold-300 dark:border-ocean-mist-600 rounded-md bg-white dark:bg-slate-800 text-metallic-gold-900 dark:text-ocean-mist-100 focus:outline-none focus:ring-2 focus:ring-metallic-gold-500"
              />
              <p className="mt-1 text-xs text-metallic-gold-500 dark:text-ocean-mist-400">
                Incluye el código de país sin espacios ni símbolos.
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-metallic-gold-700 dark:text-ocean-mist-300 mb-1">
                Nombre del Negocio
              </label>
              <input
                type="text"
                name="business_name"
                value={formData.business_name}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-metallic-gold-300 dark:border-ocean-mist-600 rounded-md bg-white dark:bg-slate-800 text-metallic-gold-900 dark:text-ocean-mist-100 focus:outline-none focus:ring-2 focus:ring-metallic-gold-500"
              />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4 text-metallic-gold-900 dark:text-ocean-mist-100">
            Moneda
          </h2>
          <div>
            <label className="block text-sm font-medium text-metallic-gold-700 dark:text-ocean-mist-300 mb-1">
              Símbolo de Moneda
            </label>
            <input
              type="text"
              name="currency"
              value={formData.currency}
              onChange={handleChange}
              placeholder="$"
              className="w-full px-3 py-2 border border-metallic-gold-300 dark:border-ocean-mist-600 rounded-md bg-white dark:bg-slate-800 text-metallic-gold-900 dark:text-ocean-mist-100 focus:outline-none focus:ring-2 focus:ring-metallic-gold-500 w-24"
            />
          </div>
        </div>

        {error && <div className="text-red-500 text-center">{error}</div>}
        {success && (
          <div className="text-green-600 text-center bg-green-100 dark:bg-green-900 dark:text-green-200 p-3 rounded-md">
            Configuración guardada exitosamente.
          </div>
        )}

        <div className="flex justify-end">
          <Button type="submit" disabled={submitting}>
            {submitting ? <Spinner /> : "Guardar Cambios"}
          </Button>
        </div>
      </form>
    </div>
  );
};
