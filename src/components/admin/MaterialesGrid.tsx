import { useState, useEffect } from "react";
import { Material } from "../../types/joya.types";
import {
  fetchMaterials,
  createMaterial,
  updateMaterial,
  deleteMaterial,
} from "../../services/materialsService";
import { Button } from "../ui/Button";
import { Spinner } from "../ui/Spinner";
import { useFiltrosContext } from "../../context/FiltrosContext";
import { invalidateMaterialsCache } from "../../hooks/useMaterials";
import { formatPrice, toPascalCase } from "../../utils/formatters";

export const MaterialesGrid = () => {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingMaterialId, setEditingMaterialId] = useState<string | null>(null);
  const [editedMaterial, setEditedMaterial] = useState<Partial<Material> | null>(null);
  const [showNewMaterialForm, setShowNewMaterialForm] = useState(false);
  const [newMaterialName, setNewMaterialName] = useState("");
  const [newMaterialDescription, setNewMaterialDescription] = useState("");
  const [newMaterialValue, setNewMaterialValue] = useState<number>(0);
  const [submitting, setSubmitting] = useState(false);
  const { invalidateProductsCache } = useFiltrosContext();

  useEffect(() => {
    loadMaterials();
  }, []);

  const loadMaterials = async () => {
    try {
      setLoading(true);
      const data = await fetchMaterials();
      setMaterials(data);
    } catch (err) {
      setError("Error al cargar los materiales.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (material: Material) => {
    setEditingMaterialId(material.id);
    setEditedMaterial({ ...material });
  };

  const handleCancelEdit = () => {
    setEditingMaterialId(null);
    setEditedMaterial(null);
  };

  const handleSaveEdit = async () => {
    if (!editedMaterial || !editingMaterialId) return;

    setSubmitting(true);
    try {
      await updateMaterial(editingMaterialId, editedMaterial);
      setMaterials(
        materials.map((m) => (m.id === editingMaterialId ? { ...m, ...editedMaterial } : m))
      );
      handleCancelEdit();
      invalidateProductsCache();
      invalidateMaterialsCache();
    } catch (err) {
      setError("Error al guardar los cambios del material.");
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteMaterial = async (id: string) => {
    if (!window.confirm("¿Estás seguro de que quieres eliminar este material?")) {
      return;
    }
    try {
      await deleteMaterial(id);
      setMaterials(materials.filter((m) => m.id !== id));
    } catch (err) {
      setError("Error al eliminar el material.");
      console.error(err);
    }
  };

  const handleCreateNewMaterial = async () => {
    if (!newMaterialName || newMaterialValue <= 0) {
      alert("Por favor, complete el nombre y valor del nuevo material.");
      return;
    }
    setSubmitting(true);
    try {
      const created = await createMaterial({
        name: toPascalCase(newMaterialName),
        description: toPascalCase(newMaterialDescription),
        value_per_gram: newMaterialValue,
      });
      setMaterials([...materials, created]);
      setShowNewMaterialForm(false);
      setNewMaterialName("");
      setNewMaterialDescription("");
      setNewMaterialValue(0);
    } catch (err) {
      setError("Error al crear el nuevo material.");
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateField = (field: keyof Material, value: any) => {
    setEditedMaterial((prev) => ({ ...prev, [field]: value }));
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Spinner />
      </div>
    );
  }

  if (error) {
    return <div className="text-red-500 text-center mt-4">{error}</div>;
  }

  return (
    <main className="p-6 space-y-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-semibold text-metallic-gold-900 dark:text-ocean-mist-100">
          Gestión de Materiales
        </h1>
        <Button onClick={() => setShowNewMaterialForm(!showNewMaterialForm)}>
          {showNewMaterialForm ? "Cancelar" : "Nuevo Material"}
        </Button>
      </div>

      {/* Formulario para nuevo material */}
      {showNewMaterialForm && (
        <div className="bg-white dark:bg-slate-900 p-6 rounded-lg shadow-md mb-6">
          <h3 className="text-lg font-semibold mb-4 text-metallic-gold-900 dark:text-ocean-mist-100">
            Nuevo Material
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-metallic-gold-700 dark:text-ocean-mist-300 mb-1">
                Nombre
              </label>
              <input
                type="text"
                value={newMaterialName}
                onChange={(e) => setNewMaterialName(e.target.value)}
                className="w-full px-3 py-2 border border-metallic-gold-300 dark:border-ocean-mist-500 rounded-md bg-white dark:bg-slate-800 text-metallic-gold-900 dark:text-ocean-mist-100 focus:outline-none focus:ring-2 focus:ring-metallic-gold-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-metallic-gold-700 dark:text-ocean-mist-300 mb-1">
                Descripción
              </label>
              <input
                type="text"
                value={newMaterialDescription}
                onChange={(e) => setNewMaterialDescription(e.target.value)}
                className="w-full px-3 py-2 border border-metallic-gold-300 dark:border-ocean-mist-500 rounded-md bg-white dark:bg-slate-800 text-metallic-gold-900 dark:text-ocean-mist-100 focus:outline-none focus:ring-2 focus:ring-metallic-gold-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-metallic-gold-700 dark:text-ocean-mist-300 mb-1">
                Valor ($)
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={newMaterialValue || ""}
                  onChange={(e) => setNewMaterialValue(parseFloat(e.target.value) || 0)}
                  step="0.01"
                  min="0"
                  className="flex-1 px-3 py-2 border border-metallic-gold-300 dark:border-ocean-mist-500 rounded-md bg-white dark:bg-slate-800 text-metallic-gold-900 dark:text-ocean-mist-100 focus:outline-none focus:ring-2 focus:ring-metallic-gold-500"
                />
                <Button type="button" onClick={handleCreateNewMaterial} disabled={submitting}>
                  {submitting ? "Creando..." : "Crear"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {materials.map((material) => (
          <div
            key={material.id}
            className="bg-white dark:bg-slate-900 p-6 rounded-lg shadow-md flex flex-col justify-between"
          >
            <div>
              {editingMaterialId === material.id ? (
                <div className="mb-2">
                  <label className="block text-xs font-medium text-metallic-gold-700 dark:text-ocean-mist-300 mb-1">
                    Nombre
                  </label>
                  <input
                    type="text"
                    value={editedMaterial?.name || ""}
                    onChange={(e) => handleUpdateField("name", e.target.value)}
                    className="w-full px-3 py-2 border border-metallic-gold-300 dark:border-ocean-mist-500 rounded-md bg-white dark:bg-slate-800 text-metallic-gold-900 dark:text-ocean-mist-100 focus:outline-none focus:ring-2 focus:ring-metallic-gold-500"
                  />
                </div>
              ) : (
                <h3 className="text-xl font-bold text-metallic-gold-900 dark:text-ocean-mist-100 mb-2">
                  {material.name}
                </h3>
              )}

              {editingMaterialId === material.id ? (
                <div className="mb-2">
                  <label className="block text-xs font-medium text-metallic-gold-700 dark:text-ocean-mist-300 mb-1">
                    Descripción
                  </label>
                  <input
                    type="text"
                    value={editedMaterial?.description || ""}
                    onChange={(e) => handleUpdateField("description", e.target.value)}
                    className="w-full px-3 py-2 border border-metallic-gold-300 dark:border-ocean-mist-500 rounded-md bg-white dark:bg-slate-800 text-metallic-gold-900 dark:text-ocean-mist-100 focus:outline-none focus:ring-2 focus:ring-metallic-gold-500"
                  />
                </div>
              ) : (
                <p className="text-metallic-gold-700 dark:text-ocean-mist-300 text-sm mb-4">
                  {material.description || "Sin descripción."}
                </p>
              )}

              <div className="mb-2">
                <label className="block text-xs font-medium text-metallic-gold-700 dark:text-ocean-mist-300 mb-1">
                  Valor por Gramo ($)
                </label>
                {editingMaterialId === material.id ? (
                  <input
                    type="number"
                    value={editedMaterial?.value_per_gram || 0}
                    onChange={(e) =>
                      handleUpdateField("value_per_gram", parseFloat(e.target.value) || 0)
                    }
                    step="0.01"
                    min="0"
                    className="w-full px-3 py-2 border border-metallic-gold-300 dark:border-ocean-mist-500 rounded-md bg-white dark:bg-slate-800 text-metallic-gold-900 dark:text-ocean-mist-100 focus:outline-none focus:ring-2 focus:ring-metallic-gold-500"
                  />
                ) : (
                  <p className="text-lg font-bold text-metallic-gold-900 dark:text-ocean-mist-100">
                    ${formatPrice(material.value_per_gram)}
                  </p>
                )}
              </div>
            </div>

            <div className="mt-6 flex justify-end space-x-2">
              {editingMaterialId === material.id ? (
                <>
                  <Button
                    type="button"
                    className="bg-gray-500 hover:bg-gray-600 text-white"
                    onClick={handleCancelEdit}
                  >
                    Cancelar
                  </Button>
                  <Button type="button" onClick={handleSaveEdit} disabled={submitting}>
                    {submitting ? "Guardando..." : "Guardar"}
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    type="button"
                    className="bg-red-600 hover:bg-red-700 text-white"
                    onClick={() => handleDeleteMaterial(material.id)}
                  >
                    Eliminar
                  </Button>
                  <Button type="button" onClick={() => handleEditClick(material)}>
                    Editar
                  </Button>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </main>
  );
};
