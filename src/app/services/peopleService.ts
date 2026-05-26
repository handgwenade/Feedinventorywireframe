import type { Person } from '../types';
import { supabase } from './supabaseClient';

interface PersonRow {
  id: string;
  official_display_name: string;
  phone: string | null;
  notes: string | null;
  is_active: boolean;
}

function mapPersonRow(row: PersonRow): Person {
  return {
    id: row.id,
    officialDisplayName: row.official_display_name,
    phone: row.phone ?? undefined,
    notes: row.notes ?? undefined,
    status: row.is_active ? 'active' : 'archived',
  };
}

async function listFromSupabase(): Promise<Person[]> {
  const { data, error } = await supabase
    .from('people')
    .select('id, official_display_name, phone, notes, is_active')
    .eq('is_active', true)
    .order('official_display_name', { ascending: true });

  if (error) {
    throw new Error(`${error.message}${error.details ? ` — ${error.details}` : ''}`);
  }

  return (data ?? []).map((row) => mapPersonRow(row as PersonRow));
}

export const peopleService = {
  async list(): Promise<Person[]> {
    return listFromSupabase();
  },
};
