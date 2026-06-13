import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

interface CreateRanchRequest {
  ranchName?: unknown;
  fullName?: unknown;
  email?: unknown;
  password?: unknown;
}

interface OrganizationRow {
  id: string;
  name: string;
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

function normalizeText(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  return value.trim() || null;
}

function normalizeEmail(value: unknown): string | null {
  if (typeof value !== 'string') return null;

  const email = value.trim().toLowerCase();
  if (!email) return null;

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailPattern.test(email) ? email : null;
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

  if (!supabaseUrl || !serviceRoleKey) {
    return jsonResponse({ error: 'Server is not configured for ranch setup.' }, 500);
  }

  let body: CreateRanchRequest;

  try {
    body = await request.json();
  } catch (_error) {
    return jsonResponse({ error: 'Request body must be valid JSON.' }, 400);
  }

  const ranchName = normalizeText(body.ranchName);
  const fullName = normalizeText(body.fullName);
  const email = normalizeEmail(body.email);
  const password = typeof body.password === 'string' ? body.password : null;

  if (!ranchName) {
    return jsonResponse({ error: 'Ranch name is required.' }, 400);
  }

  if (!fullName) {
    return jsonResponse({ error: 'Full name is required.' }, 400);
  }

  if (!email) {
    return jsonResponse({ error: 'A valid email is required.' }, 400);
  }

  if (!password || password.length < 8) {
    return jsonResponse({ error: 'Password must be at least 8 characters.' }, 400);
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  const { data: createdUserData, error: createUserError } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: {
      display_name: fullName,
      ranch_name: ranchName,
    },
  });

  const createdUser = createdUserData.user;

  if (createUserError || !createdUser) {
    return jsonResponse({ error: 'Unable to create account. If this email already has an account, sign in instead.' }, 409);
  }

  const { data: organization, error: organizationError } = await supabase
    .from('organizations')
    .insert({ name: ranchName })
    .select('id, name')
    .single<OrganizationRow>();

  if (organizationError || !organization) {
    const { error: deleteUserError } = await supabase.auth.admin.deleteUser(createdUser.id);

    if (deleteUserError) {
      console.error('create-ranch cleanup failed after organization creation failure', {
        authUserId: createdUser.id,
      });

      return jsonResponse({ error: 'Ranch setup needs support. Contact StockLog support.' }, 500);
    }

    return jsonResponse({ error: 'Unable to create ranch. Please try again.' }, 500);
  }

  const { error: profileError } = await supabase
    .from('user_profiles')
    .insert({
      id: createdUser.id,
      organization_id: organization.id,
      display_name: fullName,
      role: 'admin',
      is_active: true,
    });

  if (profileError) {
    const { error: deleteUserError } = await supabase.auth.admin.deleteUser(createdUser.id);
    const { error: deleteOrganizationError } = await supabase
      .from('organizations')
      .delete()
      .eq('id', organization.id);

    if (deleteUserError || deleteOrganizationError) {
      console.error('create-ranch cleanup failed after profile creation failure', {
        authUserId: createdUser.id,
        organizationId: organization.id,
        deleteUserFailed: Boolean(deleteUserError),
        deleteOrganizationFailed: Boolean(deleteOrganizationError),
      });

      return jsonResponse({ error: 'Ranch setup needs support. Contact StockLog support.' }, 500);
    }

    return jsonResponse({ error: 'Unable to finish ranch setup. Please try again.' }, 500);
  }

  return jsonResponse({
    organizationId: organization.id,
    ranchName: organization.name,
    role: 'admin',
    displayName: fullName,
    email,
  });
});
