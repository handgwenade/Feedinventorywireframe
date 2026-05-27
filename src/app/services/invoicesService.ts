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
  totalQuantity: number;
  number: string;
  account: string;
  balance: number;
  taxAmount: number;
  amountPaid: number;
}

export interface InvoiceDetailLineItem {
  id: string;
  productId?: string;
  description: string;
  quantity: number;
  unitLabel: string;
  unitPrice: number;
  lineTotal: number;
}

export interface InvoiceDetailRecord extends InvoiceListItem {
  lineItems: InvoiceDetailLineItem[];
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
  id?: string;
  invoice_record_id: string;
  product_id?: string | null;
  description: string;
  quantity: number | string;
  unit_label: string;
  unit_price?: number | string;
  line_total?: number | string;
}

function mapLineItem(row: InvoiceLineItemRow): InvoiceDetailLineItem {
  return {
    id: row.id ?? `${row.invoice_record_id}-${row.description}`,
    productId: row.product_id ?? undefined,
    description: row.description,
    quantity: Number(row.quantity),
    unitLabel: row.unit_label,
    unitPrice: Number(row.unit_price ?? 0),
    lineTotal: Number(row.line_total ?? 0),
  };
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

function getTotalQuantity(invoiceId: string, lineItems: InvoiceLineItemRow[]): number {
  return lineItems
    .filter((item) => item.invoice_record_id === invoiceId)
    .reduce((total, item) => total + Number(item.quantity), 0);
}

function getDetailProductsSummary(lineItems: InvoiceDetailLineItem[]): string {
  if (lineItems.length === 0) return 'No line items';

  return lineItems
    .map((item) => `${item.description}, ${item.quantity} ${item.unitLabel}`)
    .join('; ');
}

function mapInvoiceRow(
  invoice: InvoiceRecordRow,
  accountName: string,
  productsSummary: string,
  totalQuantity = 0,
): InvoiceListItem {
  const type = getInvoiceType(invoice.record_type);
  const total = Number(invoice.total);
  const balanceDue = Number(invoice.balance_due);
  const tax = Number(invoice.tax);

  return {
    id: invoice.id,
    displayNumber: invoice.display_number,
    recordType: invoice.record_type,
    accountId: invoice.account_id ?? undefined,
    personId: invoice.person_id ?? undefined,
    issueDate: invoice.issue_date,
    createdAt: invoice.created_at,
    subtotal: Number(invoice.subtotal),
    tax,
    total,
    balanceDue,
    status: invoice.status,
    notes: invoice.notes ?? undefined,
    accountName,
    type,
    productsSummary,
    totalQuantity,
    number: invoice.display_number,
    account: accountName,
    balance: balanceDue,
    taxAmount: tax,
    amountPaid: Math.max(total - balanceDue, 0),
  };
}

async function resolveAccountName(invoice: InvoiceRecordRow): Promise<string> {
  if (invoice.account_id) {
    const accounts = await accountsService.listActive();
    return accounts.find((account) => account.id === invoice.account_id)?.name ?? 'Unknown Account';
  }

  if (invoice.person_id) {
    const people = await peopleService.list();
    return people.find((person) => person.id === invoice.person_id)?.officialDisplayName ?? 'Unknown Person';
  }

  return 'Unknown';
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
      ...mapInvoiceRow(invoice, accountName, getProductsSummary(invoice.id, lineItems)),
      totalQuantity: getTotalQuantity(invoice.id, lineItems),
      type,
      balanceDue,
    };
  });
}

async function getByIdFromSupabase(invoiceId: string): Promise<InvoiceDetailRecord | null> {
  const { data: invoiceRow, error: invoiceError } = await supabase
    .from('invoice_records')
    .select('id, display_number, record_type, account_id, person_id, issue_date, created_at, subtotal, tax, total, balance_due, status, notes')
    .eq('id', invoiceId)
    .maybeSingle();

  if (invoiceError) {
    throw new Error(`${invoiceError.message}${invoiceError.details ? ` — ${invoiceError.details}` : ''}`);
  }

  if (!invoiceRow) {
    return null;
  }

  const invoice = invoiceRow as InvoiceRecordRow;

  const { data: lineItemRows, error: lineItemError } = await supabase
    .from('invoice_line_items')
    .select('id, invoice_record_id, product_id, description, quantity, unit_label, unit_price, line_total')
    .eq('invoice_record_id', invoiceId)
    .order('created_at', { ascending: true });

  if (lineItemError) {
    throw new Error(`${lineItemError.message}${lineItemError.details ? ` — ${lineItemError.details}` : ''}`);
  }

  const lineItems = ((lineItemRows ?? []) as InvoiceLineItemRow[]).map(mapLineItem);
  const accountName = await resolveAccountName(invoice);

  return {
    ...mapInvoiceRow(
      invoice,
      accountName,
      getDetailProductsSummary(lineItems),
      lineItems.reduce((total, item) => total + item.quantity, 0),
    ),
    lineItems,
  };
}

export const invoicesService = {
  async getById(invoiceId: string): Promise<InvoiceDetailRecord | null> {
    return getByIdFromSupabase(invoiceId);
  },

  async list(): Promise<InvoiceListItem[]> {
    return listFromSupabase();
  },
};
