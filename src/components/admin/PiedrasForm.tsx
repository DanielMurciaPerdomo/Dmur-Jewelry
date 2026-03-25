import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Stone } from "../../types/joya.types";
import { createStone, updateStone, fetchStoneById } from "../../services/piedrasService";
import { Button } from "../ui/Button";
import { Spinner } from "../ui/Spinner";

export const PiedrasForm = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditing = !!id;

  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState<Omit<Stone, "id" | "created_at" | "updated_at">>({
    stone_type: "",
    stone_size: "",
    stone_value: 0,
  });

  useEffect(() => {
    if (isEditing && id) {
      const loadStone = async () => {
        setLoading(true);
        try {
          const stone = await fetchStoneById(id);
          if (stone) {
            setFormData({
              stone_type: stone.stone_type,
              stone_size: stone.stone_size,
              stone_value: stone.stone_value,
            });
          }
        } catch (err) {
          setError("Error al cargar la piedra.");
          console.error(err);
        } finally {
          setLoading(false);
        }
      };
      loadStone();
    }
  }, [id, isEditing]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const target = e.target;
    const { name, value, type } = target;
    const checked = (target as HTMLInputElement).checked;
    const newValue = type === "checkbox" ? checked : value;

    setFormData((prev) => ({
      ...prev,
      [name]: newValue,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      if (isEditing && id) {
        await updateStone(id, formData);
      } else {
        await createStone(formData);
      }
      navigate("/admin/piedras");
    } catch (err) {
      setError("Error al guardar la piedra.");
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
        {isEditing ? "Editar Piedra" : "Nueva Piedra"}
      </h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white dark:bg-slate-900 p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4 text-metallic-gold-900 dark:text-ocean-mist-100">
            Información de la Piedra
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-metallic-gold-700 dark:text-ocean-mist-300 mb-1">
                Tipo *
              </label>
              <input
                type="text"
                name="stone_type"
                value={formData.stone_type}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-metallic-gold-300 dark:border-ocean-mist-500 rounded-md bg-white dark:bg-slate-800 text-metallic-gold-900 dark:text-ocean-mist-100 focus:outline-none focus:ring-2 focus:ring-metallic-gold-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-metallic-gold-700 dark:text-ocean-mist-300 mb-1">
                Tamaño *
              </label>
              <input
                type="text"
                name="stone_size"
                value={formData.stone_size}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-metallic-gold-300 dark:border-ocean-mist-500 rounded-md bg-white dark:bg-slate-800 text-metallic-gold-900 dark:text-ocean-mist-100 focus:outline-none focus:ring-2 focus:ring-metallic-gold-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-metallic-gold-700 dark:text-ocean-mist-300 mb-1">
                Valor Base ($)
              </label>
              <input
                type="number"
                name="stone_value"
                value={formData.stone_value}
                onChange={handleChange}
                step="0.01"
                min="0"
                required
                className="w-full px-3 py-2 border border-metallic-gold-300 dark:border-ocean-mist-500 rounded-md bg-white dark:bg-slate-800 text-metallic-gold-900 dark:text-ocean-mist-100 focus:outline-none focus:ring-2 focus:ring-metallic-gold-500"
              />
            </div>
          </div>
        </div>

        {error && <div className="text-red-500 text-center">{error}</div>}

        <div className="flex justify-end space-x-4">
          <Button
            type="button"
            className="bg-gray-500 hover:bg-gray-600 text-white"
            onClick={() => navigate(-1)}
          >
            Cancelar
          </Button>
          <Button type="submit" disabled={submitting}>
            {submitting ? <Spinner /> : isEditing ? "Guardar Cambios" : "Crear Piedra"}
          </Button>
        </div>
      </form>
    </div>
  );
};
