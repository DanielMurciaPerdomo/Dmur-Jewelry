import { ButtonHTMLAttributes } from "react";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement>;

const baseButton =
  "rounded-md px-4 py-2 text-sm font-medium shadow-sm transition focus:outline-none focus:ring-2 focus:ring-metallic-gold-400 focus:ring-offset-2 focus:ring-offset-metallic-gold-50 dark:focus:ring-ocean-mist-400 dark:focus:ring-offset-slate-950 disabled:opacity-50";

const variantPrimary =
  "bg-metallic-gold-500 text-metallic-gold-950 hover:bg-metallic-gold-600 dark:bg-ocean-mist-400 dark:text-slate-950 dark:hover:bg-ocean-mist-300";

export const Button = ({ className = "", ...props }: ButtonProps) => (
  <button className={`${baseButton} ${variantPrimary} ${className}`} {...props} />
);
