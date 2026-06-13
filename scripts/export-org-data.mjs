#!/usr/bin/env node

import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const REQUIRED_ENV = [
  'STOCKLOG_SUPABASE_URL',
  'STOCKLOG_SERVICE_ROLE_KEY',
  'STOCKLOG_TARGET_ORG_ID',
];

const PAGE_SIZE = 1000;

const EXPORT_SPECS = [
  {
    key: 'categories',
    table: 'product_categories',
    fileName: 'product_categories.csv',
    required: false,
    columns: ['id', 'name', 'slug', 'sort_order', 'is_active'],
  },
  {
    key: 'products',
    table: 'products',
    fileName: 'products.csv',
    required: true,
    columns: [
      'id',
      'name',
      'sku',
      'category_id',
      'category_name',
      'unit_label',
      'current_quantity',
      'minimum_quantity',
      'sale_price',
      'cost_per_unit',
      'vendor',
      'is_active',
      'created_at',
      'updated_at',
    ],
  },
  {
    key: 'accounts',
    table: 'accounts',
    fileName: 'accounts.csv',
    required: true,
    columns: [
      'id',
      'account_type',
      'name',
      'phone',
      'email',
      'billing_address',
      'notes',
      'is_active',
      'created_at',
      'updated_at',
    ],
  },
  {
    key: 'invoices',
    table: 'invoice_records',
    fileName: 'invoices.csv',
    required: false,
    columns: [
      'id',
      'display_number',
      'record_type',
      'account_id',
      'person_id',
      'issue_date',
      'subtotal',
      'tax',
      'total',
      'balance_due',
      'status',
      'notes',
      'created_by',
      'created_at',
      'updated_at',
    ],
  },
  {
    key: 'payments',
    table: 'payments',
    fileName: 'payments.csv',
    required: false,
    columns: [
      'id',
      'invoice_record_id',
      'amount',
      'method',
      'reference_number',
      'notes',
      'received_by',
      'received_at',
      'created_at',
    ],
  },
];

function printUsage() {
  console.log(`Usage:
  node scripts/export-org-data.mjs

Environment:
  STOCKLOG_SUPABASE_URL
  STOCKLOG_SERVICE_ROLE_KEY
  STOCKLOG_TARGET_ORG_ID

Output:
  private-export/org-data-YYYY-MM-DD-HHMM/

Exports:
  products.csv
  accounts.csv
  product_categories.csv when table exists
  invoices.csv when invoice_records exists
  payments.csv when payments exists

This script is read-only. It never writes to Supabase and never prints the service-role key.
`);
}

function getEnv() {
  const env = {
    supabaseUrl: process.env.STOCKLOG_SUPABASE_URL ?? '',
    serviceRoleKey: process.env.STOCKLOG_SERVICE_ROLE_KEY ?? '',
    targetOrgId: process.env.STOCKLOG_TARGET_ORG_ID ?? '',
  };

  const missing = REQUIRED_ENV.filter((key) => !process.env[key]);

  return { env, missing };
}

function getTimestamp() {
  const now = new Date();
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Denver',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).formatToParts(now);
  const byType = Object.fromEntries(parts.map((part) => [part.type, part.value]));

  return `${byType.year}-${byType.month}-${byType.day}-${byType.hour}${byType.minute}`;
}

