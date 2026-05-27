import { supabase } from './supabaseClient';

export interface AddProductStockInput {
  productId: string;
  quantityAdded: number;
  vendorNote: string;
  notes: string;
}

export interface AddProductStockResult {
  productId: string;
  productName: string;
  quantityAdded: number;
  quantityBefore: number;
  quantityAfter: number;
  unitLabel: string;
  inventoryTransactionId: string;
}

export interface AdjustProductCountInput {
  productId: string;
  newQuantity: number;
  reason: string;
  notes: string;
}

export interface AdjustProductCountResult {
  productId: string;
  productName: string;
  quantityBefore: number;
  quantityAfter: number;
  quantityChange: number;
  unitLabel: string;
  reason: string;
  inventoryTransactionId: string;
}

interface AddProductStockRow {
  product_id: string;
  product_name: string;
  quantity_added: number | string;
  quantity_before: number | string;
  quantity_after: number | string;
  unit_label: string;
  inventory_transaction_id: string;
}

interface AdjustProductCountRow {
  product_id: string;
  product_name: string;
  quantity_before: number | string;
  quantity_after: number | string;
  quantity_change: number | string;
  unit_label: string;
  reason: string;
  inventory_transaction_id: string;
}

function mapAddProductStockResult(row: AddProductStockRow): AddProductStockResult {
  return {
    productId: row.product_id,
    productName: row.product_name,
    quantityAdded: Number(row.quantity_added),
    quantityBefore: Number(row.quantity_before),
    quantityAfter: Number(row.quantity_after),
    unitLabel: row.unit_label,
    inventoryTransactionId: row.inventory_transaction_id,
  };
}

function mapAdjustProductCountResult(row: AdjustProductCountRow): AdjustProductCountResult {
  return {
    productId: row.product_id,
    productName: row.product_name,
    quantityBefore: Number(row.quantity_before),
    quantityAfter: Number(row.quantity_after),
    quantityChange: Number(row.quantity_change),
    unitLabel: row.unit_label,
    reason: row.reason,
    inventoryTransactionId: row.inventory_transaction_id,
  };
}

export const inventoryService = {
  async addProductStock({
    productId,
    quantityAdded,
    vendorNote,
    notes,
  }: AddProductStockInput): Promise<AddProductStockResult> {
    const { data, error } = await supabase.rpc('add_product_stock', {
      p_product_id: productId,
      p_quantity_added: quantityAdded,
      p_vendor_note: vendorNote,
      p_notes: notes,
    });

    if (error) {
      throw new Error(`${error.message}${error.details ? ` — ${error.details}` : ''}`);
    }

    const row = Array.isArray(data) ? data[0] : data;

    if (!row) {
      throw new Error('Stock was not added.');
    }

    return mapAddProductStockResult(row as AddProductStockRow);
  },

  async adjustProductCount({
    productId,
    newQuantity,
    reason,
    notes,
  }: AdjustProductCountInput): Promise<AdjustProductCountResult> {
    const { data, error } = await supabase.rpc('adjust_product_count', {
      p_product_id: productId,
      p_new_quantity: newQuantity,
      p_reason: reason,
      p_notes: notes,
    });

    if (error) {
      throw new Error(`${error.message}${error.details ? ` — ${error.details}` : ''}`);
    }

    const row = Array.isArray(data) ? data[0] : data;

    if (!row) {
      throw new Error('Count was not adjusted.');
    }

    return mapAdjustProductCountResult(row as AdjustProductCountRow);
  },
};
