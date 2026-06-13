#!/usr/bin/env node

import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const DEFAULT_TEMPLATE_DIR = 'import-templates';

const FILES = {
  products: 'products.csv',
  accounts: 'accounts.csv',
  categories: 'product_categories.csv',
};

const REQUIRED_COLUMNS = {
  products: ['name', 'current_quantity', 'minimum_quantity', 'unit_label', 'sale_price'],
  accounts: ['account_type', 'name'],
  categories: ['name'],
};

function printUsage() {
  console.log(`Usage:
  node scripts/import-launch-data.mjs [template-dir] [--write] [--confirm]

Defaults:
  template-dir: ${DEFAULT_TEMPLATE_DIR}
  mode: dry-run

Examples:
  node scripts/import-launch-data.mjs
  node scripts/import-launch-data.mjs ./import-templates
  node scripts/import-launch-data.mjs ./launch-data/c-and-c
  STOCKLOG_SUPABASE_URL=... STOCKLOG_SERVICE_ROLE_KEY=... STOCKLOG_TARGET_ORG_ID=... node scripts/import-launch-data.mjs --write
  STOCKLOG_SUPABASE_URL=... STOCKLOG_SERVICE_ROLE_KEY=... STOCKLOG_TARGET_ORG_ID=... node scripts/import-launch-data.mjs --write --confirm

Dry run is the default and does not connect to Supabase.
Write mode requires --write plus Supabase environment variables.
Actual inserts require both --write and --confirm.
`);
}

function parseArgs(argv) {
  const args = {
    templateDir: DEFAULT_TEMPLATE_DIR,
    write: false,
    confirm: false,
  };
  const positional = [];

  if (argv.includes('--help') || argv.includes('-h')) {
    printUsage();
    process.exit(0);
  }

  for (const arg of argv) {
    if (arg === '--write') {
      args.write = true;
      continue;
    }

    if (arg === '--confirm') {
      args.confirm = true;
      continue;
    }

    if (arg.startsWith('--')) {
      throw new Error(`Unknown flag: ${arg}`);
    }

    positional.push(arg);
  }

  if (positional.length > 1) {
    throw new Error(`Expected at most one template directory, received ${positional.length}.`);
  }

  if (positional[0]) {
    args.templateDir = positional[0];
  }

  if (args.confirm && !args.write) {
    throw new Error('--confirm can only be used with --write.');
  }

  return args;
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

  return rows.filter((csvRow) => csvRow.some((value) => value.trim() !== ''));
}

function normalizeHeader(value) {
  return value.trim().toLowerCase().replace(/\s+/g, '_');
}

function loadCsv(filePath, label, errors) {
  if (!existsSync(filePath)) {
    errors.push(`${label}: missing file at ${filePath}`);
    return { headers: [], rows: [] };
  }

  const csvRows = parseCsv(readFileSync(filePath, 'utf8'));

  if (csvRows.length === 0) {
    errors.push(`${label}: file is empty`);
    return { headers: [], rows: [] };
  }

  const headers = csvRows[0].map(normalizeHeader);
  const duplicateHeaders = findDuplicates(headers.filter(Boolean));

  for (const header of duplicateHeaders) {
    errors.push(`${label}: duplicate column "${header}"`);
  }

  const rows = csvRows.slice(1).map((csvRow, rowIndex) => {
    const record = {};

    for (let index = 0; index < headers.length; index += 1) {
      const header = headers[index];
      if (!header) continue;
      record[header] = (csvRow[index] ?? '').trim();
    }

    return {
      record,
      rowNumber: rowIndex + 2,
    };
  });

  return { headers, rows };
}

function requireColumns(label, headers, requiredColumns, errors) {
  for (const column of requiredColumns) {
    if (!headers.includes(column)) {
      errors.push(`${label}: missing required column "${column}"`);
    }
  }
}

function normalizeName(value) {
  return value.trim().replace(/\s+/g, ' ').toLowerCase();
}

