#!/usr/bin/env node

import { createClient } from '@supabase/supabase-js';
import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const DEFAULT_CSV_PATH = '/mnt/data/sortly_export.csv';
const SOURCE_BLOCK_START = '--- Sortly Import Metadata ---';
const SOURCE_BLOCK_END = '--- End Sortly Import Metadata ---';

const COLUMN_CANDIDATES = {
  sortlyId: [
    'sortly id',
    'sortly id sid',
    'sortly item id',
    'item id',
    'item sid',
    'item uuid',
    'product id',
    'inventory id',
  ],
  productName: [
    'product name',
    'entry name',
    'item name',
    'name',
    'item',
    'title',
  ],
  transactionDate: [
    'transaction date',
    'transaction date mdt',
    'transaction at',
    'transaction time',
    'date',
    'created at',
    'created date',
    'updated at',
  ],
  currentQuantity: [
    'current quantity',
    'current qty',
    'new qty',
    'new quantity',
    'quantity on hand',
    'quantity available',
    'on hand',
    'stock on hand',
    'qty on hand',
    'quantity',
    'qty',
  ],
  minimumQuantity: [
    'minimum quantity',
    'minimum qty',
    'min level',
    'min quantity',
    'min qty',
    'reorder quantity',
    'reorder qty',
    'reorder point',
    'minimum level',
    'low stock alert',
    'low stock threshold',
  ],
  salePrice: [
    'sale price',
    'price',
    'unit price',
    'item price',
    'value',
    'unit value',
  ],
  vendor: [
    'vendor',
    'supplier',
    'manufacturer',
    'brand',
    'source',
    'notes',
  ],
  unitLabel: [
    'unit label',
    'unit',
    'units',
    'unit of measure',
    'uom',
    'measure',
  ],
  barcode: [
    'barcode',
    'bar code',
    'barcode qr1 data',
    'barcode qr2 data',
    'barcode qr data',
    'qr',
    'qr code',
    'sku',
  ],
  transactionType: [
    'transaction type',
    'type',
    'action',
  ],
  transactionNotes: [
    'transaction notes',
    'transaction note',
    'notes',
    'note',
    'description',
  ],
  folder: [
    'folder',
    'folder name',
    'path',
    'location',
  ],
};

function printUsage() {
  console.log(`Usage:
  node scripts/import-sortly-products.mjs [csv-path] [--write] [--csv-only] [--email EMAIL]

Defaults:
  csv-path: ${DEFAULT_CSV_PATH}
  mode: dry-run

Environment:
  VITE_SUPABASE_URL
  VITE_SUPABASE_ANON_KEY
  SORTLY_IMPORT_EMAIL optional authenticated admin/manager login
  SORTLY_IMPORT_PASSWORD optional authenticated admin/manager password

Examples:
  node scripts/import-sortly-products.mjs ./sortly_export.csv
  node scripts/import-sortly-products.mjs ./sortly_export.csv --csv-only
  SORTLY_IMPORT_EMAIL=admin@example.com SORTLY_IMPORT_PASSWORD='...' node scripts/import-sortly-products.mjs ./sortly_export.csv --write
`);
}

function parseArgs(argv) {
  const args = {
    csvPath: DEFAULT_CSV_PATH,
    write: false,
    csvOnly: false,
    email: process.env.SORTLY_IMPORT_EMAIL ?? '',
    password: process.env.SORTLY_IMPORT_PASSWORD ?? '',
  };

  const positional = [];

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];

    if (arg === '--help' || arg === '-h') {
      printUsage();
      process.exit(0);
    }

    if (arg === '--write') {
      args.write = true;
      continue;
    }

    if (arg === '--csv-only') {
      args.csvOnly = true;
      continue;
    }

    if (arg === '--email') {
      args.email = argv[index + 1] ?? '';
      index += 1;
      continue;
    }

    if (arg === '--password') {
      args.password = argv[index + 1] ?? '';
      index += 1;
      continue;
    }

    positional.push(arg);
  }

  if (positional[0]) {
    args.csvPath = positional[0];
  }

  if (args.csvOnly && args.write) {
    throw new Error('--csv-only cannot be combined with --write.');
  }

  return args;
}

