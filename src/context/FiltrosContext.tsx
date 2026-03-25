import { createContext, useContext, useEffect, useState, useMemo, ReactNode } from "react";
import { fetchActiveProductsWithRelations } from "../services/joyasService";
import { fetchMaterials } from "../services/materialsService";
import { fetchStones } from "../services/piedrasService";
import type { JoyaWithRelations } from "../types/joya.types";
import type { Material, Stone } from "../types/joya.types";

export interface FiltrosCatalogo {
  materialId: string | null;
  piedrasMin: number;
  piedrasMax: number;
  precioMin: number;
  precioMax: number;
  tiposPiedra: string[];
}

export interface RangoPrecios {
  precioMin: number;
  precioMax: number;
  piedrasMax: number;
}

interface FiltrosContextValue {
  filtros: FiltrosCatalogo;
  rangos: RangoPrecios;
  setFiltros: (filtros: FiltrosCatalogo) => void;
  limpiarFiltros: () => void;
  isLoading: boolean;
  joyas: JoyaWithRelations[];
  materials: Material[];
  stones: Stone[];
}

const FiltrosContext = createContext<FiltrosContextValue | undefined>(undefined);

export const FiltrosProvider = ({ children }: { children: ReactNode }) => {
  const [joyas, setJoyas] = useState<JoyaWithRelations[]>([]);
  const [materials, setMaterials] = useState<Material[]>([]);
  const [stones, setStones] = useState<Stone[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [joyasData, materialsData, stonesData] = await Promise.all([
          fetchActiveProductsWithRelations(),
          fetchMaterials(),
          fetchStones(),
        ]);
        setJoyas(joyasData);
        setMaterials(materialsData);
        setStones(stonesData);
      } catch (error) {
        console.error("Error fetching filter data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const rangos = useMemo((): RangoPrecios => {
    if (joyas.length === 0) {
      return {
        precioMin: 0,
        precioMax: 1000000,
        piedrasMax: 5,
      };
    }

    const precios = joyas.map((j) => j.final_price);
    const piedrasMaximas = joyas.map((j) => j.stones.reduce((sum, s) => sum + s.quantity, 0));

    return {
      precioMin: Math.floor(Math.min(...precios)),
      precioMax: Math.ceil(Math.max(...precios)),
      piedrasMax: Math.max(...piedrasMaximas),
    };
  }, [joyas]);

  const defaultFiltros = useMemo(
    (): FiltrosCatalogo => ({
      materialId: null,
      piedrasMin: 0,
      piedrasMax: rangos.piedrasMax,
      precioMin: rangos.precioMin,
      precioMax: rangos.precioMax,
      tiposPiedra: [],
    }),
    [rangos]
  );

  const [filtros, setFiltros] = useState<FiltrosCatalogo>(defaultFiltros);

  useEffect(() => {
    setFiltros({
      materialId: null,
      piedrasMin: 0,
      piedrasMax: rangos.piedrasMax,
      precioMin: rangos.precioMin,
      precioMax: rangos.precioMax,
      tiposPiedra: [],
    });
  }, [rangos]);

  const limpiarFiltros = () => {
    setFiltros({
      materialId: null,
      piedrasMin: 0,
      piedrasMax: rangos.piedrasMax,
      precioMin: rangos.precioMin,
      precioMax: rangos.precioMax,
      tiposPiedra: [],
    });
  };

  return (
    <FiltrosContext.Provider
      value={{
        filtros,
        rangos,
        setFiltros,
        limpiarFiltros,
        isLoading: loading,
        joyas,
        materials,
        stones,
      }}
    >
      {children}
    </FiltrosContext.Provider>
  );
};

export const useFiltrosContext = () => {
  const context = useContext(FiltrosContext);
  if (context === undefined) {
    throw new Error("useFiltrosContext must be used within a FiltrosProvider");
  }
  return context;
};

export const useJoyasDelCatalogo = () => {
  const context = useContext(FiltrosContext);
  if (context === undefined) {
    throw new Error("useJoyasDelCatalogo must be used within a FiltrosProvider");
  }

  const { filtros } = context as FiltrosContextValue & {
    jewels?: JoyaWithRelations[];
    materials?: Material[];
    stones?: Stone[];
  };

  return useFiltrosContext();
};