function slugify(value) {
  return normalizeName(value)
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function findDuplicates(values) {
  const seen = new Set();
  const duplicates = new Set();

  for (const value of values) {
    if (seen.has(value)) {
      duplicates.add(value);
    }

    seen.add(value);
  }

  return [...duplicates];
}

function parseRequiredNumber(value) {
  if (value.trim() === '') {
    return { valid: false, reason: 'blank' };
  }

  const normalized = value.replace(/[$,]/g, '');
  const number = Number(normalized);

  if (!Number.isFinite(number)) {
    return { valid: false, reason: 'not a number' };
  }

  if (number < 0) {
    return { valid: false, reason: 'negative' };
  }

  return { valid: true, value: number };
}

function parseOptionalNumber(value) {
  if (value.trim() === '') {
    return { valid: true, value: null };
  }

  return parseRequiredNumber(value);
}

function parseBoolean(value, defaultValue = true) {
  const normalized = value.trim().toLowerCase();

  if (!normalized) return { valid: true, value: defaultValue };
  if (['true', 'yes', 'y', '1', 'active'].includes(normalized)) {
    return { valid: true, value: true };
  }
  if (['false', 'no', 'n', '0', 'inactive', 'archived'].includes(normalized)) {
    return { valid: true, value: false };
  }

  return { valid: false, value: defaultValue };
}

function validateCategories(csv, errors, warnings) {
  const categories = [];
  const names = [];
  const slugs = [];

  requireColumns('product_categories.csv', csv.headers, REQUIRED_COLUMNS.categories, errors);

  for (const { record, rowNumber } of csv.rows) {
    const name = record.name ?? '';

    if (!name) {
      errors.push(`product_categories.csv row ${rowNumber}: category name is blank`);
      continue;
    }

    const active = parseBoolean(record.is_active ?? '', true);
    if (!active.valid) {
      warnings.push(`product_categories.csv row ${rowNumber}: is_active should be true/false, yes/no, or 1/0`);
    }

    const sortOrder = parseOptionalNumber(record.sort_order ?? '');
    if (!sortOrder.valid || (sortOrder.value !== null && !Number.isInteger(sortOrder.value))) {
      errors.push(`product_categories.csv row ${rowNumber}: sort_order must be a nonnegative whole number when filled`);
    }

    const slug = record.slug || slugify(name);
    if (slug && !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
      warnings.push(`product_categories.csv row ${rowNumber}: slug "${slug}" should be lowercase words separated by hyphens`);
    }

    names.push(normalizeName(name));
    if (slug) slugs.push(slug.toLowerCase());

    categories.push({
      name,
      slug,
      isActive: active.value,
      sortOrder: sortOrder.value ?? 0,
      rowNumber,
    });
  }

  for (const duplicateName of findDuplicates(names)) {
    errors.push(`product_categories.csv: duplicate category name "${duplicateName}"`);
  }

  for (const duplicateSlug of findDuplicates(slugs)) {
    errors.push(`product_categories.csv: duplicate category slug "${duplicateSlug}"`);
  }

  return categories;
}

function validateProducts(csv, categoryNames, errors, warnings) {
  const products = [];
  const productNames = [];

  requireColumns('products.csv', csv.headers, REQUIRED_COLUMNS.products, errors);

  for (const { record, rowNumber } of csv.rows) {
    const name = record.name ?? '';

    if (!name) {
      errors.push(`products.csv row ${rowNumber}: product name is blank`);
    } else {
      productNames.push(normalizeName(name));
    }

    for (const field of ['current_quantity', 'minimum_quantity']) {
      const parsed = parseRequiredNumber(record[field] ?? '');
      if (!parsed.valid) {
        errors.push(`products.csv row ${rowNumber}: ${field} is invalid (${parsed.reason})`);
      }
    }

    const price = parseRequiredNumber(record.sale_price ?? '');
    if (!price.valid) {
      errors.push(`products.csv row ${rowNumber}: sale_price is invalid (${price.reason})`);
    }

    const cost = parseOptionalNumber(record.cost_per_unit ?? '');
    if (!cost.valid) {
      errors.push(`products.csv row ${rowNumber}: cost_per_unit is invalid (${cost.reason})`);
    }

    if (!(record.unit_label ?? '').trim()) {
      errors.push(`products.csv row ${rowNumber}: unit_label is blank`);
    }

    const category = record.category ?? '';
    if (category && !categoryNames.has(normalizeName(category))) {
      warnings.push(`products.csv row ${rowNumber}: category "${category}" is not listed in product_categories.csv`);
    }

    products.push({
      name,
      category,
      currentQuantity: parseRequiredNumber(record.current_quantity ?? '').value ?? 0,
      minimumQuantity: parseRequiredNumber(record.minimum_quantity ?? '').value ?? 0,
      unitLabel: record.unit_label ?? '',
      salePrice: parseRequiredNumber(record.sale_price ?? '').value ?? 0,
      costPerUnit: parseOptionalNumber(record.cost_per_unit ?? '').value,
      sku: record.sku ?? '',
      vendor: record.vendor ?? '',
      sourceNotes: record.source_notes ?? '',
      rowNumber,
    });
  }

  for (const duplicateName of findDuplicates(productNames)) {
    errors.push(`products.csv: duplicate product name "${duplicateName}"`);
  }

  return products;
}

function validateAccounts(csv, errors, warnings) {
  const accounts = [];
  const accountNameTypeKeys = [];
  const k2Accounts = [];

  requireColumns('accounts.csv', csv.headers, REQUIRED_COLUMNS.accounts, errors);

  for (const { record, rowNumber } of csv.rows) {
    const accountType = (record.account_type ?? '').trim().toLowerCase();
    const name = record.name ?? '';

    if (!['customer', 'k2'].includes(accountType)) {
      errors.push(`accounts.csv row ${rowNumber}: account_type must be "customer" or "k2"`);
    }

    if (!name) {
      errors.push(`accounts.csv row ${rowNumber}: account name is blank`);
    } else {
      accountNameTypeKeys.push(`${accountType}:${normalizeName(name)}`);
    }

    const active = parseBoolean(record.is_active ?? '', true);
    if (!active.valid) {
      warnings.push(`accounts.csv row ${rowNumber}: is_active should be true/false, yes/no, or 1/0`);
    }

    const account = {
      name,
      accountType,
      isActive: active.value,
      phone: record.phone ?? '',
      email: record.email ?? '',
      billingAddress: record.billing_address ?? '',
      contactName: record.contact_name ?? '',
      notes: record.notes ?? '',
      rowNumber,
    };

    if (accountType === 'k2') {
      k2Accounts.push(account);
    }

    accounts.push(account);
  }

  for (const duplicateNameType of findDuplicates(accountNameTypeKeys)) {
    errors.push(`accounts.csv: duplicate account name/type "${duplicateNameType}"`);
  }

  if (k2Accounts.length === 0) {
    errors.push('accounts.csv: missing K2 account');
  }

  if (k2Accounts.length > 1) {
    errors.push(`accounts.csv: more than one K2 account found (${k2Accounts.length})`);
  }

  return { accounts, k2Accounts };
}

function pluralize(count, singular, plural = `${singular}s`) {
  return `${count} ${count === 1 ? singular : plural}`;
}

function printSummary({ products, categories, accounts, k2Accounts, warnings, errors, templateDir, write }) {
  const activeCategories = categories.filter((category) => category.isActive);
  const activeCustomerAccounts = accounts.filter(
    (account) => account.accountType === 'customer' && account.isActive,
  );
  const activeProducts = products.filter((product) => product.name.trim());

  console.log(write ? 'StockLog launch import validation' : 'StockLog launch import dry run');
  console.log(write ? '=================================' : '================================');
  console.log(`Template directory: ${templateDir}`);
  console.log('');
  console.log(`Products to import: ${pluralize(activeProducts.length, 'product')}`);
  console.log(`Categories to import: ${pluralize(activeCategories.length, 'category', 'categories')}`);
  console.log(`Customer accounts to import: ${pluralize(activeCustomerAccounts.length, 'customer account')}`);
  console.log(
    `K2 account found: ${
      k2Accounts.length === 1 && k2Accounts[0].name
        ? `${k2Accounts[0].name} (row ${k2Accounts[0].rowNumber})`
        : 'no'
    }`,
  );

  if (warnings.length > 0) {
    console.log('');
    console.log(`Warnings (${warnings.length})`);
    for (const warning of warnings) {
      console.log(`- ${warning}`);
    }
  }

  if (errors.length > 0) {
    console.log('');
    console.log(`Errors (${errors.length})`);
    for (const error of errors) {
      console.log(`- ${error}`);
    }
    console.log('');
    console.log('Dry run failed. Fix the errors above before preparing a live import.');
    return;
  }

  console.log('');
  if (write) {
    console.log('Validation passed. Preparing guarded Supabase write mode.');
  } else {
    console.log('Dry run passed. No Supabase writes were attempted.');
  }
}

function getRequiredWriteEnv() {
  const env = {
    supabaseUrl: process.env.STOCKLOG_SUPABASE_URL ?? '',
    serviceRoleKey: process.env.STOCKLOG_SERVICE_ROLE_KEY ?? '',
    targetOrgId: process.env.STOCKLOG_TARGET_ORG_ID ?? '',
  };
  const missing = [];

  if (!env.supabaseUrl) missing.push('STOCKLOG_SUPABASE_URL');
  if (!env.serviceRoleKey) missing.push('STOCKLOG_SERVICE_ROLE_KEY');
  if (!env.targetOrgId) missing.push('STOCKLOG_TARGET_ORG_ID');

  return { env, missing };
}

function appendLaunchNote(existingNote, rowNumber) {
  const launchNote = `StockLog launch import from CSV row ${rowNumber}`;
  return existingNote ? `${existingNote}\n${launchNote}` : launchNote;
}

function formatDbError(error) {
  return error?.message ?? String(error);
}

async function fetchExistingRows(supabase, organizationId) {
  const [categoriesResult, productsResult, accountsResult] = await Promise.all([
    supabase
      .from('product_categories')
      .select('id,name,slug')
      .eq('organization_id', organizationId),
    supabase
      .from('products')
      .select('id,name')
      .eq('organization_id', organizationId),
    supabase
      .from('accounts')
      .select('id,name,account_type')
      .eq('organization_id', organizationId),
  ]);

  const errors = [];
  if (categoriesResult.error) {
    errors.push(`Failed to read existing categories: ${formatDbError(categoriesResult.error)}`);
  }
  if (productsResult.error) {
    errors.push(`Failed to read existing products: ${formatDbError(productsResult.error)}`);
  }
  if (accountsResult.error) {
    errors.push(`Failed to read existing accounts: ${formatDbError(accountsResult.error)}`);
  }

  if (errors.length > 0) {
    throw new Error(errors.join('\n'));
  }

  return {
    categories: categoriesResult.data ?? [],
    products: productsResult.data ?? [],
    accounts: accountsResult.data ?? [],
  };
}

function createImportPlan({ categories, products, accounts, existingRows, organizationId }) {
  const categoryBySlug = new Map(
    existingRows.categories.map((category) => [category.slug.toLowerCase(), category]),
  );
  const categoryByName = new Map(
    existingRows.categories.map((category) => [normalizeName(category.name), category]),
  );
  const productByName = new Map(
    existingRows.products.map((product) => [normalizeName(product.name), product]),
  );
  const accountByNameType = new Map(
    existingRows.accounts.map((account) => [
      `${account.account_type}:${normalizeName(account.name)}`,
      account,
    ]),
  );

  const plan = {
    categories: { insert: [], skip: [] },
    products: { insert: [], skip: [] },
    accounts: { insert: [], skip: [] },
  };

  for (const category of categories) {
    const existingCategory = categoryBySlug.get(category.slug.toLowerCase());

    if (existingCategory) {
      plan.categories.skip.push({ row: category, reason: `existing slug "${category.slug}"` });
      categoryByName.set(normalizeName(category.name), existingCategory);
      continue;
    }

    const insertRow = {
      organization_id: organizationId,
      name: category.name,
      slug: category.slug,
      sort_order: category.sortOrder,
      is_active: category.isActive,
    };

    plan.categories.insert.push({ row: category, insertRow });
  }

  for (const product of products) {
    if (!product.name.trim()) continue;

    const existingProduct = productByName.get(normalizeName(product.name));

    if (existingProduct) {
      plan.products.skip.push({ row: product, reason: `existing product name "${product.name}"` });
      continue;
    }

    const category = product.category ? categoryByName.get(normalizeName(product.category)) : null;
    const insertedCategory = product.category
      ? plan.categories.insert.find(({ row }) => normalizeName(row.name) === normalizeName(product.category))
      : null;

    const insertRow = {
      organization_id: organizationId,
      category_id: category?.id ?? insertedCategory?.pendingId ?? null,
      name: product.name,
      sku: product.sku || null,
      unit_label: product.unitLabel,
      current_quantity: product.currentQuantity,
      minimum_quantity: product.minimumQuantity,
      sale_price: product.salePrice,
      cost_per_unit: product.costPerUnit,
      vendor: product.vendor || null,
      source_notes: appendLaunchNote(product.sourceNotes, product.rowNumber),
      is_active: true,
    };

    plan.products.insert.push({ row: product, insertRow });
  }

  for (const account of accounts) {
    if (!account.name.trim() || !account.accountType) continue;

    const accountKey = `${account.accountType}:${normalizeName(account.name)}`;
    const existingAccount = accountByNameType.get(accountKey);

    if (existingAccount) {
      plan.accounts.skip.push({
        row: account,
        reason: `existing ${account.accountType} account "${account.name}"`,
      });
      continue;
    }

    const notes = [
      account.contactName ? `Contact: ${account.contactName}` : '',
      account.notes,
    ].filter(Boolean).join('\n');

    const insertRow = {
      organization_id: organizationId,
      account_type: account.accountType,
      name: account.name,
      phone: account.phone || null,
      email: account.email || null,
      billing_address: account.billingAddress || null,
      notes: appendLaunchNote(notes, account.rowNumber),
      is_active: account.isActive,
    };

    plan.accounts.insert.push({ row: account, insertRow });
  }

  return plan;
}

function printWritePlan({ plan, confirm, targetOrgId }) {
  console.log('');
  console.log(confirm ? 'Confirmed Supabase write plan' : 'Supabase write preview');
  console.log('==============================');
  console.log(`Target organization: ${targetOrgId}`);
  console.log(`Categories to insert: ${plan.categories.insert.length}`);
  console.log(`Categories to skip: ${plan.categories.skip.length}`);
  console.log(`Products to insert: ${plan.products.insert.length}`);
  console.log(`Products to skip: ${plan.products.skip.length}`);
  console.log(`Accounts to insert: ${plan.accounts.insert.length}`);
  console.log(`Accounts to skip: ${plan.accounts.skip.length}`);

  const skipped = [
    ...plan.categories.skip.map((item) => `category row ${item.row.rowNumber}: ${item.reason}`),
    ...plan.products.skip.map((item) => `product row ${item.row.rowNumber}: ${item.reason}`),
    ...plan.accounts.skip.map((item) => `account row ${item.row.rowNumber}: ${item.reason}`),
  ];

  if (skipped.length > 0) {
    console.log('');
    console.log(`Existing rows skipped (${skipped.length})`);
    for (const item of skipped) {
      console.log(`- ${item}`);
    }
  }

  if (!confirm) {
    console.log('');
    console.log('Preview only. Re-run with --write --confirm to insert rows.');
  }
}

async function insertCategories(supabase, plan) {
  const result = { inserted: 0, skipped: plan.categories.skip.length, errors: [] };
  const categoryIdsByName = new Map();

  for (const item of plan.categories.insert) {
    const { data, error } = await supabase
      .from('product_categories')
      .insert(item.insertRow)
      .select('id,name,slug')
      .single();

    if (error) {
      result.errors.push(`category row ${item.row.rowNumber}: ${formatDbError(error)}`);
      continue;
    }

    result.inserted += 1;
    categoryIdsByName.set(normalizeName(data.name), data.id);
  }

  return { result, categoryIdsByName };
}

async function insertProducts(supabase, plan, categoryIdsByName) {
  const result = { inserted: 0, skipped: plan.products.skip.length, errors: [] };

  for (const item of plan.products.insert) {
    const categoryName = item.row.category ? normalizeName(item.row.category) : '';
    const insertRow = {
      ...item.insertRow,
      category_id: item.insertRow.category_id ?? categoryIdsByName.get(categoryName) ?? null,
    };

    const { error } = await supabase.from('products').insert(insertRow);

    if (error) {
      result.errors.push(`product row ${item.row.rowNumber}: ${formatDbError(error)}`);
      continue;
    }

    result.inserted += 1;
  }

  return result;
}

async function insertAccounts(supabase, plan) {
  const result = { inserted: 0, skipped: plan.accounts.skip.length, errors: [] };

  for (const item of plan.accounts.insert) {
    const { error } = await supabase.from('accounts').insert(item.insertRow);

    if (error) {
      result.errors.push(`account row ${item.row.rowNumber}: ${formatDbError(error)}`);
      continue;
    }

    result.inserted += 1;
  }

  return result;
}

function printFinalWriteCounts({ categoryResult, productResult, accountResult }) {
  const errors = [
    ...categoryResult.errors,
    ...productResult.errors,
    ...accountResult.errors,
  ];

  console.log('');
  console.log('Final import counts');
  console.log('===================');
  console.log(`Categories inserted/skipped: ${categoryResult.inserted}/${categoryResult.skipped}`);
  console.log(`Products inserted/skipped: ${productResult.inserted}/${productResult.skipped}`);
  console.log(`Accounts inserted/skipped: ${accountResult.inserted}/${accountResult.skipped}`);
  console.log(`Errors: ${errors.length}`);

  if (errors.length > 0) {
    for (const error of errors) {
      console.log(`- ${error}`);
    }
  }
}

async function runWriteMode({ categories, products, accounts, confirm }) {
  const { env, missing } = getRequiredWriteEnv();

  if (missing.length > 0) {
    console.error('');
    console.error(`Write mode is missing required env vars: ${missing.join(', ')}`);
    process.exitCode = 1;
    return;
  }

  const { createClient } = await import('@supabase/supabase-js');
  const supabase = createClient(env.supabaseUrl, env.serviceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  let existingRows;
  try {
    existingRows = await fetchExistingRows(supabase, env.targetOrgId);
  } catch (error) {
    console.error('');
    console.error(error.message);
    process.exitCode = 1;
    return;
  }

  const plan = createImportPlan({
    categories,
    products,
    accounts,
    existingRows,
    organizationId: env.targetOrgId,
  });

  printWritePlan({ plan, confirm, targetOrgId: env.targetOrgId });

  if (!confirm) {
    return;
  }

  const { result: categoryResult, categoryIdsByName } = await insertCategories(supabase, plan);
  const productResult = await insertProducts(supabase, plan, categoryIdsByName);
  const accountResult = await insertAccounts(supabase, plan);

  printFinalWriteCounts({ categoryResult, productResult, accountResult });

  if (
    categoryResult.errors.length > 0 ||
    productResult.errors.length > 0 ||
    accountResult.errors.length > 0
  ) {
    process.exitCode = 1;
  }
}

async function main() {
  let args;
  try {
    args = parseArgs(process.argv.slice(2));
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
    return;
  }

  const { templateDir, write, confirm } = args;
  const errors = [];
  const warnings = [];

  const resolvedTemplateDir = path.resolve(process.cwd(), templateDir);
  const productsCsv = loadCsv(path.join(resolvedTemplateDir, FILES.products), FILES.products, errors);
  const accountsCsv = loadCsv(path.join(resolvedTemplateDir, FILES.accounts), FILES.accounts, errors);
  const categoriesCsv = loadCsv(path.join(resolvedTemplateDir, FILES.categories), FILES.categories, errors);

  const categories = validateCategories(categoriesCsv, errors, warnings);
  const categoryNames = new Set(categories.map((category) => normalizeName(category.name)));
  const products = validateProducts(productsCsv, categoryNames, errors, warnings);
  const { accounts, k2Accounts } = validateAccounts(accountsCsv, errors, warnings);

  printSummary({
    products,
    categories,
    accounts,
    k2Accounts,
    warnings,
    errors,
    templateDir: resolvedTemplateDir,
    write,
  });

  if (errors.length > 0) {
    process.exitCode = 1;
    return;
  }

  if (write) {
    await runWriteMode({
      categories,
      products,
      accounts,
      confirm,
    });
  }
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
