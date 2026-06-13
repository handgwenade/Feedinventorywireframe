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
  node scripts/import-launch-data.mjs [template-dir]

Defaults:
  template-dir: ${DEFAULT_TEMPLATE_DIR}

Examples:
  node scripts/import-launch-data.mjs
  node scripts/import-launch-data.mjs ./import-templates
  node scripts/import-launch-data.mjs ./launch-data/c-and-c

This is a dry-run validator only. It does not connect to Supabase or write data.
`);
}

function parseArgs(argv) {
  if (argv.includes('--help') || argv.includes('-h')) {
    printUsage();
    process.exit(0);
  }

  return {
    templateDir: argv[0] ?? DEFAULT_TEMPLATE_DIR,
  };
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

    const slug = record.slug ?? '';
    if (slug && !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
      warnings.push(`product_categories.csv row ${rowNumber}: slug "${slug}" should be lowercase words separated by hyphens`);
    }

    names.push(normalizeName(name));
    if (slug) slugs.push(slug.toLowerCase());

    categories.push({
      name,
      slug,
      isActive: active.value,
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
  const accountNames = [];
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
      accountNames.push(normalizeName(name));
    }

    const active = parseBoolean(record.is_active ?? '', true);
    if (!active.valid) {
      warnings.push(`accounts.csv row ${rowNumber}: is_active should be true/false, yes/no, or 1/0`);
    }

    const account = {
      name,
      accountType,
      isActive: active.value,
      rowNumber,
    };

    if (accountType === 'k2') {
      k2Accounts.push(account);
    }

    accounts.push(account);
  }

  for (const duplicateName of findDuplicates(accountNames)) {
    warnings.push(`accounts.csv: duplicate account name "${duplicateName}"`);
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

function printSummary({ products, categories, accounts, k2Accounts, warnings, errors, templateDir }) {
  const activeCategories = categories.filter((category) => category.isActive);
  const activeCustomerAccounts = accounts.filter(
    (account) => account.accountType === 'customer' && account.isActive,
  );
  const activeProducts = products.filter((product) => product.name.trim());

  console.log('StockLog launch import dry run');
  console.log('================================');
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
  console.log('Dry run passed. No Supabase writes were attempted.');
}

function main() {
  const { templateDir } = parseArgs(process.argv.slice(2));
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
  });

  if (errors.length > 0) {
    process.exitCode = 1;
  }
}

main();
