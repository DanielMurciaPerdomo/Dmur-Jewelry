import type { CarritoItem } from "../types/joya.types";

export const buildWhatsappMessage = (items: CarritoItem[]): string => {
  if (items.length === 0) {
    return "Hola! Me gustaría recibir información sobre las joyas de Dmur Jewelry.";
  }

  const lines: string[] = [
    "Hola! Me interesan los siguientes productos de Dmur Jewelry:",
    "",
    ...items.map(
      (item, index) =>
        `${index + 1}. ${item.product.name} - x${item.quantity} (${item.product.final_price} COP)`
    ),
    "",
    "Me gustaría recibir más información. ¡Gracias!"
  ];

  return lines.join("\n");
};

export const buildWhatsappUrl = (whatsappNumber: string, message: string): string => {
  const encoded = encodeURIComponent(message);
  return `https://wa.me/${whatsappNumber}?text=${encoded}`;
};

