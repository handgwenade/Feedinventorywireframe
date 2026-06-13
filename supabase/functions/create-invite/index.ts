import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

type InviteRole = 'admin' | 'manager' | 'operator' | 'viewer';

interface CreateInviteRequest {
  email?: unknown;
  role?: unknown;
  expiresInDays?: unknown;
}

interface CallerProfile {
  id: string;
  organization_id: string | null;
  role: InviteRole;
  is_active: boolean;
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

const INVITE_CODE_ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const INVITE_CODE_LENGTH = 8;
const VALID_ROLES: InviteRole[] = ['admin', 'manager', 'operator', 'viewer'];
const DEFAULT_EXPIRES_IN_DAYS = 7;
const MAX_EXPIRES_IN_DAYS = 30;

function jsonResponse(body: Record<string, unknown>, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      ...corsHeaders,
      'Content-Type': 'application/json',
    },
  });
}

function normalizeEmail(value: unknown): string | null {
  if (typeof value !== 'string') return null;

  const email = value.trim().toLowerCase();
  if (!email) return null;

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailPattern.test(email) ? email : null;
}

function parseRole(value: unknown): InviteRole | null {
  if (typeof value !== 'string') return null;
  return VALID_ROLES.includes(value as InviteRole) ? (value as InviteRole) : null;
}

function parseExpiresInDays(value: unknown): number {
  if (value === undefined || value === null || value === '') {
    return DEFAULT_EXPIRES_IN_DAYS;
  }

  if (typeof value !== 'number' || !Number.isFinite(value)) {
    throw new Error('expiresInDays must be a number.');
  }

  const days = Math.floor(value);

  if (days < 1 || days > MAX_EXPIRES_IN_DAYS) {
    throw new Error(`expiresInDays must be between 1 and ${MAX_EXPIRES_IN_DAYS}.`);
  }

  return days;
}

function generateInviteCode(): string {
  const randomValues = new Uint32Array(INVITE_CODE_LENGTH);
  crypto.getRandomValues(randomValues);

  return Array.from(randomValues)
    .map((value) => INVITE_CODE_ALPHABET[value % INVITE_CODE_ALPHABET.length])
    .join('');
}

function normalizeInviteCode(code: string): string {
  return code.trim().toUpperCase().replace(/[\s-]+/g, '');
}

function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map((byte) => byte.toString(16).padStart(2, '0'))
    .join('');
}

async function hmacSha256Hex(value: string, pepper: string): Promise<string> {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(pepper),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  );
  const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(value));

  return bytesToHex(new Uint8Array(signature));
}

Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  if (request.method !== 'POST') {
    return jsonResponse({ error: 'Method not allowed.' }, 405);
  }

  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  const inviteCodePepper = Deno.env.get('INVITE_CODE_PEPPER');

  if (!supabaseUrl || !serviceRoleKey || !inviteCodePepper) {
    return jsonResponse({ error: 'Server is not configured for invite creation.' }, 500);
  }

  const authorization = request.headers.get('Authorization') ?? '';
  const token = authorization.startsWith('Bearer ') ? authorization.slice('Bearer '.length) : '';

  if (!token) {
    return jsonResponse({ error: 'Authentication required.' }, 401);
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  const { data: userData, error: userError } = await supabase.auth.getUser(token);

  if (userError || !userData.user) {
    return jsonResponse({ error: 'Invalid or expired session.' }, 401);
  }

  let body: CreateInviteRequest;

  try {
    body = await request.json();
  } catch (_error) {
    return jsonResponse({ error: 'Request body must be valid JSON.' }, 400);
  }

  const email = normalizeEmail(body.email);
  const role = parseRole(body.role);

  if (!email) {
    return jsonResponse({ error: 'A valid email is required.' }, 400);
  }

  if (!role) {
    return jsonResponse({ error: 'Role must be admin, manager, operator, or viewer.' }, 400);
  }

  let expiresInDays: number;

  try {
    expiresInDays = parseExpiresInDays(body.expiresInDays);
  } catch (error) {
    return jsonResponse({ error: error instanceof Error ? error.message : 'Invalid expiration.' }, 400);
  }

  const { data: profile, error: profileError } = await supabase
    .from('user_profiles')
    .select('id, organization_id, role, is_active')
    .eq('id', userData.user.id)
    .maybeSingle<CallerProfile>();

  if (profileError) {
    return jsonResponse({ error: 'Unable to verify caller profile.' }, 500);
  }

  if (!profile || !profile.is_active || !profile.organization_id) {
    return jsonResponse({ error: 'Active organization profile is required.' }, 403);
  }

  if (profile.role !== 'admin' && profile.role !== 'manager') {
    return jsonResponse({ error: 'Only admins and managers can create invitations.' }, 403);
  }

  if (profile.role === 'manager' && role === 'admin') {
    return jsonResponse({ error: 'Managers cannot invite admins.' }, 403);
  }

  const { data: existingInvite, error: existingInviteError } = await supabase
    .from('user_invitations')
    .select('id')
    .eq('organization_id', profile.organization_id)
    .eq('email', email)
    .eq('status', 'pending')
    .maybeSingle();

  if (existingInviteError) {
    return jsonResponse({ error: 'Unable to check for existing invitations.' }, 500);
  }

  if (existingInvite) {
    return jsonResponse({ error: 'A pending invitation already exists for this email.' }, 409);
  }

  const code = generateInviteCode();
  const normalizedCode = normalizeInviteCode(code);
  const codeHash = await hmacSha256Hex(normalizedCode, inviteCodePepper);
  const expiresAt = new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000).toISOString();

  const { data: invitation, error: insertError } = await supabase
    .from('user_invitations')
    .insert({
      organization_id: profile.organization_id,
      email,
      role,
      code_hash: codeHash,
      status: 'pending',
      created_by: profile.id,
      expires_at: expiresAt,
      last_sent_at: null,
      metadata: { source: 'manual' },
    })
    .select('id, email, role, status, organization_id, expires_at, created_at')
    .single();

  if (insertError) {
    if (insertError.code === '23505') {
      return jsonResponse({ error: 'A pending invitation already exists for this email.' }, 409);
    }

    return jsonResponse({ error: 'Unable to create invitation.' }, 500);
  }

  return jsonResponse({
    invitation: {
      id: invitation.id,
      email: invitation.email,
      role: invitation.role,
      status: invitation.status,
      organizationId: invitation.organization_id,
      expiresAt: invitation.expires_at,
      createdAt: invitation.created_at,
    },
    inviteCode: code,
  });
});
