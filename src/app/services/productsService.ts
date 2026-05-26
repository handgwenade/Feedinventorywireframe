import { products as mockProducts } from '../data/mockData';
import type { Product } from '../types';
import { supabase } from './supabaseClient';

interface ProductRow {
  id: string;
  category_id: string | null;
  name: string;
  sku: string | null;
  unit_label: string;
  current_quantity: number;
  minimum_quantity: number;
  sale_price: number;
  cost_per_unit: number | null;
  vendor: string | null;
  source_notes: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

function mapProductRow(row: ProductRow): Product {
  return {
    id: row.id,
    name: row.name,
    categoryId: row.category_id ?? undefined,
    sku: row.sku ?? undefined,
    unitLabel: row.unit_label,
    currentQuantity: Number(row.current_quantity),
    minimumQuantity: Number(row.minimum_quantity),
    salePrice: Number(row.sale_price),
    costPerUnit: row.cost_per_unit === null ? undefined : Number(row.cost_per_unit),
    vendor: row.vendor ?? undefined,
    sourceNotes: row.source_notes ?? undefined,
    isActive: row.is_active,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  } as Product;
}

async function listFromSupabase(): Promise<Product[]> {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('is_active', true)
    .order('name', { ascending: true });

  if (error) {
    throw new Error(`${error.message}${error.details ? ` — ${error.details}` : ''}`);
  }

  return (data ?? []).map((row) => mapProductRow(row as ProductRow));
}

export const productsService = {
  listMock(): Product[] {
    return mockProducts;
  },

  async list(): Promise<Product[]> {
    return listFromSupabase();
  },
};
