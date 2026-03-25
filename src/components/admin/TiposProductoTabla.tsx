import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ProductType } from "../../types/joya.types";
import { fetchProductTypes, deleteProductType } from "../../services/productTypesService";
import { Button } from "../ui/Button";
import { formatPrice } from "../../utils/formatters";

export const TiposProductoTabla = () => {
  const [productTypes, setProductTypes] = useState<ProductType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadProductTypes();
  }, []);

  const loadProductTypes = async () => {
    try {
      setLoading(true);
      const data = await fetchProductTypes();
      setProductTypes(data);
    } catch (err) {
      setError("Error al cargar los tipos de producto.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("¿Estás seguro de que quieres eliminar este tipo de producto?")) {
      return;
    }

    try {
      await deleteProductType(id);
      setProductTypes(productTypes.filter((pt) => pt.id !== id));
    } catch (err) {
      setError("Error al eliminar el tipo de producto.");
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-metallic-gold-600"></div>
      </div>
    );
  }

  if (error) {
    return <div className="text-red-500 text-center mt-4">{error}</div>;
  }

  return (
    <div className="mt-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold text-metallic-gold-900 dark:text-ocean-mist-100">
          Tipos de Producto
        </h2>
        <Link to="/admin/tipos/nuevo">
          <Button>Nuevo Tipo</Button>
        </Link>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-metallic-gold-200 dark:divide-ocean-mist-700">
          <thead className="bg-metallic-gold-100 dark:bg-slate-800">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-metallic-gold-700 dark:text-ocean-mist-300 uppercase tracking-wider">
                Nombre
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-metallic-gold-700 dark:text-ocean-mist-300 uppercase tracking-wider">
                Valor
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-metallic-gold-700 dark:text-ocean-mist-300 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-slate-900 divide-y divide-metallic-gold-200 dark:divide-ocean-mist-700">
            {productTypes.map((pt) => (
              <tr key={pt.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-metallic-gold-900 dark:text-ocean-mist-100">
                  {pt.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-metallic-gold-700 dark:text-ocean-mist-300">
                  ${formatPrice(pt.type_value)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                  <Link
                    to={`/admin/tipos/${pt.id}/editar`}
                    className="text-metallic-gold-600 hover:text-metallic-gold-900 dark:text-ocean-mist-400 dark:hover:text-ocean-mist-100"
                  >
                    Editar
                  </Link>
                  <button
                    onClick={() => handleDelete(pt.id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    Borrar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {productTypes.length === 0 && (
          <div className="text-center py-8 text-metallic-gold-700 dark:text-ocean-mist-300">
            No hay tipos de producto registrados.
          </div>
        )}
      </div>
    </div>
  );
};
