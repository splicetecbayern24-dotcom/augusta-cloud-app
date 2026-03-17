import type { InvoiceItem } from "@/types/invoice";

export function calcLineTotal(item: InvoiceItem) {
  return Number(item.qty || 0) * Number(item.unit_price || 0);
}

export function calcNet(items: InvoiceItem[]) {
  return items.reduce((sum, item) => sum + calcLineTotal(item), 0);
}

export function calcVat(items: InvoiceItem[], vatRate: number) {
  return calcNet(items) * (Number(vatRate || 0) / 100);
}

export function calcGross(items: InvoiceItem[], vatRate: number) {
  return calcNet(items) + calcVat(items, vatRate);
}

export function formatEuro(value: number | string | null | undefined) {
  return new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: "EUR",
  }).format(Number(value || 0));
}
