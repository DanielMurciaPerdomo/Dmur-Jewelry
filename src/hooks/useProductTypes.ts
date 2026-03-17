import { useEffect, useState } from "react";
import { fetchProductTypes } from "../services/joyasService";
import type { ProductType } from "../types/joya.types";

type Status = "idle" | "loading" | "success" | "error";

// Global cache variables
let cachedProductTypes: ProductType[] | null = null;
let cacheStatus: Status = "idle";
let cacheError: string | null = null;
let promise: Promise<ProductType[]> | null = null;

export const useProductTypes = () => {
  const [productTypes, setProductTypes] = useState<ProductType[]>(cachedProductTypes || []);
  const [status, setStatus] = useState<Status>(cacheStatus);
  const [errorMessage, setErrorMessage] = useState<string | null>(cacheError);

  useEffect(() => {
    // If data is already cached, return immediately
    if (cachedProductTypes !== null) {
      setProductTypes(cachedProductTypes);
      setStatus("success");
      return;
    }

    let cancelled = false;

    // If a request is already in progress, wait for it
    if (promise) {
      promise
        .then((data) => {
          if (!cancelled) {
            setProductTypes(data);
            setStatus("success");
          }
        })
        .catch((err) => {
          if (!cancelled) {
            setProductTypes([]);
            setErrorMessage("No pudimos cargar los tipos de producto. Intenta de nuevo más tarde.");
            setStatus("error");
          }
        });
      return;
    }

    // Start the request
    setStatus("loading");
    setErrorMessage(null);
    promise = fetchProductTypes();

    promise
      .then((data) => {
        if (!cancelled) {
          cachedProductTypes = data;
          cacheStatus = "success";
          setProductTypes(data);
          setStatus("success");
        }
      })
      .catch((err) => {
        if (!cancelled) {
          cachedProductTypes = null;
          cacheStatus = "error";
          cacheError = "No pudimos cargar los tipos de producto. Intenta de nuevo más tarde.";
          setProductTypes([]);
          setErrorMessage(cacheError);
          setStatus("error");
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return { productTypes, status, errorMessage, isLoading: status === "loading" };
};
