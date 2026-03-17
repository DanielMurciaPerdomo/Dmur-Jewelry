import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  fetchDashboardSummary,
  DashboardSummary,
  fetchDistributionByType,
  DistributionItem,
  fetchDistributionByMaterial,
  fetchPriceStats,
  PriceStats,
  fetchContentStats,
  ContentStats,
  fetchProductsWithoutImages,
  fetchInactiveProducts,
  AlertItem,
  fetchRecentProducts,
  RecentActivity,
} from "../../services/dashboardService";
import { formatCurrencyCOP } from "../../utils/formatters";
import { Spinner } from "../ui/Spinner";

export const DashboardAdmin = () => {
  // Estados para cada sección
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [typeDistribution, setTypeDistribution] = useState<DistributionItem[]>([]);
  const [materialDistribution, setMaterialDistribution] = useState<DistributionItem[]>([]);
  const [priceStats, setPriceStats] = useState<PriceStats | null>(null);
  const [contentStats, setContentStats] = useState<ContentStats | null>(null);
  const [productsWithoutImages, setProductsWithoutImages] = useState<AlertItem[]>([]);
  const [inactiveProducts, setInactiveProducts] = useState<AlertItem[]>([]);
  const [recentProducts, setRecentProducts] = useState<RecentActivity[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Cargar todas las métricas en paralelo
        const [
          summaryData,
          typesData,
          materialsData,
          pricesData,
          contentData,
          withoutImagesData,
          inactiveData,
          recentData,
        ] = await Promise.all([
          fetchDashboardSummary(),
          fetchDistributionByType(),
          fetchDistributionByMaterial(),
          fetchPriceStats(),
          fetchContentStats(),
          fetchProductsWithoutImages(),
          fetchInactiveProducts(),
          fetchRecentProducts(),
        ]);

        setSummary(summaryData);
        setTypeDistribution(typesData);
        setMaterialDistribution(materialsData);
        setPriceStats(pricesData);
        setContentStats(contentData);
        setProductsWithoutImages(withoutImagesData);
        setInactiveProducts(inactiveData);
        setRecentProducts(recentData);
      } catch (err) {
        setError("Error al cargar las métricas del dashboard.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

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
      <h1 className="text-2xl font-semibold text-metallic-gold-900 dark:text-ocean-mist-100">
        Dashboard
      </h1>

      {/* 1. Tarjetas de Resumen */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 p-4 rounded-lg shadow">
          <h3 className="text-sm font-medium text-metallic-gold-700 dark:text-ocean-mist-300">
            Total Joyas
          </h3>
          <p className="text-2xl font-bold text-metallic-gold-900 dark:text-ocean-mist-100">
            {summary?.total_joyas ?? 0}
          </p>
        </div>
        <div className="bg-white dark:bg-slate-900 p-4 rounded-lg shadow">
          <h3 className="text-sm font-medium text-metallic-gold-700 dark:text-ocean-mist-300">
            Joyas Activas
          </h3>
          <p className="text-2xl font-bold text-green-600">{summary?.joyas_activas ?? 0}</p>
        </div>
        <div className="bg-white dark:bg-slate-900 p-4 rounded-lg shadow">
          <h3 className="text-sm font-medium text-metallic-gold-700 dark:text-ocean-mist-300">
            Joyas Inactivas
          </h3>
          <p className="text-2xl font-bold text-red-600">{summary?.joyas_inactivas ?? 0}</p>
        </div>
        <div className="bg-white dark:bg-slate-900 p-4 rounded-lg shadow">
          <h3 className="text-sm font-medium text-metallic-gold-700 dark:text-ocean-mist-300">
            Joyas Destacadas
          </h3>
          <p className="text-2xl font-bold text-metallic-gold-600 dark:text-ocean-mist-400">
            {summary?.joyas_destacadas ?? 0}
          </p>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 2. Distribución */}
        <section className="bg-white dark:bg-slate-900 p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4 text-metallic-gold-900 dark:text-ocean-mist-100">
            Distribución
          </h2>
          <div className="space-y-6">
            <div>
              <h3 className="text-sm font-medium text-metallic-gold-700 dark:text-ocean-mist-300 mb-2">
                Por Tipo de Producto
              </h3>
              <div className="space-y-2">
                {typeDistribution.map((item) => (
                  <div key={item.name} className="flex justify-between items-center">
                    <span className="text-metallic-gold-900 dark:text-ocean-mist-100">
                      {item.name}
                    </span>
                    <span className="text-metallic-gold-700 dark:text-ocean-mist-300">
                      {item.count}
                    </span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <h3 className="text-sm font-medium text-metallic-gold-700 dark:text-ocean-mist-300 mb-2">
                Por Material
              </h3>
              <div className="space-y-2">
                {materialDistribution.map((item) => (
                  <div key={item.name} className="flex justify-between items-center">
                    <span className="text-metallic-gold-900 dark:text-ocean-mist-100">
                      {item.name}
                    </span>
                    <span className="text-metallic-gold-700 dark:text-ocean-mist-300">
                      {item.count}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* 3. Precios */}
        <section className="bg-white dark:bg-slate-900 p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4 text-metallic-gold-900 dark:text-ocean-mist-100">
            Precios (Activos)
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <h3 className="text-sm font-medium text-metallic-gold-700 dark:text-ocean-mist-300">
                Precio Promedio
              </h3>
              <p className="text-lg font-bold text-metallic-gold-900 dark:text-ocean-mist-100">
                {priceStats ? formatCurrencyCOP(priceStats.avg_price) : "-"}
              </p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-metallic-gold-700 dark:text-ocean-mist-300">
                Precio Máximo
              </h3>
              <p className="text-lg font-bold text-metallic-gold-900 dark:text-ocean-mist-100">
                {priceStats ? formatCurrencyCOP(priceStats.max_price) : "-"}
              </p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-metallic-gold-700 dark:text-ocean-mist-300">
                Precio Mínimo
              </h3>
              <p className="text-lg font-bold text-metallic-gold-900 dark:text-ocean-mist-100">
                {priceStats ? formatCurrencyCOP(priceStats.min_price) : "-"}
              </p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-metallic-gold-700 dark:text-ocean-mist-300">
                Margen Promedio
              </h3>
              <p className="text-lg font-bold text-metallic-gold-900 dark:text-ocean-mist-100">
                {priceStats ? `${priceStats.avg_margin.toFixed(2)}%` : "-"}
              </p>
            </div>
          </div>
        </section>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 4. Contenido */}
        <section className="bg-white dark:bg-slate-900 p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4 text-metallic-gold-900 dark:text-ocean-mist-100">
            Contenido
          </h2>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-metallic-gold-900 dark:text-ocean-mist-100">
                {contentStats?.total_materiales ?? 0}
              </p>
              <p className="text-xs text-metallic-gold-700 dark:text-ocean-mist-300">Materiales</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-metallic-gold-900 dark:text-ocean-mist-100">
                {contentStats?.total_tipos ?? 0}
              </p>
              <p className="text-xs text-metallic-gold-700 dark:text-ocean-mist-300">Tipos</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-metallic-gold-900 dark:text-ocean-mist-100">
                {contentStats?.total_piedras ?? 0}
              </p>
              <p className="text-xs text-metallic-gold-700 dark:text-ocean-mist-300">Piedras</p>
            </div>
          </div>
        </section>

        {/* 5. Alertas */}
        <section className="bg-white dark:bg-slate-900 p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4 text-red-600">Alertas</h2>
          <div className="space-y-4">
            <div>
              <h3 className="text-sm font-medium text-metallic-gold-700 dark:text-ocean-mist-300 mb-2">
                Sin Imagen ({productsWithoutImages.length})
              </h3>
              {productsWithoutImages.length > 0 ? (
                <ul className="text-sm text-metallic-gold-900 dark:text-ocean-mist-100 space-y-1 max-h-24 overflow-y-auto">
                  {productsWithoutImages.map((p) => (
                    <li key={p.id} className="truncate">
                      {p.name} {p.sku && `(${p.sku})`}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-green-600">Todas las joyas tienen imágenes.</p>
              )}
            </div>
            <div>
              <h3 className="text-sm font-medium text-metallic-gold-700 dark:text-ocean-mist-300 mb-2">
                Inactivas ({inactiveProducts.length})
              </h3>
              {inactiveProducts.length > 0 ? (
                <ul className="text-sm text-metallic-gold-900 dark:text-ocean-mist-100 space-y-1 max-h-24 overflow-y-auto">
                  {inactiveProducts.map((p) => (
                    <li key={p.id} className="truncate">
                      {p.name} {p.sku && `(${p.sku})`}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-green-600">No hay joyas inactivas.</p>
              )}
            </div>
          </div>
        </section>
      </div>

      {/* 6. Actividad Reciente */}
      <section className="bg-white dark:bg-slate-900 p-6 rounded-lg shadow">
        <h2 className="text-lg font-semibold mb-4 text-metallic-gold-900 dark:text-ocean-mist-100">
          Actividad Reciente
        </h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-metallic-gold-200 dark:divide-ocean-mist-700">
            <thead className="bg-metallic-gold-100 dark:bg-slate-800">
              <tr>
                <th className="px-4 py-2 text-left text-xs font-medium text-metallic-gold-700 dark:text-ocean-mist-300 uppercase">
                  Nombre
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-metallic-gold-700 dark:text-ocean-mist-300 uppercase">
                  Fecha
                </th>
                <th className="px-4 py-2 text-left text-xs font-medium text-metallic-gold-700 dark:text-ocean-mist-300 uppercase">
                  Precio
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-slate-900 divide-y divide-metallic-gold-200 dark:divide-ocean-mist-700">
              {recentProducts.map((product) => (
                <tr key={product.id}>
                  <td className="px-4 py-2 text-sm text-metallic-gold-900 dark:text-ocean-mist-100 truncate max-w-xs">
                    {product.name}
                  </td>
                  <td className="px-4 py-2 text-sm text-metallic-gold-700 dark:text-ocean-mist-300">
                    {new Date(product.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-2 text-sm text-metallic-gold-700 dark:text-ocean-mist-300">
                    {formatCurrencyCOP(product.final_price)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {recentProducts.length === 0 && (
            <div className="text-center py-4 text-metallic-gold-700 dark:text-ocean-mist-300">
              No hay actividad reciente.
            </div>
          )}
        </div>
      </section>
    </main>
  );
};
