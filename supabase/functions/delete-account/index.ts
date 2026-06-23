import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

interface ProfileRow {
  id: string;
  organization_id: string | null;
  is_active: boolean;
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

Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  if (request.method !== 'POST') {
    return jsonResponse({ error: 'Method not allowed.' }, 405);
  }

  const supabaseUrl = Deno.env.get('STOCKLOG_SUPABASE_URL') ?? Deno.env.get('SUPABASE_URL');
  const serviceRoleKey = Deno.env.get('STOCKLOG_SERVICE_ROLE_KEY') ?? Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

  if (!supabaseUrl || !serviceRoleKey) {
    return jsonResponse({ error: 'Server is not configured for account deletion.' }, 500);
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
  const user = userData.user;

  if (userError || !user) {
    return jsonResponse({ error: 'Invalid or expired session.' }, 401);
  }

  const { data: profile, error: profileReadError } = await supabase
    .from('user_profiles')
    .select('id, organization_id, is_active')
    .eq('id', user.id)
    .maybeSingle<ProfileRow>();

  if (profileReadError) {
    console.error('delete-account profile lookup failed', {
      userId: user.id,
      code: profileReadError.code,
      message: profileReadError.message,
      details: profileReadError.details,
      hint: profileReadError.hint,
    });

    return jsonResponse({ error: 'Unable to verify account profile.' }, 500);
  }

  if (profile) {
    const { error: profileUpdateError } = await supabase
      .from('user_profiles')
      .update({
        is_active: false,
        organization_id: null,
      })
      .eq('id', user.id);

    if (profileUpdateError) {
      console.error('delete-account profile access removal failed', {
        userId: user.id,
        organizationId: profile.organization_id,
        code: profileUpdateError.code,
        message: profileUpdateError.message,
        details: profileUpdateError.details,
        hint: profileUpdateError.hint,
      });

      return jsonResponse({ error: 'Unable to remove account access.' }, 500);
    }
  }

  const { error: deleteUserError } = await supabase.auth.admin.deleteUser(user.id);

  if (deleteUserError) {
    console.error('delete-account auth user deletion failed', {
      userId: user.id,
      message: deleteUserError.message,
    });

    return jsonResponse({ error: 'Unable to delete account login.' }, 500);
  }

  return jsonResponse({
    deletedUserId: user.id,
    removedProfileAccess: Boolean(profile),
    message: 'Account deleted.',
  });
});
