import type { CarritoItem, JoyaWithRelations } from "../types/joya.types";

/** Número solo dígitos, sin +. Usar hasta que exista settings.whatsapp_number en Supabase. */
export const FALLBACK_WHATSAPP_NUMBER = "573000000000";

export const buildSingleProductMessage = (
  product: JoyaWithRelations,
  businessName: string = "D´mur Joyería"
): string => {
  const lines: string[] = [
    `Hola! Me interesa este producto de ${businessName}:`,
    "",
    `${product.name} - ${product.final_price} COP`,
    `Tipo: ${product.product_type?.name || "N/A"}`,
    product.material?.name ? `Material: ${product.material.name}` : null,
    product.stones && product.stones.length > 0
      ? `Piedras: ${product.stones.map((s) => `${s.stone_type} x${s.quantity}`).join(", ")}`
      : null,
    "",
    "Me gustaría recibir más información. ¡Gracias!",
  ].filter((line) => line !== null) as string[];

  return lines.join("\n");
};

export const buildWhatsappMessage = (
  items: CarritoItem[],
  businessName: string = "D´mur Joyería"
): string => {
  if (items.length === 0) {
    return `Hola! Me gustaría recibir información sobre las joyas de ${businessName}.`;
  }

  const lines: string[] = [
    `Hola! Me interesan los siguientes productos de ${businessName}:`,
    "",
    ...items.map(
      (item, index) =>
        `${index + 1}. ${item.product.name} - x${item.quantity} (${item.product.final_price} COP)`
    ),
    "",
    "Me gustaría recibir más información. ¡Gracias!",
  ];

  return lines.join("\n");
};

export const buildWhatsappUrl = (whatsappNumber: string, message: string): string => {
  const encoded = encodeURIComponent(message);
  return `https://wa.me/${whatsappNumber}?text=${encoded}`;
};
