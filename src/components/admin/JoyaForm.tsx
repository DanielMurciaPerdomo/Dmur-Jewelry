import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Joya, Material, ProductType } from "../../types/joya.types";
import {
  fetchProductById,
  createProduct,
  updateProduct,
  fetchProductTypes,
} from "../../services/joyasService";
import { fetchMaterials } from "../../services/materialsService";
import { Button } from "../ui/Button";
import { Spinner } from "../ui/Spinner";
import { ImageUploader } from "./ImageUploader";
import type { ProductImage } from "../../types/joya.types";
import { getProductImages } from "../../services/imagenesService";

export const JoyaForm = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditing = !!id;

  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [materials, setMaterials] = useState<Material[]>([]);
  const [productTypes, setProductTypes] = useState<ProductType[]>([]);
  const [images, setImages] = useState<ProductImage[]>([]);

  const [formData, setFormData] = useState<Omit<Joya, "id" | "created_at" | "updated_at">>({
    name: "",
    slug: "",
    description: "",
    material_id: "",
    product_type_id: "",
    sku: "",
    fixed_cost: 0,
    margin_percentage: 30,
    final_price: 0,
    active: true,
    featured: false,
  });

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [materialsData, typesData] = await Promise.all([
          fetchMaterials(),
          fetchProductTypes(),
        ]);
        setMaterials(materialsData);
        setProductTypes(typesData);

        if (isEditing && id) {
          const product = await fetchProductById(id);
          if (product) {
            setFormData({
              name: product.name,
              slug: product.slug || "",
              description: product.description || "",
              material_id: product.material_id,
              product_type_id: product.product_type_id,
              sku: product.sku || "",
              fixed_cost: product.fixed_cost,
              margin_percentage: product.margin_percentage,
              final_price: product.final_price,
              active: product.active,
              featured: product.featured,
            });
            const imagesData = await getProductImages(id);
            setImages(imagesData);
          }
        }
      } catch (err) {
        setError("Error al cargar los datos.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [id, isEditing]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const target = e.target;
    const { name, value, type } = target;
    const checked = (target as HTMLInputElement).checked;
    const newValue = type === "checkbox" ? checked : value;

    setFormData((prev) => {
      const updated = { ...prev, [name]: newValue };

      // Calcular precio final si cambian fixed_cost o margin_percentage
      if (name === "fixed_cost" || name === "margin_percentage") {
        const cost = name === "fixed_cost" ? parseFloat(value) || 0 : prev.fixed_cost;
        const margin =
          name === "margin_percentage" ? parseFloat(value) || 0 : prev.margin_percentage;
        updated.final_price = Math.round(cost * (1 + margin / 100) * 100) / 100;
      }

      return updated;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      let result: Joya;
      if (isEditing && id) {
        result = await updateProduct(id, formData);
      } else {
        result = await createProduct(formData);
      }
      navigate("/admin/productos");
    } catch (err) {
      setError("Error al guardar el producto.");
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
        {isEditing ? "Editar Producto" : "Nuevo Producto"}
      </h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white dark:bg-slate-900 p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4 text-metallic-gold-900 dark:text-ocean-mist-100">
            Información Básica
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
                className="w-full px-3 py-2 border border-metallic-gold-300 dark:border-ocean-mist-600 rounded-md bg-white dark:bg-slate-800 text-metallic-gold-900 dark:text-ocean-mist-100 focus:outline-none focus:ring-2 focus:ring-metallic-gold-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-metallic-gold-700 dark:text-ocean-mist-300 mb-1">
                SKU
              </label>
              <input
                type="text"
                name="sku"
                value={formData.sku || ""}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-metallic-gold-300 dark:border-ocean-mist-600 rounded-md bg-white dark:bg-slate-800 text-metallic-gold-900 dark:text-ocean-mist-100 focus:outline-none focus:ring-2 focus:ring-metallic-gold-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-metallic-gold-700 dark:text-ocean-mist-300 mb-1">
                Material *
              </label>
              <select
                name="material_id"
                value={formData.material_id || ""}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-metallic-gold-300 dark:border-ocean-mist-600 rounded-md bg-white dark:bg-slate-800 text-metallic-gold-900 dark:text-ocean-mist-100 focus:outline-none focus:ring-2 focus:ring-metallic-gold-500"
              >
                <option value="">Selecciona un material</option>
                {materials.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-metallic-gold-700 dark:text-ocean-mist-300 mb-1">
                Tipo de Producto *
              </label>
              <select
                name="product_type_id"
                value={formData.product_type_id || ""}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-metallic-gold-300 dark:border-ocean-mist-600 rounded-md bg-white dark:bg-slate-800 text-metallic-gold-900 dark:text-ocean-mist-100 focus:outline-none focus:ring-2 focus:ring-metallic-gold-500"
              >
                <option value="">Selecciona un tipo</option>
                {productTypes.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-metallic-gold-700 dark:text-ocean-mist-300 mb-1">
                Descripción
              </label>
              <textarea
                name="description"
                value={formData.description || ""}
                onChange={handleChange}
                rows={3}
                className="w-full px-3 py-2 border border-metallic-gold-300 dark:border-ocean-mist-600 rounded-md bg-white dark:bg-slate-800 text-metallic-gold-900 dark:text-ocean-mist-100 focus:outline-none focus:ring-2 focus:ring-metallic-gold-500"
              />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4 text-metallic-gold-900 dark:text-ocean-mist-100">
            Precios
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-metallic-gold-700 dark:text-ocean-mist-300 mb-1">
                Costo Fijo ($)
              </label>
              <input
                type="number"
                name="fixed_cost"
                value={formData.fixed_cost}
                onChange={handleChange}
                step="0.01"
                min="0"
                className="w-full px-3 py-2 border border-metallic-gold-300 dark:border-ocean-mist-600 rounded-md bg-white dark:bg-slate-800 text-metallic-gold-900 dark:text-ocean-mist-100 focus:outline-none focus:ring-2 focus:ring-metallic-gold-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-metallic-gold-700 dark:text-ocean-mist-300 mb-1">
                Margen (%)
              </label>
              <input
                type="number"
                name="margin_percentage"
                value={formData.margin_percentage}
                onChange={handleChange}
                step="0.01"
                min="0"
                className="w-full px-3 py-2 border border-metallic-gold-300 dark:border-ocean-mist-600 rounded-md bg-white dark:bg-slate-800 text-metallic-gold-900 dark:text-ocean-mist-100 focus:outline-none focus:ring-2 focus:ring-metallic-gold-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-metallic-gold-700 dark:text-ocean-mist-300 mb-1">
                Precio Final ($)
              </label>
              <input
                type="number"
                name="final_price"
                value={formData.final_price}
                onChange={handleChange}
                step="0.01"
                min="0"
                className="w-full px-3 py-2 border border-metallic-gold-300 dark:border-ocean-mist-600 rounded-md bg-white dark:bg-slate-800 text-metallic-gold-900 dark:text-ocean-mist-100 focus:outline-none focus:ring-2 focus:ring-metallic-gold-500"
              />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4 text-metallic-gold-900 dark:text-ocean-mist-100">
            Opciones
          </h2>
          <div className="flex space-x-6">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                name="active"
                checked={formData.active}
                onChange={handleChange}
                className="h-4 w-4 text-metallic-gold-600 focus:ring-metallic-gold-500 border-gray-300 rounded"
              />
              <span className="text-sm text-metallic-gold-700 dark:text-ocean-mist-300">
                Activo
              </span>
            </label>
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                name="featured"
                checked={formData.featured}
                onChange={handleChange}
                className="h-4 w-4 text-metallic-gold-600 focus:ring-metallic-gold-500 border-gray-300 rounded"
              />
              <span className="text-sm text-metallic-gold-700 dark:text-ocean-mist-300">
                Destacado
              </span>
            </label>
          </div>
        </div>

        {isEditing && id && (
          <div className="bg-white dark:bg-slate-900 p-6 rounded-lg shadow">
            <ImageUploader productId={id} existingImages={images} onImagesChange={setImages} />
          </div>
        )}

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
            {submitting ? <Spinner /> : isEditing ? "Guardar Cambios" : "Crear Producto"}
          </Button>
        </div>
      </form>
    </div>
  );
};
