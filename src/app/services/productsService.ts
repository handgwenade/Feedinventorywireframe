import type { Product } from '../types';
import { supabase } from './supabaseClient';

interface ProductRow {
  id: string;
  category_id: string | null;
  name: string;
  sku: string | null;
  unit_label: string;
  current_quantity: number | string;
  minimum_quantity: number | string;
  sale_price: number | string;
  cost_per_unit: number | string | null;
  vendor: string | null;
  source_notes: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface CreateProductInput {
  name: string;
  categoryId?: string;
  unitLabel: string;
  currentQuantity: number;
  minimumQuantity: number;
  salePrice: number;
  vendor: string;
  sourceNotes: string;
}

export interface UpdateProductInput {
  productId: string;
  name: string;
  categoryId?: string;
  unitLabel: string;
  minimumQuantity: number;
  salePrice: number;
  vendor: string;
  sourceNotes: string;
}

export interface ArchiveProductInput {
  productId: string;
  reason: string;
}

export interface ArchiveProductResult {
  id: string;
  name: string;
  isActive: boolean;
}

interface ArchiveProductRow {
  id: string;
  name: string;
  is_active: boolean;
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

async function createProductInSupabase({
  name,
  categoryId,
  unitLabel,
  currentQuantity,
  minimumQuantity,
  salePrice,
  vendor,
  sourceNotes,
}: CreateProductInput): Promise<Product> {
  const { data, error } = await supabase.rpc('create_product', {
    p_name: name,
    p_category_id: categoryId ?? null,
    p_unit_label: unitLabel,
    p_current_quantity: currentQuantity,
    p_minimum_quantity: minimumQuantity,
    p_sale_price: salePrice,
    p_vendor: vendor,
    p_source_notes: sourceNotes,
  });

  if (error) {
    throw new Error(`${error.message}${error.details ? ` — ${error.details}` : ''}`);
  }

  const row = Array.isArray(data) ? data[0] : data;

  if (!row) {
    throw new Error('Product was not created.');
  }

  return mapProductRow(row as ProductRow);
}

async function updateProductInSupabase({
  productId,
  name,
  categoryId,
  unitLabel,
  minimumQuantity,
  salePrice,
  vendor,
  sourceNotes,
}: UpdateProductInput): Promise<Product> {
  const { data, error } = await supabase.rpc('update_product', {
    p_product_id: productId,
    p_name: name,
    p_category_id: categoryId ?? null,
    p_unit_label: unitLabel,
    p_minimum_quantity: minimumQuantity,
    p_sale_price: salePrice,
    p_vendor: vendor,
    p_source_notes: sourceNotes,
  });

  if (error) {
    throw new Error(`${error.message}${error.details ? ` — ${error.details}` : ''}`);
  }

  const row = Array.isArray(data) ? data[0] : data;

  if (!row) {
    throw new Error('Product was not updated.');
  }

  return mapProductRow(row as ProductRow);
}

async function archiveProductInSupabase({
  productId,
  reason,
}: ArchiveProductInput): Promise<ArchiveProductResult> {
  const { data, error } = await supabase.rpc('archive_product', {
    p_product_id: productId,
    p_reason: reason,
  });

  if (error) {
    throw new Error(`${error.message}${error.details ? ` — ${error.details}` : ''}`);
  }

  const row = Array.isArray(data) ? data[0] : data;

  if (!row) {
    throw new Error('Product was not archived.');
  }

  const archivedProduct = row as ArchiveProductRow;

  return {
    id: archivedProduct.id,
    name: archivedProduct.name,
    isActive: archivedProduct.is_active,
  };
}

export const productsService = {
  async archiveProduct(input: ArchiveProductInput): Promise<ArchiveProductResult> {
    return archiveProductInSupabase(input);
  },

  async createProduct(input: CreateProductInput): Promise<Product> {
    return createProductInSupabase(input);
  },

  async list(): Promise<Product[]> {
    return listFromSupabase();
  },

  async updateProduct(input: UpdateProductInput): Promise<Product> {
    return updateProductInSupabase(input);
  },
};
