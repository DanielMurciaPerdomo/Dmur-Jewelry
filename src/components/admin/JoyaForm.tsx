import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Joya, ProductStone, Stone } from "../../types/joya.types";
import {
  fetchProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} from "../../services/joyasService";
import { createStone } from "../../services/piedrasService";
import {
  fetchProductStones,
  createProductStone,
  updateProductStone,
  deleteProductStone,
  deleteProductStonesByProduct,
} from "../../services/productStonesService";
import { Button } from "../ui/Button";
import { Spinner } from "../ui/Spinner";
import { ImageUploader } from "./ImageUploader";
import type { ProductImage } from "../../types/joya.types";
import { getProductImages } from "../../services/imagenesService";
import { useMaterials } from "../../hooks/useMaterials";
import { useProductTypes } from "../../hooks/useProductTypes";
import { useStones } from "../../hooks/useStones";

export const JoyaForm = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditing = !!id;

  // Helper to get temp product ID from session storage
  const getTempProductId = () => sessionStorage.getItem("tempNewProductId");
  const setTempProductId = (productId: string) =>
    sessionStorage.setItem("tempNewProductId", productId);
  const clearTempProductId = () => sessionStorage.removeItem("tempNewProductId");

  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Use hooks for data fetching with global caching
  const { materials, isLoading: materialsLoading } = useMaterials();
  const { productTypes, isLoading: typesLoading } = useProductTypes();
  const { stones: allStones, isLoading: stonesLoading, addStoneToCache } = useStones();

  const [images, setImages] = useState<ProductImage[]>([]);

  // Stones management
  const [productStones, setProductStones] = useState<(ProductStone & { stone?: Stone })[]>([]);
  const [newStoneName, setNewStoneName] = useState("");
  const [newStoneSize, setNewStoneSize] = useState("");
  const [newStoneValue, setNewStoneValue] = useState<number>(0);
  const [showNewStoneForm, setShowNewStoneForm] = useState(false);

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
    phy_url: "",
  });

  useEffect(() => {
    const loadData = async () => {
      // Only set loading if any data is still loading
      if (materialsLoading || typesLoading || stonesLoading) {
        setLoading(true);
      }

      try {
        // Wait for all data to be loaded from hooks (cached or fetched)
        if (materialsLoading || typesLoading || stonesLoading) {
          return;
        }

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
              phy_url: product.phy_url || "",
            });
            const [imagesData, productStonesData] = await Promise.all([
              getProductImages(id),
              fetchProductStones(id),
            ]);
            setImages(imagesData);

            // Map product stones with stone details
            const mappedStones = productStonesData.map((ps) => {
              const stone = allStones.find((s: Stone) => s.id === ps.stone_id);
              return { ...ps, stone };
            });
            setProductStones(mappedStones);
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
  }, [id, isEditing, materialsLoading, typesLoading, stonesLoading, allStones]);

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

  // Stone management functions
  const handleAddExistingStone = (stoneId: string) => {
    const stone = allStones.find((s) => s.id === stoneId);
    if (!stone) return;

    // Check if already added
    if (productStones.some((ps) => ps.stone_id === stoneId)) {
      alert("Esta piedra ya está agregada al producto.");
      return;
    }

    const newProductStone: ProductStone & { stone?: Stone } = {
      id: "", // Will be generated by DB
      product_id: id || "",
      stone_id: stoneId,
      quantity: 1,
      created_at: "",
      updated_at: "",
      stone: stone,
    };

    setProductStones([...productStones, newProductStone]);
  };

  const handleCreateAndAddStone = async () => {
    if (!newStoneName || !newStoneSize) {
      alert("Por favor complete el nombre y tamaño de la piedra.");
      return;
    }

    try {
      const newStone = await createStone({
        stone_type: newStoneName,
        stone_size: newStoneSize,
        stone_value: newStoneValue,
      });

      // Add to all stones list (update global cache)
      addStoneToCache(newStone);

      // Add to product stones
      const newProductStone: ProductStone & { stone?: Stone } = {
        id: "",
        product_id: id || "",
        stone_id: newStone.id,
        quantity: 1,
        created_at: "",
        updated_at: "",
        stone: newStone,
      };

      setProductStones([...productStones, newProductStone]);

      // Reset form
      setNewStoneName("");
      setNewStoneSize("");
      setNewStoneValue(0);
      setShowNewStoneForm(false);
    } catch (err) {
      setError("Error al crear la piedra.");
      console.error(err);
    }
  };

  const handleRemoveStone = (stoneId: string) => {
    setProductStones(productStones.filter((ps) => ps.stone_id !== stoneId));
  };

  const handleUpdateStoneQuantity = (stoneId: string, quantity: number) => {
    setProductStones(
      productStones.map((ps) => (ps.stone_id === stoneId ? { ...ps, quantity } : ps))
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      let result: Joya;
      if (isEditing && id) {
        // Step 2: Save everything
        result = await updateProduct(id, formData);

        // Save stone associations
        await deleteProductStonesByProduct(id);
        for (const ps of productStones) {
          await createProductStone({
            product_id: id,
            stone_id: ps.stone_id,
            quantity: ps.quantity,
          });
        }

        // If this was a temporary product creation, clear the temp ID
        if (getTempProductId() === id) {
          clearTempProductId();
        }

        navigate("/admin/productos");
      } else {
        // Step 1: Save basic info and go to edit mode
        result = await createProduct(formData);
        // Store the temp ID for cancellation handling
        setTempProductId(result.id);
        navigate(`/admin/productos/${result.id}/editar`);
      }
    } catch (err) {
      setError("Error al guardar el producto.");
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = async () => {
    // If we are editing a product that was just created (has temp ID)
    if (isEditing && id && getTempProductId() === id) {
      try {
        // Delete the temporary product
        await deleteProduct(id);
        clearTempProductId();
      } catch (err) {
        console.error("Error deleting temporary product:", err);
      }
    }
    // Navigate back to product list regardless
    navigate("/admin/productos");
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
        {/* Información Básica (Siempre visible) */}
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
                Ruta Física *
              </label>
              <input
                type="text"
                name="phy_url"
                value={formData.phy_url}
                onChange={handleChange}
                required
                placeholder="C://..."
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

        {/* Secciones adicionales solo en modo edición */}
        {isEditing && id && (
          <>
            {/* Piedras */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-lg shadow">
              <h2 className="text-lg font-semibold mb-4 text-metallic-gold-900 dark:text-ocean-mist-100">
                Piedras del Producto
              </h2>

              {/* Existing Stones Selector */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-metallic-gold-700 dark:text-ocean-mist-300 mb-1">
                  Agregar piedra existente
                </label>
                <div className="flex gap-2">
                  <select
                    className="flex-1 px-3 py-2 border border-metallic-gold-300 dark:border-ocean-mist-600 rounded-md bg-white dark:bg-slate-800 text-metallic-gold-900 dark:text-ocean-mist-100"
                    onChange={(e) => handleAddExistingStone(e.target.value)}
                    defaultValue=""
                  >
                    <option value="">Selecciona una piedra</option>
                    {allStones.map((stone) => (
                      <option key={stone.id} value={stone.id}>
                        {stone.stone_type} - {stone.stone_size}
                      </option>
                    ))}
                  </select>
                  <Button
                    type="button"
                    className="bg-gray-500 hover:bg-gray-600 text-white"
                    onClick={() => setShowNewStoneForm(!showNewStoneForm)}
                  >
                    {showNewStoneForm ? "Cancelar" : "Agregar nueva"}
                  </Button>
                </div>
              </div>

              {/* New Stone Form */}
              {showNewStoneForm && (
                <div className="mb-4 p-4 bg-metallic-gold-50 dark:bg-slate-800 rounded-md">
                  <h3 className="text-sm font-medium text-metallic-gold-700 dark:text-ocean-mist-300 mb-2">
                    Nueva Piedra
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <input
                      type="text"
                      placeholder="Tipo (ej: Diamante)"
                      value={newStoneName}
                      onChange={(e) => setNewStoneName(e.target.value)}
                      className="px-3 py-2 border border-metallic-gold-300 dark:border-ocean-mist-600 rounded-md bg-white dark:bg-slate-800 text-metallic-gold-900 dark:text-ocean-mist-100"
                    />
                    <input
                      type="text"
                      placeholder="Tamaño (ej: 0.5ct)"
                      value={newStoneSize}
                      onChange={(e) => setNewStoneSize(e.target.value)}
                      className="px-3 py-2 border border-metallic-gold-300 dark:border-ocean-mist-600 rounded-md bg-white dark:bg-slate-800 text-metallic-gold-900 dark:text-ocean-mist-100"
                    />
                    <input
                      type="number"
                      placeholder="Valor"
                      value={newStoneValue || ""}
                      onChange={(e) => setNewStoneValue(parseFloat(e.target.value) || 0)}
                      step="0.01"
                      min="0"
                      className="px-3 py-2 border border-metallic-gold-300 dark:border-ocean-mist-600 rounded-md bg-white dark:bg-slate-800 text-metallic-gold-900 dark:text-ocean-mist-100"
                    />
                    <Button type="button" onClick={handleCreateAndAddStone}>
                      Guardar
                    </Button>
                  </div>
                </div>
              )}

              {/* Selected Stones List */}
              {productStones.length > 0 && (
                <div className="mt-4">
                  <table className="min-w-full divide-y divide-metallic-gold-200 dark:divide-ocean-mist-700">
                    <thead className="bg-metallic-gold-100 dark:bg-slate-800">
                      <tr>
                        <th className="px-4 py-2 text-left text-xs font-medium text-metallic-gold-700 dark:text-ocean-mist-300 uppercase">
                          Piedra
                        </th>
                        <th className="px-4 py-2 text-left text-xs font-medium text-metallic-gold-700 dark:text-ocean-mist-300 uppercase">
                          Cantidad
                        </th>
                        <th className="px-4 py-2 text-right text-xs font-medium text-metallic-gold-700 dark:text-ocean-mist-300 uppercase">
                          Acciones
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-slate-900 divide-y divide-metallic-gold-200 dark:divide-ocean-mist-700">
                      {productStones.map((ps) => (
                        <tr key={ps.stone_id}>
                          <td className="px-4 py-2 text-sm text-metallic-gold-900 dark:text-ocean-mist-100">
                            {ps.stone?.stone_type} - {ps.stone?.stone_size}
                          </td>
                          <td className="px-4 py-2 text-sm">
                            <input
                              type="number"
                              value={ps.quantity}
                              onChange={(e) =>
                                handleUpdateStoneQuantity(
                                  ps.stone_id,
                                  parseInt(e.target.value) || 1
                                )
                              }
                              min="1"
                              className="w-20 px-2 py-1 border border-metallic-gold-300 dark:border-ocean-mist-600 rounded bg-white dark:bg-slate-800 text-metallic-gold-900 dark:text-ocean-mist-100"
                            />
                          </td>
                          <td className="px-4 py-2 text-right">
                            <button
                              onClick={() => handleRemoveStone(ps.stone_id)}
                              className="text-red-600 hover:text-red-900"
                            >
                              Eliminar
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {productStones.length === 0 && (
                <p className="text-sm text-metallic-gold-700 dark:text-ocean-mist-300 mt-2">
                  No hay piedras asociadas a este producto.
                </p>
              )}
            </div>

            {/* Precios */}
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

            {/* Opciones */}
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

            {/* Imágenes */}
            <div className="bg-white dark:bg-slate-900 p-6 rounded-lg shadow">
              <ImageUploader productId={id} existingImages={images} onImagesChange={setImages} />
            </div>
          </>
        )}

        {error && <div className="text-red-500 text-center">{error}</div>}

        <div className="flex justify-end space-x-4">
          <Button
            type="button"
            className="bg-gray-500 hover:bg-gray-600 text-white"
            onClick={handleCancel}
          >
            Cancelar
          </Button>
          <Button type="submit" disabled={submitting}>
            {submitting ? <Spinner /> : isEditing ? "Guardar Producto" : "Siguiente"}
          </Button>
        </div>
      </form>
    </div>
  );
};
