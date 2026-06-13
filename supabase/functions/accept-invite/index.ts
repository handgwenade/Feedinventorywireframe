import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

type InviteRole = 'admin' | 'manager' | 'operator' | 'viewer';

interface AcceptInviteRequest {
  fullName?: unknown;
  email?: unknown;
  password?: unknown;
  inviteCode?: unknown;
}

interface InvitationRow {
  id: string;
  organization_id: string;
  email: string;
  role: InviteRole;
  status: 'pending' | 'accepted' | 'revoked' | 'expired';
  expires_at: string;
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

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

function normalizeText(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  return value.trim() || null;
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

  const supabaseUrl = Deno.env.get('STOCKLOG_SUPABASE_URL');
  const serviceRoleKey = Deno.env.get('STOCKLOG_SERVICE_ROLE_KEY');
  const inviteCodePepper = Deno.env.get('INVITE_CODE_PEPPER');

  if (!supabaseUrl || !serviceRoleKey || !inviteCodePepper) {
    return jsonResponse({ error: 'Server is not configured for invite acceptance.' }, 500);
  }

  let body: AcceptInviteRequest;

  try {
    body = await request.json();
  } catch (_error) {
    return jsonResponse({ error: 'Request body must be valid JSON.' }, 400);
  }

  const fullName = normalizeText(body.fullName);
  const email = normalizeEmail(body.email);
  const password = typeof body.password === 'string' ? body.password : null;
  const rawInviteCode = typeof body.inviteCode === 'string' ? body.inviteCode : null;

  if (!fullName) {
    return jsonResponse({ error: 'Full name is required.' }, 400);
  }

  if (!email) {
    return jsonResponse({ error: 'A valid email is required.' }, 400);
  }

  if (!password || password.length < 8) {
    return jsonResponse({ error: 'Password must be at least 8 characters.' }, 400);
  }

  if (!rawInviteCode || !normalizeInviteCode(rawInviteCode)) {
    return jsonResponse({ error: 'Invite code is required.' }, 400);
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  const normalizedCode = normalizeInviteCode(rawInviteCode);
  const codeHash = await hmacSha256Hex(normalizedCode, inviteCodePepper);
  const nowIso = new Date().toISOString();

  const { data: invitation, error: invitationError } = await supabase
    .from('user_invitations')
    .select('id, organization_id, email, role, status, expires_at')
    .eq('code_hash', codeHash)
    .eq('status', 'pending')
    .eq('email', email)
    .gt('expires_at', nowIso)
    .maybeSingle<InvitationRow>();

  if (invitationError) {
    return jsonResponse({ error: 'Unable to verify invitation.' }, 500);
  }

  if (!invitation) {
    return jsonResponse({ error: 'Invite code is invalid, expired, or does not match this email.' }, 400);
  }

  const { data: createdUserData, error: createUserError } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: {
      display_name: fullName,
    },
  });

  const createdUser = createdUserData.user;

  if (createUserError || !createdUser) {
    return jsonResponse({ error: 'Unable to create account. If this email already has an account, sign in instead.' }, 409);
  }

  const { error: profileError } = await supabase
    .from('user_profiles')
    .insert({
      id: createdUser.id,
      organization_id: invitation.organization_id,
      display_name: fullName,
      role: invitation.role,
      is_active: true,
    });

  if (profileError) {
    const { error: deleteUserError } = await supabase.auth.admin.deleteUser(createdUser.id);

    if (deleteUserError) {
      console.error('accept-invite cleanup failed', {
        authUserId: createdUser.id,
        invitationId: invitation.id,
      });

      return jsonResponse({ error: 'Account setup needs support. Contact your StockLog admin.' }, 500);
    }

    return jsonResponse({ error: 'Unable to finish account setup. Please try again.' }, 500);
  }

  const { data: acceptedInvite, error: acceptInviteError } = await supabase
    .from('user_invitations')
    .update({
      status: 'accepted',
      accepted_at: nowIso,
      accepted_by: createdUser.id,
    })
    .eq('id', invitation.id)
    .eq('status', 'pending')
    .select('id')
    .maybeSingle();

  if (acceptInviteError || !acceptedInvite) {
    console.error('accept-invite invite update failed', {
      authUserId: createdUser.id,
      invitationId: invitation.id,
      profileId: createdUser.id,
    });

    return jsonResponse({ error: 'Account was created, but invite finalization needs support. Contact your StockLog admin.' }, 500);
  }

  return jsonResponse({
    organizationId: invitation.organization_id,
    role: invitation.role,
    displayName: fullName,
    email,
  });
});
