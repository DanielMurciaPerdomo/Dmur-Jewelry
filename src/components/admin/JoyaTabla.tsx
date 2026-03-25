import { useEffect, useState, useCallback, useRef } from "react";
import { Link } from "react-router-dom";
import { Joya } from "../../types/joya.types";
import { fetchAllProducts, deleteProduct } from "../../services/joyasService";
import { supabase } from "../../services/supabaseClient";
import { Button } from "../ui/Button";
import { useProductTypes } from "../../hooks/useProductTypes";
import { useFiltrosContext } from "../../context/FiltrosContext";
import { formatPrice } from "../../utils/formatters";

const fetchProductSuggestionsByName = async (nameTerm: string) => {
  const { data, error } = await supabase
    .from("products")
    .select("id, name, slug, sku")
    .ilike("name", `%${nameTerm}%`)
    .limit(10)
    .order("name", { ascending: true });

  if (error) {
    throw error;
  }
  return data ?? [];
};

const fetchProductSuggestionsBySku = async (skuTerm: string) => {
  const { data, error } = await supabase
    .from("products")
    .select("id, name, slug, sku")
    .ilike("sku", `%${skuTerm}%`)
    .limit(10)
    .order("sku", { ascending: true });

  if (error) {
    throw error;
  }
  return data ?? [];
};

