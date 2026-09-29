import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(
  amount: number | string | { toString: () => string },
  currency: string = "EGP",
  locale: string = "ar-EG"
): string {
  const numericAmount = typeof amount === "number" ? amount : parseFloat(amount.toString());
  if (isNaN(numericAmount)) return "0.00 " + currency;

  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: currency === "EGP" ? "EGP" : currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(numericAmount);
}

export function formatQuantity(
  qty: number | string | { toString: () => string },
  uomSymbol?: string
): string {
  const numericQty = typeof qty === "number" ? qty : parseFloat(qty.toString());
  if (isNaN(numericQty)) return "0";
  const formatted = new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 4,
  }).format(numericQty);

  return uomSymbol ? `${formatted} ${uomSymbol}` : formatted;
}
