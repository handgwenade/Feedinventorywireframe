import type { InvoiceLineItem, Product } from '../types';

export function calculateInventoryValue(product: Product): number {
  return roundCurrency(product.currentQuantity * product.salePrice);
}

export function isLowStock(product: Product): boolean {
  return product.currentQuantity <= product.minimumQuantity;
}

export function calculateLineTotal(quantity: number, unitPrice: number): number {
  return roundCurrency(quantity * unitPrice);
}

export function calculateInvoiceSubtotal(lineItems: InvoiceLineItem[]): number {
  return roundCurrency(
    lineItems.reduce((total, item) => total + item.lineTotal, 0),
  );
}

export function calculateBalanceDue(total: number, amountPaid: number): number {
  return roundCurrency(Math.max(total - amountPaid, 0));
}

export function roundCurrency(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(value);
}