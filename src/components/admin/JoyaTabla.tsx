import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Joya } from "../../types/joya.types";
import { fetchActiveProducts, deleteProduct } from "../../services/joyasService";
import { Button } from "../ui/Button";

export const JoyaTabla = () => {
  const [products, setProducts] = useState<Joya[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    try {
      setLoading(true);
      const data = await fetchActiveProducts();
      setProducts(data);
    } catch (err) {
      setError("Error al cargar los productos.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("¿Estás seguro de que quieres eliminar este producto?")) {
      return;
    }

    try {
      await deleteProduct(id);
      setProducts(products.filter((p) => p.id !== id));
    } catch (err) {
      setError("Error al eliminar el producto.");
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
          Lista de Productos
        </h2>
        <Link to="/admin/productos/nuevo">
          <Button>Nuevo Producto</Button>
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
                SKU
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-metallic-gold-700 dark:text-ocean-mist-300 uppercase tracking-wider">
                Precio
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-metallic-gold-700 dark:text-ocean-mist-300 uppercase tracking-wider">
                Activo
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-metallic-gold-700 dark:text-ocean-mist-300 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-slate-900 divide-y divide-metallic-gold-200 dark:divide-ocean-mist-700">
            {products.map((product) => (
              <tr key={product.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-metallic-gold-900 dark:text-ocean-mist-100">
                  {product.name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-metallic-gold-700 dark:text-ocean-mist-300">
                  {product.sku || "-"}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-metallic-gold-700 dark:text-ocean-mist-300">
                  ${product.final_price.toFixed(2)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {product.active ? (
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                      Sí
                    </span>
                  ) : (
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
                      No
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                  <Link
                    to={`/admin/productos/${product.id}/editar`}
                    className="text-metallic-gold-600 hover:text-metallic-gold-900 dark:text-ocean-mist-400 dark:hover:text-ocean-mist-100"
                  >
                    Editar
                  </Link>
                  <button
                    onClick={() => handleDelete(product.id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    Borrar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {products.length === 0 && (
          <div className="text-center py-8 text-metallic-gold-700 dark:text-ocean-mist-300">
            No hay productos registrados.
          </div>
        )}
      </div>
    </div>
  );
};
