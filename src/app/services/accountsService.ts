import type { Account, AccountType } from '../types';
import { supabase } from './supabaseClient';

interface AccountRow {
  id: string;
  account_type: string;
  name: string;
  phone: string | null;
  email: string | null;
  billing_address: string | null;
  notes: string | null;
  is_active: boolean;
}

function mapAccountRow(row: AccountRow): Account {
  return {
    id: row.id,
    accountType: row.account_type as AccountType,
    name: row.name,
    phone: row.phone ?? undefined,
    email: row.email ?? undefined,
    address: row.billing_address ?? undefined,
    notes: row.notes ?? undefined,
    status: row.is_active ? 'active' : 'archived',
    isSystemAccount: row.account_type === 'k2',
  };
}

async function listCustomersFromSupabase(): Promise<Account[]> {
  const { data, error } = await supabase
    .from('accounts')
    .select('id, account_type, name, phone, email, billing_address, notes, is_active')
    .eq('account_type', 'customer')
    .eq('is_active', true)
    .order('name', { ascending: true });

  if (error) {
    throw new Error(`${error.message}${error.details ? ` — ${error.details}` : ''}`);
  }

  return (data ?? []).map((row) => mapAccountRow(row as AccountRow));
}

async function listActiveFromSupabase(): Promise<Account[]> {
  const { data, error } = await supabase
    .from('accounts')
    .select('id, account_type, name, phone, email, billing_address, notes, is_active')
    .eq('is_active', true)
    .order('account_type', { ascending: true })
    .order('name', { ascending: true });

  if (error) {
    throw new Error(`${error.message}${error.details ? ` — ${error.details}` : ''}`);
  }

  return (data ?? []).map((row) => mapAccountRow(row as AccountRow));
}

export const accountsService = {
  async listActive(): Promise<Account[]> {
    return listActiveFromSupabase();
  },

  async listCustomers(): Promise<Account[]> {
    return listCustomersFromSupabase();
  },
};
