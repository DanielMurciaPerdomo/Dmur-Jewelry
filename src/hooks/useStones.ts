import { useEffect, useState } from "react";
import { fetchStones } from "../services/piedrasService";
import type { Stone } from "../types/joya.types";

type Status = "idle" | "loading" | "success" | "error";

// Global cache variables
let cachedStones: Stone[] | null = null;
let cacheStatus: Status = "idle";
let cacheError: string | null = null;
let promise: Promise<Stone[]> | null = null;

export const useStones = () => {
  const [stones, setStones] = useState<Stone[]>(cachedStones || []);
  const [status, setStatus] = useState<Status>(cacheStatus);
  const [errorMessage, setErrorMessage] = useState<string | null>(cacheError);

  useEffect(() => {
    // If data is already cached, return immediately
    if (cachedStones !== null) {
      setStones(cachedStones);
      setStatus("success");
      return;
    }

    let cancelled = false;

    // If a request is already in progress, wait for it
    if (promise) {
      promise
        .then((data) => {
          if (!cancelled) {
            setStones(data);
            setStatus("success");
          }
        })
        .catch((err) => {
          if (!cancelled) {
            setStones([]);
            setErrorMessage("No pudimos cargar las piedras. Intenta de nuevo más tarde.");
            setStatus("error");
          }
        });
      return;
    }

    // Start the request
    setStatus("loading");
    setErrorMessage(null);
    promise = fetchStones();

    promise
      .then((data) => {
        if (!cancelled) {
          cachedStones = data;
          cacheStatus = "success";
          setStones(data);
          setStatus("success");
        }
      })
      .catch((err) => {
        if (!cancelled) {
          cachedStones = null;
          cacheStatus = "error";
          cacheError = "No pudimos cargar las piedras. Intenta de nuevo más tarde.";
          setStones([]);
          setErrorMessage(cacheError);
          setStatus("error");
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  // Helper function to add a new stone to the cache
  const addStoneToCache = (newStone: Stone) => {
    if (cachedStones) {
      cachedStones = [...cachedStones, newStone];
      setStones(cachedStones);
    }
  };

  return { stones, status, errorMessage, isLoading: status === "loading", addStoneToCache };
};
