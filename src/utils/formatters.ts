export const formatCurrencyCOP = (value: number): string =>
  new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0,
  }).format(value);

export const formatPrice = (value: number): string => {
  return new Intl.NumberFormat("es-CO", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(value);
};

export const toPascalCase = (str: string): string => {
  return str.replace(/(?:^\s*|\s+)([a-zA-Z])/g, (_, char) => char.toUpperCase()).trim();
};
