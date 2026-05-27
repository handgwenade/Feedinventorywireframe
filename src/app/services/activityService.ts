import { accountsService } from './accountsService';
import { invoicesService } from './invoicesService';
import { peopleService } from './peopleService';
import { productsService } from './productsService';
import { supabase } from './supabaseClient';

export type ActivityRecordBadge = 'customer' | 'k2' | 'family';

export interface ActivityInventoryTransaction {
  id: string;
  productId?: string;
  transactionType: string;
  quantityChange: number;
  quantityBefore: number;
  quantityAfter: number;
  unitPrice?: number;
  notes?: string;
  createdAt: string;
}

export interface ActivityItem {
  id: string;
  activityType: string;
  summary: string;
  createdAt: string;
  actorUserId?: string;
  actorUserName: string;
  productId?: string;
  productName?: string;
  accountId?: string;
  accountName?: string;
  personId?: string;
  personName?: string;
  invoiceRecordId?: string;
  invoiceDisplayNumber?: string;
  inventoryTransactionId?: string;
  inventoryTransaction?: ActivityInventoryTransaction;
  paymentId?: string;
  paymentAmount?: number;
  metadata?: Record<string, unknown>;
  recordBadge?: ActivityRecordBadge;
}

interface ActivityRow {
  id: string;
  actor_user_id: string | null;
  activity_type: string;
  summary: string;
  product_id: string | null;
  account_id: string | null;
  person_id: string | null;
  invoice_record_id: string | null;
  inventory_transaction_id: string | null;
  payment_id: string | null;
  metadata: Record<string, unknown> | null;
  created_at: string;
}

interface UserProfileRow {
  id: string;
  display_name: string | null;
}

interface InventoryTransactionRow {
  id: string;
  product_id: string | null;
  transaction_type: string;
  quantity_change: number | string;
  quantity_before: number | string;
  quantity_after: number | string;
  unit_price: number | string | null;
  notes: string | null;
  created_at: string;
}

interface PaymentRow {
  id: string;
  amount: number | string;
}

function getRecordBadge({
  invoiceType,
  accountType,
  personId,
}: {
  invoiceType?: string;
  accountType?: string;
  personId?: string;
}): ActivityRecordBadge | undefined {
  if (invoiceType === 'customer_invoice') return 'customer';
  if (invoiceType === 'k2_statement') return 'k2';
  if (invoiceType === 'family_use') return 'family';
  if (accountType === 'customer') return 'customer';
  if (accountType === 'k2') return 'k2';
  if (personId) return 'family';
  return undefined;
}

function mapInventoryTransaction(row: InventoryTransactionRow): ActivityInventoryTransaction {
  return {
    id: row.id,
    productId: row.product_id ?? undefined,
    transactionType: row.transaction_type,
    quantityChange: Number(row.quantity_change),
    quantityBefore: Number(row.quantity_before),
    quantityAfter: Number(row.quantity_after),
    unitPrice: row.unit_price === null ? undefined : Number(row.unit_price),
    notes: row.notes ?? undefined,
    createdAt: row.created_at,
  };
}

