import { supabase } from './supabaseClient';

export type InvoicePaymentMethod = 'cash' | 'check' | 'card' | 'transfer' | 'other';

export interface RecordInvoicePaymentInput {
  invoiceRecordId: string;
  amount: number;
  method: InvoicePaymentMethod;
  referenceNumber?: string;
  notes?: string;
}

export interface RecordInvoicePaymentResult {
  paymentId: string;
  invoiceRecordId: string;
  displayNumber: string;
  amount: number;
  method: InvoicePaymentMethod;
  previousBalanceDue: number;
  newBalanceDue: number;
  status: string;
}

interface RecordInvoicePaymentRow {
  payment_id: string;
  invoice_record_id: string;
  display_number: string;
  amount: number | string;
  method: InvoicePaymentMethod;
  previous_balance_due: number | string;
  new_balance_due: number | string;
  status: string;
}

function mapPaymentResult(row: RecordInvoicePaymentRow): RecordInvoicePaymentResult {
  return {
    paymentId: row.payment_id,
    invoiceRecordId: row.invoice_record_id,
    displayNumber: row.display_number,
    amount: Number(row.amount),
    method: row.method,
    previousBalanceDue: Number(row.previous_balance_due),
    newBalanceDue: Number(row.new_balance_due),
    status: row.status,
  };
}

export const paymentsService = {
  async recordInvoicePayment({
    invoiceRecordId,
    amount,
    method,
    referenceNumber,
    notes,
  }: RecordInvoicePaymentInput): Promise<RecordInvoicePaymentResult> {
    const { data, error } = await supabase.rpc('record_invoice_payment', {
      p_invoice_record_id: invoiceRecordId,
      p_amount: amount,
      p_method: method,
      p_reference_number: referenceNumber ?? '',
      p_notes: notes ?? '',
    });

    if (error) {
      throw new Error(`${error.message}${error.details ? ` — ${error.details}` : ''}`);
    }

    const row = Array.isArray(data) ? data[0] : data;

    if (!row) {
      throw new Error('Payment was not recorded.');
    }

    return mapPaymentResult(row as RecordInvoicePaymentRow);
  },
};
