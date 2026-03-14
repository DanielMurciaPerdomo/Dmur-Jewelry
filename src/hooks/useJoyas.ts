import { useEffect, useState } from "react";
import { fetchActiveProductsWithRelations } from "../services/joyasService";
import type { JoyaWithRelations } from "../types/joya.types";

type Status = "idle" | "loading" | "success" | "error";

export const useJoyas = () => {
  const [joyas, setJoyas] = useState<JoyaWithRelations[]>([]);
  const [status, setStatus] = useState<Status>("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setStatus("loading");
    setErrorMessage(null);

    fetchActiveProductsWithRelations()
      .then((data) => {
        if (!cancelled) {
          setJoyas(data);
          setStatus("success");
        }
      })
      .catch(() => {
        if (!cancelled) {
          setJoyas([]);
          setErrorMessage("No pudimos cargar las joyas. Intenta de nuevo más tarde.");
          setStatus("error");
        }
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return { joyas, status, errorMessage, isLoading: status === "loading" };
};
