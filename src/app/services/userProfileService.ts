import { supabase } from './supabaseClient';

export type UserProfileRole = 'admin' | 'manager' | 'operator' | 'viewer';

export interface CurrentUserProfile {
  id: string;
  email?: string;
  displayName: string;
  role: UserProfileRole;
  organizationId?: string;
  organizationName?: string;
  isActive: boolean;
}

interface UserProfileRow {
  id: string;
  organization_id: string | null;
  display_name: string;
  role: UserProfileRole;
  is_active: boolean;
}

interface OrganizationRow {
  id: string;
  name: string;
}

function formatRole(role: string): string {
  if (role === 'viewer') return 'View Only';
  return role.charAt(0).toUpperCase() + role.slice(1);
}

async function getCurrentProfileFromSupabase(): Promise<CurrentUserProfile | null> {
  const { data: userData, error: userError } = await supabase.auth.getUser();

  if (userError) {
    throw new Error(userError.message);
  }

  const authUser = userData.user;

  if (!authUser) {
    return null;
  }

  const { data: profileRow, error: profileError } = await supabase
    .from('user_profiles')
    .select('id, organization_id, display_name, role, is_active')
    .eq('id', authUser.id)
    .maybeSingle();

  if (profileError) {
    throw new Error(`${profileError.message}${profileError.details ? ` — ${profileError.details}` : ''}`);
  }

  if (!profileRow) {
    return {
      id: authUser.id,
      email: authUser.email,
      displayName: authUser.email ?? 'Current User',
      role: 'viewer',
      isActive: false,
    };
  }

  const profile = profileRow as UserProfileRow;
  let organizationName: string | undefined;

  if (profile.organization_id) {
    const { data: organizationRow, error: organizationError } = await supabase
      .from('organizations')
      .select('id, name')
      .eq('id', profile.organization_id)
      .maybeSingle();

    if (organizationError) {
      throw new Error(`${organizationError.message}${organizationError.details ? ` — ${organizationError.details}` : ''}`);
    }

    organizationName = (organizationRow as OrganizationRow | null)?.name;
  }

  return {
    id: profile.id,
    email: authUser.email,
    displayName: profile.display_name,
    role: profile.role,
    organizationId: profile.organization_id ?? undefined,
    organizationName,
    isActive: profile.is_active,
  };
}

export const userProfileService = {
  formatRole,

  async getCurrentProfile(): Promise<CurrentUserProfile | null> {
    return getCurrentProfileFromSupabase();
  },
};
