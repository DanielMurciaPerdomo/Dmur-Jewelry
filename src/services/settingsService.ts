import { supabase } from "./supabaseClient";

export interface Settings {
  id: string;
  whatsapp_number: string;
  currency: string;
  business_name: string | null;
}

export const getSettings = async (): Promise<Settings | null> => {
  const { data, error } = await supabase.from("settings").select("*").limit(1).single();

  if (error && error.code !== "PGRST116") {
    throw error;
  }

  return (data as Settings) ?? null;
};

export const updateSettings = async (
  id: string,
  payload: Partial<Pick<Settings, "whatsapp_number" | "currency" | "business_name">>
): Promise<Settings> => {
  const { data, error } = await supabase
    .from("settings")
    .update(payload)
    .eq("id", id)
    .select("*")
    .single<Settings>();

  if (error) {
    throw error;
  }

  return data;
};