export const JoyaTabla = () => {
  const [products, setProducts] = useState<Joya[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Estados para los términos finales que filtran la tabla
  const [finalSearchName, setFinalSearchName] = useState("");
  const [finalSearchSku, setFinalSearchSku] = useState("");
  const [selectedProductTypeId, setSelectedProductTypeId] = useState("");

  // Estados para los términos que el usuario escribe (antes de confirmar)
  const [inputName, setInputName] = useState("");
  const [inputSku, setInputSku] = useState("");

  // Estados para las sugerencias
  const [nameSuggestions, setNameSuggestions] = useState<
    { id: string; name: string; sku: string | null }[]
  >([]);
  const [skuSuggestions, setSkuSuggestions] = useState<
    { id: string; name: string; sku: string | null }[]
  >([]);
  const [showNameSuggestions, setShowNameSuggestions] = useState(false);
  const [showSkuSuggestions, setShowSkuSuggestions] = useState(false);

  const nameInputRef = useRef<HTMLInputElement>(null);
  const skuInputRef = useRef<HTMLInputElement>(null);

  const { productTypes, isLoading: productTypesLoading } = useProductTypes();
  const { invalidateProductsCache } = useFiltrosContext();

  // Cargar productos cuando cambian los filtros finales
  const loadProducts = useCallback(async () => {
    try {
      setLoading(true);
      const data = await fetchAllProducts({
        name: finalSearchName,
        sku: finalSearchSku,
        productTypeId: selectedProductTypeId,
      });
      setProducts(data);
    } catch (err) {
      setError("Error al cargar los productos.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [finalSearchName, finalSearchSku, selectedProductTypeId]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  // Buscar sugerencias de nombre con debounce
  useEffect(() => {
    if (inputName.length < 2) {
      setNameSuggestions([]);
      return;
    }

    const handler = setTimeout(async () => {
      try {
        const suggestions = await fetchProductSuggestionsByName(inputName);
        setNameSuggestions(suggestions);
        setShowNameSuggestions(true);
      } catch (err) {
        console.error("Error fetching name suggestions:", err);
      }
    }, 300);

    return () => clearTimeout(handler);
  }, [inputName]);

  // Buscar sugerencias de SKU con debounce
  useEffect(() => {
    if (inputSku.length < 2) {
      setSkuSuggestions([]);
      return;
    }

    const handler = setTimeout(async () => {
      try {
        const suggestions = await fetchProductSuggestionsBySku(inputSku);
        setSkuSuggestions(suggestions);
        setShowSkuSuggestions(true);
      } catch (err) {
        console.error("Error fetching sku suggestions:", err);
      }
    }, 300);

    return () => clearTimeout(handler);
  }, [inputSku]);

  const handleSelectNameSuggestion = (suggestion: {
    id: string;
    name: string;
    sku: string | null;
  }) => {
    setInputName(suggestion.name);
    setFinalSearchName(suggestion.name);
    setShowNameSuggestions(false);
    loadProducts();
  };

  const handleSelectSkuSuggestion = (suggestion: {
    id: string;
    name: string;
    sku: string | null;
  }) => {
    setInputSku(suggestion.sku || "");
    setFinalSearchSku(suggestion.sku || "");
    setShowSkuSuggestions(false);
    loadProducts();
  };

  const handleNameKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      setFinalSearchName(inputName);
      setShowNameSuggestions(false);
      loadProducts();
    } else if (e.key === "Escape") {
      setShowNameSuggestions(false);
    }
  };

  const handleSkuKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      setFinalSearchSku(inputSku);
      setShowSkuSuggestions(false);
      loadProducts();
    } else if (e.key === "Escape") {
      setShowSkuSuggestions(false);
    }
  };

  const handleClearFilters = () => {
    setInputName("");
    setInputSku("");
    setFinalSearchName("");
    setFinalSearchSku("");
    setSelectedProductTypeId("");
    setNameSuggestions([]);
    setSkuSuggestions([]);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("¿Estás seguro de que quieres eliminar este producto?")) {
      return;
    }

    try {
      await deleteProduct(id);
      setProducts(products.filter((p) => p.id !== id));
      invalidateProductsCache();
    } catch (err) {
      setError("Error al eliminar el producto.");
      console.error(err);
    }
  };

  const handleCopyPath = async (path: string, id: string) => {
    if (!path) return;
    try {
      await navigator.clipboard.writeText(path);
      setCopiedId(id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch (err) {
      console.error("Error copying to clipboard:", err);
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

      <div className="mb-4 p-4 bg-white dark:bg-slate-900 rounded-lg shadow flex flex-wrap gap-4 items-end">
        <div className="flex-1 min-w-[180px] relative">
          <label
            htmlFor="searchName"
            className="block text-sm font-medium text-metallic-gold-700 dark:text-ocean-mist-300 mb-1"
          >
            Buscar por Nombre
          </label>
          <input
            ref={nameInputRef}
            type="text"
            id="searchName"
            autoComplete="off"
            className="w-full px-3 py-2 border border-metallic-gold-300 dark:border-ocean-mist-500 rounded-md bg-white dark:bg-slate-800 text-metallic-gold-900 dark:text-ocean-mist-100 focus:outline-none focus:ring-2 focus:ring-metallic-gold-500"
            placeholder="Nombre del producto"
            value={inputName}
            onChange={(e) => setInputName(e.target.value)}
            onKeyDown={handleNameKeyDown}
            onBlur={() => setTimeout(() => setShowNameSuggestions(false), 200)}
          />
          {showNameSuggestions && nameSuggestions.length > 0 && (
            <ul className="absolute z-10 w-full bg-white dark:bg-slate-800 border border-metallic-gold-300 dark:border-ocean-mist-500 rounded-md mt-1 max-h-60 overflow-y-auto shadow-lg">
              {nameSuggestions.map((suggestion) => (
                <li
                  key={suggestion.id}
                  className="px-3 py-2 hover:bg-metallic-gold-100 dark:hover:bg-slate-700 cursor-pointer text-metallic-gold-900 dark:text-ocean-mist-100"
                  onMouseDown={() => handleSelectNameSuggestion(suggestion)}
                >
                  <div className="font-medium">{suggestion.name}</div>
                  <div className="text-xs text-metallic-gold-500 dark:text-ocean-mist-300">
                    SKU: {suggestion.sku || "N/A"}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="flex-1 min-w-[180px] relative">
          <label
            htmlFor="searchSku"
            className="block text-sm font-medium text-metallic-gold-700 dark:text-ocean-mist-300 mb-1"
          >
            Buscar por SKU
          </label>
          <input
            ref={skuInputRef}
            type="text"
            id="searchSku"
            autoComplete="off"
            className="w-full px-3 py-2 border border-metallic-gold-300 dark:border-ocean-mist-500 rounded-md bg-white dark:bg-slate-800 text-metallic-gold-900 dark:text-ocean-mist-100 focus:outline-none focus:ring-2 focus:ring-metallic-gold-500"
            placeholder="SKU"
            value={inputSku}
            onChange={(e) => setInputSku(e.target.value)}
            onKeyDown={handleSkuKeyDown}
            onBlur={() => setTimeout(() => setShowSkuSuggestions(false), 200)}
          />
          {showSkuSuggestions && skuSuggestions.length > 0 && (
            <ul className="absolute z-10 w-full bg-white dark:bg-slate-800 border border-metallic-gold-300 dark:border-ocean-mist-500 rounded-md mt-1 max-h-60 overflow-y-auto shadow-lg">
              {skuSuggestions.map((suggestion) => (
                <li
                  key={suggestion.id}
                  className="px-3 py-2 hover:bg-metallic-gold-100 dark:hover:bg-slate-700 cursor-pointer text-metallic-gold-900 dark:text-ocean-mist-100"
                  onMouseDown={() => handleSelectSkuSuggestion(suggestion)}
                >
                  <div className="font-medium">{suggestion.sku}</div>
                  <div className="text-xs text-metallic-gold-500 dark:text-ocean-mist-300">
                    {suggestion.name}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="flex-1 min-w-[180px]">
          <label
            htmlFor="filterProductType"
            className="block text-sm font-medium text-metallic-gold-700 dark:text-ocean-mist-300 mb-1"
          >
            Filtrar por Tipo
          </label>
          <select
            id="filterProductType"
            className="w-full px-3 py-2 border border-metallic-gold-300 dark:border-ocean-mist-500 rounded-md bg-white dark:bg-slate-800 text-metallic-gold-900 dark:text-ocean-mist-100 focus:outline-none focus:ring-2 focus:ring-metallic-gold-500"
            value={selectedProductTypeId}
            onChange={(e) => setSelectedProductTypeId(e.target.value)}
            disabled={productTypesLoading}
          >
            <option value="">Todos los tipos</option>
            {productTypes.map((type) => (
              <option key={type.id} value={type.id}>
                {type.name}
              </option>
            ))}
          </select>
        </div>

        <Button
          onClick={handleClearFilters}
          className="bg-gray-500 hover:bg-gray-600 text-white min-w-[100px] dark:bg-ocean-mist-600 dark:hover:bg-ocean-mist-500"
        >
          Limpiar Filtros
        </Button>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-metallic-gold-200 dark:divide-ocean-mist-600">
          <thead className="bg-metallic-gold-100 dark:bg-slate-800">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-metallic-gold-700 dark:text-ocean-mist-300 uppercase tracking-wider">
                SKU
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-metallic-gold-700 dark:text-ocean-mist-300 uppercase tracking-wider">
                Nombre
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-metallic-gold-700 dark:text-ocean-mist-300 uppercase tracking-wider">
                Ruta Física (PHY_URL)
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-metallic-gold-700 dark:text-ocean-mist-300 uppercase tracking-wider">
                Precio
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-metallic-gold-700 dark:text-ocean-mist-300 uppercase tracking-wider">
                Activa
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-metallic-gold-700 dark:text-ocean-mist-300 uppercase tracking-wider">
                Destacada
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-metallic-gold-700 dark:text-ocean-mist-300 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-slate-900 divide-y divide-metallic-gold-200 dark:divide-ocean-mist-600">
            {products.map((product) => (
              <tr key={product.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-metallic-gold-700 dark:text-ocean-mist-300">
                  {product.sku || "-"}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-metallic-gold-900 dark:text-ocean-mist-100">
                  {product.name}
                </td>
                <td
                  className={`px-6 py-4 text-sm max-w-xs truncate cursor-pointer transition-colors ${
                    copiedId === product.id
                      ? "text-green-600 dark:text-green-400 font-semibold"
                      : "text-metallic-gold-700 dark:text-ocean-mist-300 hover:text-metallic-gold-900 dark:hover:text-ocean-mist-100"
                  }`}
                  title={product.phy_url}
                  onClick={() => handleCopyPath(product.phy_url || "", product.id)}
                >
                  {copiedId === product.id ? "✓ Copiado!" : product.phy_url || "-"}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-metallic-gold-700 dark:text-ocean-mist-300">
                  ${formatPrice(product.final_price)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {product.active ? (
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-metallic-gold-300 text-metallic-gold-900  dark:bg-ocean-mist-600 dark:text-white">
                      Sí
                    </span>
                  ) : (
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-metallic-gold-600 text-white dark:bg-ocean-mist-900 dark:text-ocean-mist-300">
                      No
                    </span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {product.featured ? (
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-metallic-gold-300 text-metallic-gold-900  dark:bg-ocean-mist-600 dark:text-white">
                      Sí
                    </span>
                  ) : (
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-metallic-gold-600 text-white dark:bg-ocean-mist-900 dark:text-ocean-mist-300">
                      No
                    </span>
                  )}
                </td>

                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                  <Link
                    to={`/admin/productos/${product.id}/editar`}
                    className="text-metallic-gold-600 hover:text-metallic-gold-900 dark:text-ocean-mist-300 dark:hover:text-ocean-mist-100"
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
