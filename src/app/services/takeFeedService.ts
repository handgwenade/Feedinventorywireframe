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

export interface CreateK2StatementInput {
  cart: TakeFeedCartItem[];
  notes: string;
}

export interface CreateK2StatementResult {
  statementId: string;
  displayNumber: string;
  subtotal: number;
  total: number;
  accountId: string;
  accountName: string;
}

interface CreateCustomerUnpaidInvoiceRow {
  invoice_id: string;
  display_number: string;
  subtotal: number | string;
  tax: number | string;
  total: number | string;
  balance_due: number | string;
}

interface CreateK2StatementRow {
  statement_id: string;
  display_number: string;
  subtotal: number | string;
  total: number | string;
  account_id: string;
  account_name: string;
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

function mapK2StatementResult(row: CreateK2StatementRow): CreateK2StatementResult {
  return {
    statementId: row.statement_id,
    displayNumber: row.display_number,
    subtotal: Number(row.subtotal),
    total: Number(row.total),
    accountId: row.account_id,
    accountName: row.account_name,
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

  async createK2Statement({
    cart,
    notes,
  }: CreateK2StatementInput): Promise<CreateK2StatementResult> {
    const { data, error } = await supabase.rpc('create_k2_take_feed_statement', {
      p_notes: notes,
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
      throw new Error('K2 statement was not created.');
    }

    return mapK2StatementResult(row as CreateK2StatementRow);
  },
};
