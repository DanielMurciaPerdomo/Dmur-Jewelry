import { useEffect, useState } from "react";
import { fetchMaterials } from "../services/materialsService";
import type { Material } from "../types/joya.types";

type Status = "idle" | "loading" | "success" | "error";

// Global cache variables
let cachedMaterials: Material[] | null = null;
let cacheStatus: Status = "idle";
let cacheError: string | null = null;
let promise: Promise<Material[]> | null = null;

export const useMaterials = () => {
  const [materials, setMaterials] = useState<Material[]>(cachedMaterials || []);
  const [status, setStatus] = useState<Status>(cacheStatus);
  const [errorMessage, setErrorMessage] = useState<string | null>(cacheError);

  useEffect(() => {
    // If data is already cached, return immediately
    if (cachedMaterials !== null) {
      setMaterials(cachedMaterials);
      setStatus("success");
      return;
    }

    let cancelled = false;

    // If a request is already in progress, wait for it
    if (promise) {
      promise
        .then((data) => {
          if (!cancelled) {
            setMaterials(data);
            setStatus("success");
          }
        })
        .catch((err) => {
          if (!cancelled) {
            setMaterials([]);
            setErrorMessage("No pudimos cargar los materiales. Intenta de nuevo más tarde.");
            setStatus("error");
          }
        });
      return;
    }

    // Start the request
    setStatus("loading");
    setErrorMessage(null);
    promise = fetchMaterials();

    promise
      .then((data) => {
        if (!cancelled) {
          cachedMaterials = data;
          cacheStatus = "success";
          setMaterials(data);
          setStatus("success");
        }
      })
      .catch((err) => {
        if (!cancelled) {
          cachedMaterials = null;
          cacheStatus = "error";
          cacheError = "No pudimos cargar los materiales. Intenta de nuevo más tarde.";
          setMaterials([]);
          setErrorMessage(cacheError);
          setStatus("error");
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return { materials, status, errorMessage, isLoading: status === "loading" };
};
