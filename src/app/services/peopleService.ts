import type { Person } from '../types';
import { supabase } from './supabaseClient';

interface PersonRow {
  id: string;
  official_display_name: string;
  phone: string | null;
  notes: string | null;
  is_active: boolean;
}

export interface CreateFamilyPersonInput {
  officialDisplayName: string;
  phone: string;
  notes: string;
}

export interface UpdateFamilyPersonInput extends CreateFamilyPersonInput {
  personId: string;
}

export interface ArchiveFamilyPersonInput {
  personId: string;
  reason: string;
}

export interface ArchiveFamilyPersonResult {
  id: string;
  officialDisplayName: string;
  isActive: boolean;
}

interface ArchiveFamilyPersonRow {
  id: string;
  official_display_name: string;
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

async function createFamilyPersonInSupabase({
  officialDisplayName,
  phone,
  notes,
}: CreateFamilyPersonInput): Promise<Person> {
  const { data, error } = await supabase.rpc('create_family_person', {
    p_official_display_name: officialDisplayName,
    p_phone: phone,
    p_notes: notes,
  });

  if (error) {
    throw new Error(`${error.message}${error.details ? ` — ${error.details}` : ''}`);
  }

  const row = Array.isArray(data) ? data[0] : data;

  if (!row) {
    throw new Error('Family/person record was not created.');
  }

  return mapPersonRow(row as PersonRow);
}

async function updateFamilyPersonInSupabase({
  personId,
  officialDisplayName,
  phone,
  notes,
}: UpdateFamilyPersonInput): Promise<Person> {
  const { data, error } = await supabase.rpc('update_family_person', {
    p_person_id: personId,
    p_official_display_name: officialDisplayName,
    p_phone: phone,
    p_notes: notes,
  });

  if (error) {
    throw new Error(`${error.message}${error.details ? ` — ${error.details}` : ''}`);
  }

  const row = Array.isArray(data) ? data[0] : data;

  if (!row) {
    throw new Error('Family/person record was not updated.');
  }

  return mapPersonRow(row as PersonRow);
}

async function archiveFamilyPersonInSupabase({
  personId,
  reason,
}: ArchiveFamilyPersonInput): Promise<ArchiveFamilyPersonResult> {
  const { data, error } = await supabase.rpc('archive_family_person', {
    p_person_id: personId,
    p_reason: reason,
  });

  if (error) {
    throw new Error(`${error.message}${error.details ? ` — ${error.details}` : ''}`);
  }

  const row = Array.isArray(data) ? data[0] : data;

  if (!row) {
    throw new Error('Family/person record was not archived.');
  }

  const archivedPerson = row as ArchiveFamilyPersonRow;

  return {
    id: archivedPerson.id,
    officialDisplayName: archivedPerson.official_display_name,
    isActive: archivedPerson.is_active,
  };
}

export const peopleService = {
  async archiveFamilyPerson(input: ArchiveFamilyPersonInput): Promise<ArchiveFamilyPersonResult> {
    return archiveFamilyPersonInSupabase(input);
  },

  async createFamilyPerson(input: CreateFamilyPersonInput): Promise<Person> {
    return createFamilyPersonInSupabase(input);
  },

  async list(): Promise<Person[]> {
    return listFromSupabase();
  },

  async updateFamilyPerson(input: UpdateFamilyPersonInput): Promise<Person> {
    return updateFamilyPersonInSupabase(input);
  },
};
