import { supabase } from './supabaseClient';

export interface InventoryTransactionItem {
  id: string;
  productId: string;
  transactionType: string;
  quantityChange: number;
  quantityBefore: number;
  quantityAfter: number;
  unitPrice?: number;
  sourceRecordType?: string;
  sourceRecordId?: string;
  notes?: string;
  createdAt: string;
}

interface InventoryTransactionRow {
  id: string;
  product_id: string;
  transaction_type: string;
  quantity_change: number | string;
  quantity_before: number | string;
  quantity_after: number | string;
  unit_price: number | string | null;
  source_record_type: string | null;
  source_record_id: string | null;
  notes: string | null;
  created_at: string;
}

function mapInventoryTransaction(row: InventoryTransactionRow): InventoryTransactionItem {
  return {
    id: row.id,
    productId: row.product_id,
    transactionType: row.transaction_type,
    quantityChange: Number(row.quantity_change),
    quantityBefore: Number(row.quantity_before),
    quantityAfter: Number(row.quantity_after),
    unitPrice: row.unit_price === null ? undefined : Number(row.unit_price),
    sourceRecordType: row.source_record_type ?? undefined,
    sourceRecordId: row.source_record_id ?? undefined,
    notes: row.notes ?? undefined,
    createdAt: row.created_at,
  };
}

async function listForProductFromSupabase(productId: string): Promise<InventoryTransactionItem[]> {
  const { data, error } = await supabase
    .from('inventory_transactions')
    .select('id, product_id, transaction_type, quantity_change, quantity_before, quantity_after, unit_price, source_record_type, source_record_id, notes, created_at')
    .eq('product_id', productId)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(`${error.message}${error.details ? ` — ${error.details}` : ''}`);
  }

  return ((data ?? []) as InventoryTransactionRow[]).map(mapInventoryTransaction);
}

export const inventoryTransactionsService = {
  async listForProduct(productId: string): Promise<InventoryTransactionItem[]> {
    return listForProductFromSupabase(productId);
  },
};
