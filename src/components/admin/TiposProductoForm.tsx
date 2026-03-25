import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ProductType } from "../../types/joya.types";
import {
  createProductType,
  updateProductType,
  fetchProductTypeById,
} from "../../services/productTypesService";
import { Button } from "../ui/Button";
import { Spinner } from "../ui/Spinner";
import { toPascalCase } from "../../utils/formatters";

export const TiposProductoForm = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditing = !!id;

  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState<Omit<ProductType, "id" | "created_at" | "updated_at">>({
    name: "",
    type_value: 0,
  });

  useEffect(() => {
    if (isEditing && id) {
      const loadProductType = async () => {
        setLoading(true);
        try {
          const pt = await fetchProductTypeById(id);
          if (pt) {
            setFormData({
              name: pt.name,
              type_value: pt.type_value,
            });
          }
        } catch (err) {
          setError("Error al cargar el tipo de producto.");
          console.error(err);
        } finally {
          setLoading(false);
        }
      };
      loadProductType();
    }
  }, [id, isEditing]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const target = e.target;
    const { name, value, type } = target;
    const newValue = type === "number" ? parseFloat(value) || 0 : value;

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
      const formDataPascal = {
        ...formData,
        name: toPascalCase(formData.name),
      };

      if (isEditing && id) {
        await updateProductType(id, formDataPascal);
      } else {
        await createProductType(formDataPascal);
      }
      navigate("/admin/tipos");
    } catch (err) {
      setError("Error al guardar el tipo de producto.");
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
        {isEditing ? "Editar Tipo de Producto" : "Nuevo Tipo de Producto"}
      </h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white dark:bg-slate-900 p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4 text-metallic-gold-900 dark:text-ocean-mist-100">
            Información del Tipo de Producto
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-metallic-gold-700 dark:text-ocean-mist-300 mb-1">
                Nombre *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-metallic-gold-300 dark:border-ocean-mist-500 rounded-md bg-white dark:bg-slate-800 text-metallic-gold-900 dark:text-ocean-mist-100 focus:outline-none focus:ring-2 focus:ring-metallic-gold-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-metallic-gold-700 dark:text-ocean-mist-300 mb-1">
                Valor ($)
              </label>
              <input
                type="number"
                name="type_value"
                value={formData.type_value}
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
            {submitting ? <Spinner /> : isEditing ? "Guardar Cambios" : "Crear Tipo"}
          </Button>
        </div>
      </form>
    </div>
  );
};
