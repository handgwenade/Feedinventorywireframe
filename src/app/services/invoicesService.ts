import { accountsService } from './accountsService';
import { peopleService } from './peopleService';
import { supabase } from './supabaseClient';

export type InvoiceListRecordType = 'customer_invoice' | 'k2_statement' | 'family_use';
export type InvoiceListType = 'customer' | 'k2' | 'family';

export interface InvoiceListItem {
  id: string;
  displayNumber: string;
  recordType: InvoiceListRecordType;
  accountId?: string;
  personId?: string;
  issueDate: string;
  createdAt: string;
  subtotal: number;
  tax: number;
  total: number;
  balanceDue: number;
  status: string;
  notes?: string;
  accountName: string;
  type: InvoiceListType;
  productsSummary: string;
  number: string;
  account: string;
  balance: number;
}

interface InvoiceRecordRow {
  id: string;
  display_number: string;
  record_type: InvoiceListRecordType;
  account_id: string | null;
  person_id: string | null;
  issue_date: string;
  created_at: string;
  subtotal: number | string;
  tax: number | string;
  total: number | string;
  balance_due: number | string;
  status: string;
  notes: string | null;
}

interface InvoiceLineItemRow {
  invoice_record_id: string;
  description: string;
  quantity: number | string;
  unit_label: string;
}

function getInvoiceType(recordType: InvoiceListRecordType): InvoiceListType {
  if (recordType === 'k2_statement') return 'k2';
  if (recordType === 'family_use') return 'family';
  return 'customer';
}

function getProductsSummary(invoiceId: string, lineItems: InvoiceLineItemRow[]): string {
  const items = lineItems.filter((item) => item.invoice_record_id === invoiceId);

  if (items.length === 0) return 'No line items';

  return items
    .map((item) => {
      const quantity = Number(item.quantity);
      return `${item.description}, ${quantity} ${item.unit_label || (quantity === 1 ? 'unit' : 'units')}`;
    })
    .join('; ');
}

async function listFromSupabase(): Promise<InvoiceListItem[]> {
  const { data: invoiceRows, error: invoiceError } = await supabase
    .from('invoice_records')
    .select('id, display_number, record_type, account_id, person_id, issue_date, created_at, subtotal, tax, total, balance_due, status, notes')
    .order('created_at', { ascending: false });

  if (invoiceError) {
    throw new Error(`${invoiceError.message}${invoiceError.details ? ` — ${invoiceError.details}` : ''}`);
  }

  const invoices = (invoiceRows ?? []) as InvoiceRecordRow[];

  const [{ data: lineItemRows, error: lineItemError }, accounts, people] = await Promise.all([
    supabase
      .from('invoice_line_items')
      .select('invoice_record_id, description, quantity, unit_label'),
    accountsService.listActive(),
    peopleService.list(),
  ]);

  if (lineItemError) {
    throw new Error(`${lineItemError.message}${lineItemError.details ? ` — ${lineItemError.details}` : ''}`);
  }

  const lineItems = (lineItemRows ?? []) as InvoiceLineItemRow[];

  return invoices.map((invoice) => {
    const type = getInvoiceType(invoice.record_type);
    const accountName = invoice.account_id
      ? accounts.find((account) => account.id === invoice.account_id)?.name ?? 'Unknown Account'
      : invoice.person_id
        ? people.find((person) => person.id === invoice.person_id)?.officialDisplayName ?? 'Unknown Person'
        : 'Unknown';
    const balanceDue = Number(invoice.balance_due);

    return {
      id: invoice.id,
      displayNumber: invoice.display_number,
      recordType: invoice.record_type,
      accountId: invoice.account_id ?? undefined,
      personId: invoice.person_id ?? undefined,
      issueDate: invoice.issue_date,
      createdAt: invoice.created_at,
      subtotal: Number(invoice.subtotal),
      tax: Number(invoice.tax),
      total: Number(invoice.total),
      balanceDue,
      status: invoice.status,
      notes: invoice.notes ?? undefined,
      accountName,
      type,
      productsSummary: getProductsSummary(invoice.id, lineItems),
      number: invoice.display_number,
      account: accountName,
      balance: balanceDue,
    };
  });
}

export const invoicesService = {
  async list(): Promise<InvoiceListItem[]> {
    return listFromSupabase();
  },
};
