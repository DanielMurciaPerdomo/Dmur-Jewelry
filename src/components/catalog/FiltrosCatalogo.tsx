import { useState, useEffect, useRef } from "react";
import { useFiltrosContext } from "../../context/FiltrosContext";

const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

const DualRangeSlider = ({
  min,
  max,
  minValue,
  maxValue,
  onChange,
  step = 1,
  formatValue = (v: number) => v.toString(),
}: {
  min: number;
  max: number;
  minValue: number;
  maxValue: number;
  onChange: (min: number, max: number) => void;
  step?: number;
  formatValue?: (value: number) => string;
}) => {
  const [localMin, setLocalMin] = useState(minValue);
  const [localMax, setLocalMax] = useState(maxValue);
  const trackRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef<"min" | "max" | null>(null);

  useEffect(() => {
    setLocalMin(minValue);
    setLocalMax(maxValue);
  }, [minValue, maxValue]);

  const calculateValue = (clientX: number): number => {
    if (!trackRef.current) return min;
    const rect = trackRef.current.getBoundingClientRect();
    const percent = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    const rawValue = min + percent * (max - min);
    return Math.round(rawValue / step) * step;
  };

  const handleMouseDown = (thumb: "min" | "max") => (e: React.MouseEvent) => {
    e.preventDefault();
    isDragging.current = thumb;
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging.current) return;

      const value = calculateValue(e.clientX);

      if (isDragging.current === "min") {
        const newMin = Math.min(value, localMax - step);
        setLocalMin(Math.max(min, newMin));
      } else {
        const newMax = Math.max(value, localMin + step);
        setLocalMax(Math.min(max, newMax));
      }
    };

    const handleMouseUp = () => {
      if (isDragging.current) {
        onChange(localMin, localMax);
        isDragging.current = null;
      }
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [localMin, localMax, min, max, step, onChange]);

  const minPercent = ((localMin - min) / (max - min)) * 100;
  const maxPercent = ((localMax - min) / (max - min)) * 100;

  return (
    <div className="relative h-12 w-full">
      <div
        ref={trackRef}
        className="absolute left-0 top-1/2 h-2 w-full -translate-y-1/2 rounded-full bg-metallic-gold-300 dark:bg-ocean-mist-600"
      />

      <div
        className="absolute top-1/2 h-2 -translate-y-1/2 rounded-full bg-metallic-gold-500"
        style={{
          left: `${minPercent}%`,
          width: `${maxPercent - minPercent}%`,
        }}
      />

      <div
        className="absolute top-1/2 h-6 w-3 -translate-x-1/2 -translate-y-1/2 cursor-pointer rounded-sm bg-metallic-gold-100 shadow-md transition-transform hover:scale-105 active:scale-95"
        style={{ left: `${minPercent}%` }}
        onMouseDown={handleMouseDown("min")}
      />

      <div
        className="absolute top-1/2 h-6 w-3 -translate-x-1/2 -translate-y-1/2 cursor-pointer rounded-sm bg-metallic-gold-100 shadow-md transition-transform hover:scale-105 active:scale-95"
        style={{ left: `${maxPercent}%` }}
        onMouseDown={handleMouseDown("max")}
      />

      <div className="absolute -bottom-5 left-0 text-xs text-metallic-gold-700 dark:text-ocean-mist-400">
        {formatValue(localMin)}
      </div>
      <div className="absolute -bottom-5 right-0 text-xs text-metallic-gold-700 dark:text-ocean-mist-400">
        {formatValue(localMax)}
      </div>
    </div>
  );
};

export const FiltrosCatalogoPanel = () => {
  const { filtros, setFiltros, limpiarFiltros, isLoading, rangos, materials, stones } =
    useFiltrosContext();

  const handleMaterialChange = (materialId: string | null) => {
    setFiltros({ ...filtros, materialId });
  };

  const handlePiedrasChange = (min: number, max: number) => {
    setFiltros({ ...filtros, piedrasMin: min, piedrasMax: max });
  };

  const handlePrecioChange = (min: number, max: number) => {
    setFiltros({ ...filtros, precioMin: min, precioMax: max });
  };

  const handleTipoPiedraChange = (stoneType: string) => {
    const nuevosTipos = filtros.tiposPiedra.includes(stoneType)
      ? filtros.tiposPiedra.filter((t) => t !== stoneType)
      : [...filtros.tiposPiedra, stoneType];
    setFiltros({ ...filtros, tiposPiedra: nuevosTipos });
  };

  if (isLoading) {
    return null;
  }

  return (
    <div className="rounded-lg border border-metallic-gold-300 bg-white p-4 shadow-sm dark:border-ocean-mist-800 dark:bg-slate-900">
      <h3 className="text-lg font-semibold text-metallic-gold-900 dark:text-ocean-mist-100">
        Filtros
      </h3>

      <div className="mt-4 space-y-6">
        <div>
          <label className="block text-sm font-medium text-metallic-gold-700 dark:text-ocean-mist-300">
            Material
          </label>
          <select
            value={filtros.materialId || ""}
            onChange={(e) => handleMaterialChange(e.target.value || null)}
            className="mt-1 block w-full rounded-md border border-metallic-gold-300 bg-white px-3 py-2 text-sm text-metallic-gold-900 shadow-sm focus:border-metallic-gold-500 focus:outline-none focus:ring-1 focus:ring-metallic-gold-500 dark:border-ocean-mist-600 dark:bg-slate-800 dark:text-ocean-mist-100"
          >
            <option value="">Todos los materiales</option>
            {materials.map((material) => (
              <option key={material.id} value={material.id}>
                {material.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-metallic-gold-700 dark:text-ocean-mist-300">
            Número de Piedras
          </label>
          <DualRangeSlider
            min={0}
            max={rangos.piedrasMax}
            minValue={filtros.piedrasMin}
            maxValue={filtros.piedrasMax}
            onChange={handlePiedrasChange}
            step={1}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-metallic-gold-700 dark:text-ocean-mist-300">
            Precio
          </label>
          <DualRangeSlider
            min={rangos.precioMin}
            max={rangos.precioMax}
            minValue={filtros.precioMin}
            maxValue={filtros.precioMax}
            onChange={handlePrecioChange}
            step={10000}
            formatValue={formatCurrency}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-metallic-gold-700 dark:text-ocean-mist-300">
            Tipo de Piedra
          </label>
          <div className="mt-2 space-y-2">
            {stones.map((stone) => (
              <label key={stone.id} className="flex cursor-pointer items-center gap-2">
                <input
                  type="checkbox"
                  checked={filtros.tiposPiedra.includes(stone.stone_type)}
                  onChange={() => handleTipoPiedraChange(stone.stone_type)}
                  className="h-4 w-4 rounded border-metallic-gold-300 text-metallic-gold-600 focus:ring-metallic-gold-500"
                />
                <span className="text-sm text-metallic-gold-700 dark:text-ocean-mist-400">
                  {stone.stone_type}
                </span>
              </label>
            ))}
          </div>
        </div>

        <button
          type="button"
          onClick={limpiarFiltros}
          className="w-full rounded-md border border-metallic-gold-300 px-4 py-2 text-sm font-medium text-metallic-gold-700 transition-colors hover:bg-metallic-gold-50 focus:outline-none focus:ring-2 focus:ring-metallic-gold-500 focus:ring-offset-2 dark:border-ocean-mist-600 dark:text-ocean-mist-300 dark:hover:bg-ocean-mist-800"
        >
          Limpiar filtros
        </button>
      </div>
    </div>
  );
};