function loadEnvFile(filePath) {
  if (!existsSync(filePath)) return;

  const lines = readFileSync(filePath, 'utf8').split(/\r?\n/);

  for (const line of lines) {
    const trimmed = line.trim();

    if (!trimmed || trimmed.startsWith('#')) continue;

    const equalsIndex = trimmed.indexOf('=');
    if (equalsIndex === -1) continue;

    const key = trimmed.slice(0, equalsIndex).trim();
    let value = trimmed.slice(equalsIndex + 1).trim();

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    if (key && process.env[key] === undefined) {
      process.env[key] = value;
    }
  }
}

function parseCsv(csvText) {
  const rows = [];
  let row = [];
  let cell = '';
  let inQuotes = false;

  for (let index = 0; index < csvText.length; index += 1) {
    const char = csvText[index];
    const nextChar = csvText[index + 1];

    if (char === '"' && inQuotes && nextChar === '"') {
      cell += '"';
      index += 1;
      continue;
    }

    if (char === '"') {
      inQuotes = !inQuotes;
      continue;
    }

    if (char === ',' && !inQuotes) {
      row.push(cell);
      cell = '';
      continue;
    }

    if ((char === '\n' || char === '\r') && !inQuotes) {
      if (char === '\r' && nextChar === '\n') {
        index += 1;
      }

      row.push(cell);
      rows.push(row);
      row = [];
      cell = '';
      continue;
    }

    cell += char;
  }

  if (cell.length > 0 || row.length > 0) {
    row.push(cell);
    rows.push(row);
  }

  const nonEmptyRows = rows.filter((csvRow) => csvRow.some((value) => value.trim() !== ''));
  const headers = nonEmptyRows[0] ?? [];

  return {
    headers,
    rows: nonEmptyRows.slice(1).map((values) => {
      const mapped = {};

      headers.forEach((header, index) => {
        mapped[header] = values[index]?.trim() ?? '';
      });

      return mapped;
    }),
  };
}