async function listFromSupabase(): Promise<ActivityItem[]> {
  const { data: activityRows, error: activityError } = await supabase
    .from('activity_logs')
    .select('id, actor_user_id, activity_type, summary, product_id, account_id, person_id, invoice_record_id, inventory_transaction_id, payment_id, metadata, created_at')
    .order('created_at', { ascending: false });

  if (activityError) {
    throw new Error(`${activityError.message}${activityError.details ? ` — ${activityError.details}` : ''}`);
  }

  const activities = (activityRows ?? []) as ActivityRow[];
  const actorIds = Array.from(new Set(activities.map((activity) => activity.actor_user_id).filter(Boolean))) as string[];
  const transactionIds = Array.from(new Set(activities.map((activity) => activity.inventory_transaction_id).filter(Boolean))) as string[];
  const paymentIds = Array.from(new Set(activities.map((activity) => activity.payment_id).filter(Boolean))) as string[];

  const [products, accounts, people, invoices] = await Promise.all([
    productsService.list(),
    accountsService.listActive(),
    peopleService.list(),
    invoicesService.list(),
  ]);

  const productById = new Map(products.map((product) => [product.id, product]));
  const accountById = new Map(accounts.map((account) => [account.id, account]));
  const personById = new Map(people.map((person) => [person.id, person]));
  const invoiceById = new Map(invoices.map((invoice) => [invoice.id, invoice]));
  let userById = new Map<string, string>();
  let transactionById = new Map<string, ActivityInventoryTransaction>();
  let paymentById = new Map<string, number>();

  if (actorIds.length > 0) {
    const { data: userRows, error: userError } = await supabase
      .from('user_profiles')
      .select('id, display_name')
      .in('id', actorIds);

    if (userError) {
      throw new Error(`${userError.message}${userError.details ? ` — ${userError.details}` : ''}`);
    }

    userById = new Map(
      ((userRows ?? []) as UserProfileRow[]).map((user) => [
        user.id,
        user.display_name ?? 'Unknown User',
      ]),
    );
  }

  if (transactionIds.length > 0) {
    const { data: transactionRows, error: transactionError } = await supabase
      .from('inventory_transactions')
      .select('id, product_id, transaction_type, quantity_change, quantity_before, quantity_after, unit_price, notes, created_at')
      .in('id', transactionIds);

    if (transactionError) {
      throw new Error(`${transactionError.message}${transactionError.details ? ` — ${transactionError.details}` : ''}`);
    }

    transactionById = new Map(
      ((transactionRows ?? []) as InventoryTransactionRow[]).map((transaction) => [
        transaction.id,
        mapInventoryTransaction(transaction),
      ]),
    );
  }

  if (paymentIds.length > 0) {
    const { data: paymentRows, error: paymentError } = await supabase
      .from('payments')
      .select('id, amount')
      .in('id', paymentIds);

    if (paymentError) {
      throw new Error(`${paymentError.message}${paymentError.details ? ` — ${paymentError.details}` : ''}`);
    }

    paymentById = new Map(
      ((paymentRows ?? []) as PaymentRow[]).map((payment) => [
        payment.id,
        Number(payment.amount),
      ]),
    );
  }

  return activities.map((activity) => {
    const invoice = activity.invoice_record_id ? invoiceById.get(activity.invoice_record_id) : undefined;
    const account = activity.account_id ? accountById.get(activity.account_id) : undefined;
    const person = activity.person_id ? personById.get(activity.person_id) : undefined;
    const product = activity.product_id ? productById.get(activity.product_id) : undefined;
    const transaction = activity.inventory_transaction_id
      ? transactionById.get(activity.inventory_transaction_id)
      : undefined;

    return {
      id: activity.id,
      activityType: activity.activity_type,
      summary: activity.summary,
      createdAt: activity.created_at,
      actorUserId: activity.actor_user_id ?? undefined,
      actorUserName: activity.actor_user_id
        ? userById.get(activity.actor_user_id) ?? 'Unknown User'
        : 'System',
      productId: activity.product_id ?? undefined,
      productName: product?.name,
      accountId: activity.account_id ?? undefined,
      accountName: account?.name ?? invoice?.accountName,
      personId: activity.person_id ?? undefined,
      personName: person?.officialDisplayName,
      invoiceRecordId: activity.invoice_record_id ?? undefined,
      invoiceDisplayNumber: invoice?.displayNumber,
      inventoryTransactionId: activity.inventory_transaction_id ?? undefined,
      inventoryTransaction: transaction,
      paymentId: activity.payment_id ?? undefined,
      paymentAmount: activity.payment_id ? paymentById.get(activity.payment_id) : undefined,
      metadata: activity.metadata ?? undefined,
      recordBadge: getRecordBadge({
        invoiceType: invoice?.recordType,
        accountType: account?.accountType,
        personId: activity.person_id ?? undefined,
      }),
    };
  });
}

export const activityService = {
  async list(): Promise<ActivityItem[]> {
    return listFromSupabase();
  },
};
