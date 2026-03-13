import { useEffect, useState } from "react";
import { getSettings } from "../services/settingsService";
import type { Settings } from "../services/settingsService";

export const useSettings = () => {
  const [settings, setSettings] = useState<Settings | null>(null);

  useEffect(() => {
    let cancelled = false;
    getSettings()
      .then((data) => {
        if (!cancelled) setSettings(data);
      })
      .catch(() => {
        if (!cancelled) setSettings(null);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  return settings;
};