function normalizeHeader(value) {
  return value
    .toLowerCase()
    .replace(/[_/-]+/g, ' ')
    .replace(/[^a-z0-9 ]+/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function buildColumnMap(headers) {
  const normalizedHeaders = new Map(headers.map((header) => [normalizeHeader(header), header]));
  const columnMap = {};
  const missing = [];

  for (const [field, candidates] of Object.entries(COLUMN_CANDIDATES)) {
    const header = candidates
      .map((candidate) => normalizedHeaders.get(normalizeHeader(candidate)))
      .find(Boolean);

    if (header) {
      columnMap[field] = header;
    } else {
      missing.push(field);
    }
  }

  return { columnMap, missing };
}

function valueFor(row, columnMap, field) {
  const header = columnMap[field];
  return header ? row[header]?.trim() ?? '' : '';
}

function parseNumber(value) {
  const cleaned = String(value ?? '')
    .replace(/\$/g, '')
    .replace(/,/g, '')
    .trim();

  if (!cleaned) return { value: null, isBlank: true, isValid: false };

  const parsed = Number(cleaned);

  return {
    value: Number.isFinite(parsed) ? parsed : null,
    isBlank: false,
    isValid: Number.isFinite(parsed),
  };
}

function parseDateValue(value) {
  if (!value) return null;

  const normalized = String(value).trim().replace(/(\d)(AM|PM)$/i, '$1 $2');
  const parsed = new Date(normalized);

  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function normalizeName(value) {
  return value
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function normalizeId(value) {
  return String(value ?? '').trim();
}

function keyForSnapshot(row, columnMap) {
  const sortlyId = normalizeId(valueFor(row, columnMap, 'sortlyId'));
  const productName = valueFor(row, columnMap, 'productName');

  if (sortlyId) return `sortly:${sortlyId}`;
  return `name:${normalizeName(productName)}`;
}

function latestSnapshots(rows, columnMap) {
  const grouped = new Map();

  rows.forEach((row, rowIndex) => {
    const productName = valueFor(row, columnMap, 'productName');
    const key = keyForSnapshot(row, columnMap);

    if (!productName.trim() || key === 'name:') {
      return;
    }

    const transactionDateValue = valueFor(row, columnMap, 'transactionDate');
    const transactionDate = parseDateValue(transactionDateValue);
    const existing = grouped.get(key);

    if (!existing) {
      grouped.set(key, { row, rowIndex, transactionDate, transactionDateValue });
      return;
    }

    const existingTime = existing.transactionDate?.getTime() ?? -Infinity;
    const nextTime = transactionDate?.getTime() ?? -Infinity;

    if (nextTime > existingTime) {
      grouped.set(key, { row, rowIndex, transactionDate, transactionDateValue });
    }
  });

  return [...grouped.values()];
}

function extractSortlyId(sourceNotes) {
  const match = String(sourceNotes ?? '').match(/Sortly ID:\s*([^\n]+)/i);
  return match?.[1]?.trim() ?? '';
}

function removeSortlyBlock(sourceNotes) {
  return String(sourceNotes ?? '')
    .replace(
      new RegExp(`\\n?${SOURCE_BLOCK_START}[\\s\\S]*?${SOURCE_BLOCK_END}\\n?`, 'g'),
      '\n',
    )
    .trim();
}

function barcodeValues(row) {
  return Object.entries(row)
    .filter(([header, value]) => /barcode|qr/i.test(header) && /data/i.test(header) && String(value).trim())
    .map(([, value]) => String(value).trim());
}

function buildSourceNotes(existingNotes, snapshot, columnMap) {
  const row = snapshot.row;
  const sortlyId = valueFor(row, columnMap, 'sortlyId');
  const barcodes = barcodeValues(row);
  const originalName = valueFor(row, columnMap, 'productName');
  const transactionType = valueFor(row, columnMap, 'transactionType');
  const transactionNotes = valueFor(row, columnMap, 'transactionNotes');
  const folder = valueFor(row, columnMap, 'folder');

  const metadataLines = [
    SOURCE_BLOCK_START,
    sortlyId ? `Sortly ID: ${sortlyId}` : '',
    barcodes.length > 0 ? `Barcode/QR: ${barcodes.join(', ')}` : '',
    originalName ? `Original item name: ${originalName}` : '',
    snapshot.transactionDateValue ? `Latest transaction date: ${snapshot.transactionDateValue}` : '',
    transactionType ? `Latest transaction type: ${transactionType}` : '',
    folder ? `Sortly folder/location: ${folder}` : '',
    transactionNotes ? `Transaction/source notes: ${transactionNotes}` : '',
    SOURCE_BLOCK_END,
  ].filter(Boolean);

  const preservedNotes = removeSortlyBlock(existingNotes);

  return [preservedNotes, metadataLines.join('\n')].filter(Boolean).join('\n\n');
}

function mapSnapshot(snapshot, columnMap, existingProduct) {
  const row = snapshot.row;
  const name = valueFor(row, columnMap, 'productName').trim();
  const quantity = parseNumber(valueFor(row, columnMap, 'currentQuantity'));
  const minimumQuantity = parseNumber(valueFor(row, columnMap, 'minimumQuantity'));
  const salePrice = parseNumber(valueFor(row, columnMap, 'salePrice'));
  const csvVendor = valueFor(row, columnMap, 'vendor').trim();
  const csvUnitLabel = valueFor(row, columnMap, 'unitLabel').trim();

  return {
    sortlyId: valueFor(row, columnMap, 'sortlyId').trim(),
    name,
    currentQuantity: quantity.value,
    hasValidQuantity: quantity.isValid,
    minimumQuantity: minimumQuantity.isValid ? minimumQuantity.value : 0,
    minimumQuantityWasBlank: minimumQuantity.isBlank,
    salePrice: salePrice.isValid ? salePrice.value : 0,
    salePriceWasBlank: salePrice.isBlank,
    vendor: csvVendor || existingProduct?.vendor || null,
    unitLabel: csvUnitLabel || existingProduct?.unit_label || 'units',
  };
}

function buildIndexes(products) {
  const bySortlyId = new Map();
  const byName = new Map();

  products.forEach((product) => {
    const sortlyId = extractSortlyId(product.source_notes);
    const normalizedName = normalizeName(product.name);

    if (sortlyId) {
      bySortlyId.set(sortlyId, product);
    }

    if (!byName.has(normalizedName)) {
      byName.set(normalizedName, []);
    }

    byName.get(normalizedName).push(product);
  });

  return { bySortlyId, byName };
}

function findExistingProduct(mapped, activeIndexes) {
  if (mapped.sortlyId) {
    const bySortlyId = activeIndexes.bySortlyId.get(mapped.sortlyId);
    if (bySortlyId) {
      return { product: bySortlyId, matchType: 'sortly_id' };
    }
  }

  const nameMatches = activeIndexes.byName.get(normalizeName(mapped.name)) ?? [];

  if (nameMatches.length === 1) {
    return { product: nameMatches[0], matchType: 'name' };
  }

  if (nameMatches.length > 1) {
    return { product: null, matchType: 'duplicate_active_name', matches: nameMatches };
  }

  return { product: null, matchType: 'none' };
}

function valuesChanged(existingProduct, nextValues) {
  return (
    existingProduct.name !== nextValues.name ||
    Number(existingProduct.current_quantity) !== nextValues.current_quantity ||
    Number(existingProduct.minimum_quantity) !== nextValues.minimum_quantity ||
    Number(existingProduct.sale_price) !== nextValues.sale_price ||
    (existingProduct.vendor ?? '') !== (nextValues.vendor ?? '') ||
    existingProduct.unit_label !== nextValues.unit_label ||
    (existingProduct.source_notes ?? '') !== (nextValues.source_notes ?? '')
  );
}

async function createSupabaseClient(args) {
  const supabaseUrl = process.env.VITE_SUPABASE_URL;
  const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY. Check .env.local.');
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  if (args.email && args.password) {
    const { error } = await supabase.auth.signInWithPassword({
      email: args.email,
      password: args.password,
    });

    if (error) {
      throw new Error(`Unable to sign in import user: ${error.message}`);
    }
  }

  return supabase;
}

async function fetchProductsForImport(supabase) {
  const { data, error } = await supabase.rpc('list_products_for_import');

  if (error) {
    throw new Error(
      `Unable to list products for import: ${error.message}. Confirm migration 013_import_products_read_rpc.sql has been applied and the import user is an admin or manager.`,
    );
  }

  return data ?? [];
}

function buildPlan({ snapshots, columnMap, products }) {
  const activeProducts = products.filter((product) => product.is_active);
  const activeIndexes = buildIndexes(activeProducts);
  const creates = [];
  const updates = [];
  const skips = [];
  const blankPriceProducts = [];
  const duplicateWarnings = [];

  for (const snapshot of snapshots) {
    const preliminary = mapSnapshot(snapshot, columnMap, null);
    const existing = findExistingProduct(preliminary, activeIndexes);

    if (!preliminary.name) {
      skips.push({ reason: 'Missing product name', snapshot });
      continue;
    }

    if (!preliminary.hasValidQuantity) {
      skips.push({ reason: `Missing or invalid current quantity for ${preliminary.name}`, snapshot });
      continue;
    }

    if (existing.matchType === 'duplicate_active_name') {
      duplicateWarnings.push({
        name: preliminary.name,
        matches: existing.matches.map((product) => `${product.name} (${product.id})`),
      });
      skips.push({ reason: `Duplicate active product name: ${preliminary.name}`, snapshot });
      continue;
    }

    const existingProduct = existing.product?.is_active ? existing.product : null;
    const mapped = mapSnapshot(snapshot, columnMap, existingProduct);

    if (mapped.salePriceWasBlank) {
      blankPriceProducts.push(mapped.name);
    }

    const sourceNotes = buildSourceNotes(existingProduct?.source_notes, snapshot, columnMap);

    const nextValues = {
      name: mapped.name,
      category_id: existingProduct?.category_id ?? null,
      unit_label: mapped.unitLabel,
      current_quantity: mapped.currentQuantity,
      minimum_quantity: mapped.minimumQuantity,
      sale_price: mapped.salePrice,
      vendor: mapped.vendor,
      source_notes: sourceNotes,
      is_active: true,
    };

    if (!existingProduct) {
      creates.push({ snapshot, values: nextValues });
      continue;
    }

    const updateValues = {
      ...nextValues,
      sourceNotes: sourceNotes,
    };

    if (!valuesChanged(existingProduct, updateValues)) {
      skips.push({ reason: `No changes for ${mapped.name}`, snapshot, product: existingProduct });
      continue;
    }

    updates.push({
      snapshot,
      product: existingProduct,
      matchType: existing.matchType,
      values: nextValues,
    });
  }

  return {
    creates,
    updates,
    skips,
    blankPriceProducts: [...new Set(blankPriceProducts)].sort(),
    duplicateWarnings,
  };
}

function printColumnMap(headers, columnMap, missing) {
  console.log('CSV columns detected:');
  console.log(`  ${headers.join(', ')}`);
  console.log('');
  console.log('Column mapping:');

  Object.keys(COLUMN_CANDIDATES).forEach((field) => {
    console.log(`  ${field}: ${columnMap[field] ?? '(not found)'}`);
  });

  if (missing.length > 0) {
    console.log('');
    console.log(`Unmapped optional fields: ${missing.join(', ')}`);
  }
}

function printPlan(plan, rowCount, snapshotCount, mode) {
  console.log('');
  console.log(`Mode: ${mode}`);
  console.log(`CSV transaction rows: ${rowCount}`);
  console.log(`Latest product snapshots: ${snapshotCount}`);
  console.log(`Products to create: ${plan.creates.length}`);
  console.log(`Products to update: ${plan.updates.length}`);
  console.log(`Products skipped: ${plan.skips.length}`);
  console.log(`Products with blank price -> 0: ${plan.blankPriceProducts.length}`);

  if (plan.creates.length > 0) {
    console.log('');
    console.log('Creates:');
    plan.creates.forEach((item) => {
      console.log(`  + ${item.values.name} (${item.values.current_quantity} ${item.values.unit_label})`);
    });
  }

  if (plan.updates.length > 0) {
    console.log('');
    console.log('Updates:');
    plan.updates.forEach((item) => {
      console.log(
        `  ~ ${item.values.name} (${item.matchType}) qty ${item.product.current_quantity} -> ${item.values.current_quantity}`,
      );
    });
  }

  if (plan.skips.length > 0) {
    console.log('');
    console.log('Skipped:');
    plan.skips.forEach((item) => {
      console.log(`  - ${item.reason}`);
    });
  }

  if (plan.blankPriceProducts.length > 0) {
    console.log('');
    console.log('Blank price products:');
    plan.blankPriceProducts.forEach((name) => console.log(`  - ${name}`));
  }

  if (plan.duplicateWarnings.length > 0) {
    console.log('');
    console.log('Possible duplicate active name warnings:');
    plan.duplicateWarnings.forEach((warning) => {
      console.log(`  - ${warning.name}: ${warning.matches.join(', ')}`);
    });
  }

}

async function createProduct(supabase, item) {
  const { data, error } = await supabase.rpc('create_product', {
    p_name: item.values.name,
    p_category_id: item.values.category_id,
    p_unit_label: item.values.unit_label,
    p_current_quantity: item.values.current_quantity,
    p_minimum_quantity: item.values.minimum_quantity,
    p_sale_price: item.values.sale_price,
    p_vendor: item.values.vendor ?? '',
    p_source_notes: item.values.source_notes ?? '',
  });

  if (error) {
    throw new Error(`Unable to create ${item.values.name}: ${error.message}`);
  }

  const row = Array.isArray(data) ? data[0] : data;

  if (!row?.id) {
    throw new Error(`Unable to create ${item.values.name}: RPC returned no product.`);
  }

  return row;
}

async function updateProduct(supabase, item) {
  const { data, error } = await supabase.rpc('update_product', {
    p_product_id: item.product.id,
    p_name: item.values.name,
    p_category_id: item.product.category_id ?? null,
    p_unit_label: item.values.unit_label,
    p_minimum_quantity: item.values.minimum_quantity,
    p_sale_price: item.values.sale_price,
    p_vendor: item.values.vendor ?? '',
    p_source_notes: item.values.source_notes ?? '',
  });

  if (error) {
    throw new Error(`Unable to update ${item.values.name}: ${error.message}`);
  }

  const row = Array.isArray(data) ? data[0] : data;

  if (!row?.id) {
    throw new Error(`Unable to update ${item.values.name}: RPC returned no product.`);
  }

  return row;
}

async function adjustProductQuantity(supabase, item) {
  if (Number(item.product.current_quantity) === item.values.current_quantity) {
    return;
  }

  const { error } = await supabase.rpc('adjust_product_count', {
    p_product_id: item.product.id,
    p_new_quantity: item.values.current_quantity,
    p_reason: 'Sortly import',
    p_notes: 'One-time Sortly latest product snapshot import.',
  });

  if (error) {
    throw new Error(`Unable to adjust quantity for ${item.values.name}: ${error.message}`);
  }
}

async function writePlan({ supabase, plan }) {
  for (const item of plan.creates) {
    await createProduct(supabase, item);
  }

  for (const item of plan.updates) {
    await updateProduct(supabase, item);
    await adjustProductQuantity(supabase, item);
  }
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  loadEnvFile(path.resolve(process.cwd(), '.env.local'));

  if (!existsSync(args.csvPath)) {
    throw new Error(`CSV file not found: ${args.csvPath}`);
  }

  const csvText = readFileSync(args.csvPath, 'utf8');
  const { headers, rows } = parseCsv(csvText);

  if (headers.length === 0) {
    throw new Error('CSV file has no header row.');
  }

  const { columnMap, missing } = buildColumnMap(headers);

  if (!columnMap.productName) {
    throw new Error('Unable to find a product name column in the CSV.');
  }

  if (!columnMap.currentQuantity) {
    throw new Error('Unable to find a current quantity column in the CSV.');
  }

  const snapshots = latestSnapshots(rows, columnMap);
  const supabase = args.csvOnly ? null : await createSupabaseClient(args);
  const products = args.csvOnly ? [] : await fetchProductsForImport(supabase);
  const plan = buildPlan({ snapshots, columnMap, products });

  printColumnMap(headers, columnMap, missing);
  printPlan(
    plan,
    rows.length,
    snapshots.length,
    args.csvOnly ? 'CSV-ONLY DRY RUN' : args.write ? 'WRITE' : 'DRY RUN',
  );

  if (args.csvOnly) {
    console.log('');
    console.log('CSV-only mode did not read Supabase, so create/update matching and duplicate checks are incomplete.');
    console.log('Run a normal dry-run with an authenticated admin/manager before using --write.');
    return;
  }

  if (!args.write) {
    console.log('');
    console.log('Dry run only. Re-run with --write to update Supabase.');
    return;
  }

  await writePlan({ supabase, plan });

  console.log('');
  console.log('Import complete.');
}

main().catch((error) => {
  console.error('');
  console.error(`Import failed: ${error.message}`);
  process.exit(1);
});
