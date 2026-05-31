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

interface InvoiceStatusActionRow {
  invoice_record_id: string;
  display_number: string;
  previous_balance_due: string;
  new_balance_due: string;
  status: string;
  previous_status?: string;
}

export interface InvoiceStatusActionResult {
  invoiceRecordId: string;
  displayNumber: string;
  previousBalanceDue: number;
  newBalanceDue: number;
  status: string;
  previousStatus?: string;
}

export interface MarkInvoiceWrittenOffInput {
  invoiceId: string;
  reason: string;
}

export interface VoidInvoiceInput {
  invoiceId: string;
  reason: string;
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
    const { data: acc } = await supabase
      .from('accounts')
      .select('id, name, is_active')
      .eq('id', invoice.account_id)
      .maybeSingle();

    if (acc) return `${acc.name}${acc.is_active ? '' : ' (Archived)'}`;
    return 'Unknown Account';
  }

  if (invoice.person_id) {
    const { data: person } = await supabase
      .from('people')
      .select('id, official_display_name, is_active')
      .eq('id', invoice.person_id)
      .maybeSingle();

    if (person) return `${person.official_display_name}${person.is_active ? '' : ' (Archived)'}`;
    return 'Unknown Person';
  }

  return 'Unknown';
}

async function listFromSupabase(): Promise<InvoiceListItem[]> {
  const { data: invoiceRows, error: invoiceError } = await supabase
    .from('invoice_records')
    .select('id, display_number, record_type, account_id, person_id, issue_date, created_at, subtotal, tax, total, balance_due, status, notes')
    .neq('record_type', 'family_use')
    .order('created_at', { ascending: false });

  if (invoiceError) {
    throw new Error(`${invoiceError.message}${invoiceError.details ? ` — ${invoiceError.details}` : ''}`);
  }

  const invoices = (invoiceRows ?? []) as InvoiceRecordRow[];

  const [{ data: lineItemRows, error: lineItemError }, accountsRows, peopleRows] = await Promise.all([
    supabase
      .from('invoice_line_items')
      .select('invoice_record_id, description, quantity, unit_label'),
    supabase.from('accounts').select('id, account_type, name, phone, email, billing_address, notes, is_active'),
    supabase.from('people').select('id, official_display_name, phone, notes, is_active'),
  ]);

  if (lineItemError) {
    throw new Error(`${lineItemError.message}${lineItemError.details ? ` — ${lineItemError.details}` : ''}`);
  }

  const lineItems = (lineItemRows ?? []) as InvoiceLineItemRow[];
  const accounts = (accountsRows?.data ?? []) as any[];
  const people = (peopleRows?.data ?? []) as any[];

  return invoices.map((invoice) => {
    const type = getInvoiceType(invoice.record_type);
    let accountName = 'Unknown';

    if (invoice.account_id) {
      const acc = accounts.find((a) => a.id === invoice.account_id);
      if (acc) accountName = `${acc.name}${acc.is_active ? '' : ' (Archived)'}`;
      else accountName = 'Unknown Account';
    } else if (invoice.person_id) {
      const person = people.find((p) => p.id === invoice.person_id);
      if (person) accountName = `${person.official_display_name}${person.is_active ? '' : ' (Archived)'}`;
      else accountName = 'Unknown Person';
    } else {
      accountName = 'Unknown';
    }
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

function mapInvoiceStatusActionRow(row: InvoiceStatusActionRow): InvoiceStatusActionResult {
  return {
    invoiceRecordId: row.invoice_record_id,
    displayNumber: row.display_number,
    previousBalanceDue: Number(row.previous_balance_due),
    newBalanceDue: Number(row.new_balance_due),
    status: row.status,
    previousStatus: row.previous_status,
  };
}

export const invoicesService = {
  async getById(invoiceId: string): Promise<InvoiceDetailRecord | null> {
    return getByIdFromSupabase(invoiceId);
  },

  async list(): Promise<InvoiceListItem[]> {
    return listFromSupabase();
  },

  async markInvoiceWrittenOff({ invoiceId, reason }: MarkInvoiceWrittenOffInput): Promise<InvoiceStatusActionResult> {
    const { data, error } = await supabase.rpc('mark_invoice_written_off', {
      p_invoice_record_id: invoiceId,
      p_reason: reason,
    });

    if (error) {
      throw new Error(`${error.message}${error.details ? ` — ${error.details}` : ''}`);
    }

    const row = Array.isArray(data) ? data[0] : data;

    if (!row) {
      throw new Error('Failed to mark invoice written off.');
    }

    return mapInvoiceStatusActionRow(row as InvoiceStatusActionRow);
  },

  async voidInvoice({ invoiceId, reason }: VoidInvoiceInput): Promise<InvoiceStatusActionResult> {
    const { data, error } = await supabase.rpc('void_invoice', {
      p_invoice_record_id: invoiceId,
      p_reason: reason,
    });

    if (error) {
      throw new Error(`${error.message}${error.details ? ` — ${error.details}` : ''}`);
    }

    const row = Array.isArray(data) ? data[0] : data;

    if (!row) {
      throw new Error('Failed to void invoice.');
    }

    return mapInvoiceStatusActionRow(row as InvoiceStatusActionRow);
  },
};
