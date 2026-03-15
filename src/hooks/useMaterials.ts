import { useEffect, useState } from "react";
import { fetchMaterials } from "../services/materialsService";
import type { Material } from "../types/joya.types";

type Status = "idle" | "loading" | "success" | "error";

export const useMaterials = () => {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [status, setStatus] = useState<Status>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setStatus("loading");
    setErrorMessage(null);

    fetchMaterials()
      .then((data) => {
        if (!cancelled) {
          setMaterials(data);
          setStatus("success");
        }
      })
      .catch(() => {
        if (!cancelled) {
          setMaterials([]);
          setErrorMessage("No pudimos cargar los materiales. Intenta de nuevo más tarde.");
          setStatus("error");
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return { materials, status, errorMessage, isLoading: status === "loading" };
};
