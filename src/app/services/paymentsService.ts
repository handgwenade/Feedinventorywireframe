import { supabase } from './supabaseClient';
import { invoicesService } from './invoicesService';
import type { InvoiceListItem } from './invoicesService';

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

export interface PaymentReceivedItem {
  id: string;
  invoiceRecordId: string;
  amount: number;
  method: InvoicePaymentMethod;
  referenceNumber?: string;
  notes?: string;
  receivedByUserId?: string;
  receivedByName: string;
  receivedAt: string;
  createdAt: string;
  invoice?: InvoiceListItem;
  invoiceDisplayNumber: string;
  accountName: string;
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

interface PaymentRow {
  id: string;
  invoice_record_id: string;
  amount: number | string;
  method: InvoicePaymentMethod;
  reference_number: string | null;
  notes: string | null;
  received_by: string | null;
  received_at: string;
  created_at: string;
}

interface UserProfileRow {
  id: string;
  display_name: string | null;
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

async function listReceivedFromSupabase(): Promise<PaymentReceivedItem[]> {
  const { data: paymentRows, error: paymentError } = await supabase
    .from('payments')
    .select('id, invoice_record_id, amount, method, reference_number, notes, received_by, received_at, created_at')
    .order('received_at', { ascending: false });

  if (paymentError) {
    throw new Error(`${paymentError.message}${paymentError.details ? ` — ${paymentError.details}` : ''}`);
  }

  const payments = (paymentRows ?? []) as PaymentRow[];
  const invoices = await invoicesService.list();
  const invoiceById = new Map(invoices.map((invoice) => [invoice.id, invoice]));
  const receivedByIds = Array.from(new Set(payments.map((payment) => payment.received_by).filter(Boolean))) as string[];
  let usersById = new Map<string, string>();

  if (receivedByIds.length > 0) {
    const { data: userRows, error: userError } = await supabase
      .from('user_profiles')
      .select('id, display_name')
      .in('id', receivedByIds);

    if (userError) {
      throw new Error(`${userError.message}${userError.details ? ` — ${userError.details}` : ''}`);
    }

    usersById = new Map(
      ((userRows ?? []) as UserProfileRow[]).map((user) => [
        user.id,
        user.display_name ?? 'Unknown User',
      ]),
    );
  }

  return payments.map((payment) => {
    const invoice = invoiceById.get(payment.invoice_record_id);

    return {
      id: payment.id,
      invoiceRecordId: payment.invoice_record_id,
      amount: Number(payment.amount),
      method: payment.method,
      referenceNumber: payment.reference_number ?? undefined,
      notes: payment.notes ?? undefined,
      receivedByUserId: payment.received_by ?? undefined,
      receivedByName: payment.received_by
        ? usersById.get(payment.received_by) ?? 'Unknown User'
        : 'Unknown User',
      receivedAt: payment.received_at,
      createdAt: payment.created_at,
      invoice,
      invoiceDisplayNumber: invoice?.displayNumber ?? 'Unknown Invoice',
      accountName: invoice?.accountName ?? 'Unknown Account',
    };
  });
}

export const paymentsService = {
  async listReceived(): Promise<PaymentReceivedItem[]> {
    return listReceivedFromSupabase();
  },

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
