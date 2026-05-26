import { supabase } from './supabaseClient';

export interface TakeFeedCartItem {
  productId: string;
  name: string;
  quantity: number;
  price: number;
  unitLabel?: string;
}

export interface CreateCustomerUnpaidInvoiceInput {
  customerId: string;
  cart: TakeFeedCartItem[];
  notes: string;
  tax: number;
}

export interface CreateCustomerUnpaidInvoiceResult {
  invoiceId: string;
  displayNumber: string;
  subtotal: number;
  tax: number;
  total: number;
  balanceDue: number;
}

interface CreateCustomerUnpaidInvoiceRow {
  invoice_id: string;
  display_number: string;
  subtotal: number | string;
  tax: number | string;
  total: number | string;
  balance_due: number | string;
}

function mapInvoiceResult(row: CreateCustomerUnpaidInvoiceRow): CreateCustomerUnpaidInvoiceResult {
  return {
    invoiceId: row.invoice_id,
    displayNumber: row.display_number,
    subtotal: Number(row.subtotal),
    tax: Number(row.tax),
    total: Number(row.total),
    balanceDue: Number(row.balance_due),
  };
}

export const takeFeedService = {
  async createCustomerUnpaidInvoice({
    customerId,
    cart,
    notes,
    tax,
  }: CreateCustomerUnpaidInvoiceInput): Promise<CreateCustomerUnpaidInvoiceResult> {
    const { data, error } = await supabase.rpc('create_customer_take_feed_invoice', {
      p_account_id: customerId,
      p_notes: notes,
      p_tax: tax,
      p_items: cart.map((item) => ({
        productId: item.productId,
        name: item.name,
        quantity: item.quantity,
        price: item.price,
        unitLabel: item.unitLabel ?? 'units',
      })),
    });

    if (error) {
      throw new Error(`${error.message}${error.details ? ` — ${error.details}` : ''}`);
    }

    const row = Array.isArray(data) ? data[0] : data;

    if (!row) {
      throw new Error('Invoice was not created.');
    }

    return mapInvoiceResult(row as CreateCustomerUnpaidInvoiceRow);
  },
};