function csvEscape(value) {
  if (value === null || value === undefined) return '';

  const stringValue = typeof value === 'object' ? JSON.stringify(value) : String(value);

  if (/[",\r\n]/.test(stringValue)) {
    return `"${stringValue.replace(/"/g, '""')}"`;
  }

  return stringValue;
}

function rowsToCsv(columns, rows) {
  return [
    columns.join(','),
    ...rows.map((row) => columns.map((column) => csvEscape(row[column])).join(',')),
  ].join('\n') + '\n';
}

function projectRows(columns, rows) {
  return rows.map((row) => {
    const projected = {};

    for (const column of columns) {
      projected[column] = row[column] ?? '';
    }

    return projected;
  });
}

function isMissingOptionalTable(error) {
  const message = `${error?.code ?? ''} ${error?.message ?? ''}`;
  return /PGRST(106|116|200|202|204)|relation .* does not exist|Could not find the table/i.test(message);
}

async function fetchAllOrgRows(supabase, table, organizationId) {
  const rows = [];

  for (let from = 0; ; from += PAGE_SIZE) {
    const to = from + PAGE_SIZE - 1;
    const { data, error } = await supabase
      .from(table)
      .select('*')
      .eq('organization_id', organizationId)
      .range(from, to);

    if (error) {
      throw error;
    }

    rows.push(...(data ?? []));

    if (!data || data.length < PAGE_SIZE) {
      break;
    }
  }

  return rows;
}

function addProductCategoryNames(products, categories) {
  const categoryNameById = new Map(categories.map((category) => [category.id, category.name]));

  return products.map((product) => ({
    ...product,
    category_name: product.category_id ? categoryNameById.get(product.category_id) ?? '' : '',
  }));
}

async function exportTable({ supabase, spec, organizationId, outputDir, transformRows }) {
  try {
    const rawRows = await fetchAllOrgRows(supabase, spec.table, organizationId);
    const rows = projectRows(spec.columns, transformRows ? transformRows(rawRows) : rawRows);
    const filePath = path.join(outputDir, spec.fileName);

    writeFileSync(filePath, rowsToCsv(spec.columns, rows), 'utf8');

    return {
      spec,
      filePath,
      rowCount: rows.length,
      skipped: false,
      error: null,
    };
  } catch (error) {
    if (!spec.required && isMissingOptionalTable(error)) {
      return {
        spec,
        filePath: null,
        rowCount: 0,
        skipped: true,
        error: `Skipped optional table ${spec.table}: table not found`,
      };
    }

    throw new Error(`Failed to export ${spec.table}: ${error.message ?? String(error)}`);
  }
}

function writeOutputReadme({ outputDir, organizationId, results }) {
  const exportedResults = results.filter((result) => !result.skipped);
  const skippedResults = results.filter((result) => result.skipped);
  const lines = [
    '# StockLog Organization Data Export',
    '',
    `Created at: ${new Date().toISOString()}`,
    `Target organization ID: ${organizationId}`,
    '',
    'This folder was created by `node scripts/export-org-data.mjs`.',
    'The export is read-only and does not contain Supabase service-role secrets.',
    'Invitation `code_hash` values are not exported.',
    '',
    '## Files',
    '',
    ...exportedResults.map((result) => `- ${result.spec.fileName}: ${result.rowCount} rows from \`${result.spec.table}\``),
  ];

  if (skippedResults.length > 0) {
    lines.push('', '## Skipped Optional Tables', '');
    lines.push(...skippedResults.map((result) => `- ${result.error}`));
  }

  lines.push(
    '',
    '## Handling',
    '',
    '- Treat these CSVs as private operational data.',
    '- Do not commit this folder or copied real-data CSVs.',
    '- Use these files to prepare reviewed launch import CSVs.',
    '',
  );

  writeFileSync(path.join(outputDir, 'README.md'), lines.join('\n'), 'utf8');
}

async function main() {
  const args = process.argv.slice(2);

  if (args.includes('--help') || args.includes('-h')) {
    printUsage();
    return;
  }

  if (args.length > 0) {
    console.error(`Unknown argument: ${args[0]}`);
    process.exitCode = 1;
    return;
  }

  const { env, missing } = getEnv();

  if (missing.length > 0) {
    console.error(`Missing required env vars: ${missing.join(', ')}`);
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

  const outputDir = path.resolve(process.cwd(), 'private-export', `org-data-${getTimestamp()}`);
  mkdirSync(outputDir, { recursive: true });

  const results = [];
  let categories = [];

  const categorySpec = EXPORT_SPECS.find((spec) => spec.key === 'categories');
  const categoryResult = await exportTable({
    supabase,
    spec: categorySpec,
    organizationId: env.targetOrgId,
    outputDir,
  });

  results.push(categoryResult);

  if (!categoryResult.skipped) {
    categories = await fetchAllOrgRows(supabase, categorySpec.table, env.targetOrgId);
  }

  for (const spec of EXPORT_SPECS.filter((item) => item.key !== 'categories')) {
    const result = await exportTable({
      supabase,
      spec,
      organizationId: env.targetOrgId,
      outputDir,
      transformRows: spec.key === 'products'
        ? (rows) => addProductCategoryNames(rows, categories)
        : null,
    });

    results.push(result);
  }

  writeOutputReadme({
    outputDir,
    organizationId: env.targetOrgId,
    results,
  });

  console.log('StockLog organization data export complete');
  console.log('==========================================');
  console.log(`Output folder: ${outputDir}`);
  console.log('');

  for (const result of results) {
    if (result.skipped) {
      console.log(`${result.spec.fileName}: skipped optional table`);
    } else {
      console.log(`${result.spec.fileName}: ${result.rowCount} rows`);
    }
  }

  console.log('README.md: export notes');
}

main().catch((error) => {
  console.error(error.message ?? String(error));
  process.exitCode = 1;
});
