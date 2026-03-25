import { useMemo } from "react";
import { useFiltrosContext } from "../../context/FiltrosContext";
import { Spinner } from "../ui/Spinner";
import { JoyaCard } from "./JoyaCard";

export const JoyaGrid = () => {
  const { filtros, isLoading, joyas } = useFiltrosContext();

  const joyasFiltradas = useMemo(() => {
    return joyas.filter((joya) => {
      if (filtros.materialId && joya.material_id !== filtros.materialId) {
        return false;
      }

      const totalPiedras = joya.stones.reduce((sum, s) => sum + s.quantity, 0);
      if (totalPiedras < filtros.piedrasMin || totalPiedras > filtros.piedrasMax) {
        return false;
      }

      if (joya.final_price < filtros.precioMin || joya.final_price > filtros.precioMax) {
        return false;
      }

      if (filtros.tiposPiedra.length > 0) {
        const tiposEnJoya = new Set(joya.stones.map((s) => s.stone_type));
        const tieneAlgunTipo = filtros.tiposPiedra.some((t) => tiposEnJoya.has(t));
        if (!tieneAlgunTipo) {
          return false;
        }
      }

      return true;
    });
  }, [joyas, filtros]);

  if (isLoading) {
    return (
      <div className="flex min-h-[200px] items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (joyasFiltradas.length === 0) {
    return (
      <p className="text-center text-base text-metallic-gold-700 dark:text-ocean-mist-400">
        No se encontraron joyas con los filtros seleccionados.
      </p>
    );
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {joyasFiltradas.map((joya) => (
        <JoyaCard key={joya.id} joya={joya} />
      ))}
    </div>
  );
};
