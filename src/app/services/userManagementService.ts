import { supabase } from './supabaseClient';
import type { UserRole } from '../types';

export interface CreateInviteInput {
  email: string;
  role: UserRole;
  expiresInDays?: number;
}

export interface CreatedInvitation {
  id: string;
  email: string;
  role: UserRole;
  status: 'pending' | 'accepted' | 'revoked' | 'expired';
  organizationId: string;
  expiresAt: string;
  createdAt: string;
}

export interface CreateInviteResult {
  invitation: CreatedInvitation;
  inviteCode: string;
}

export interface OrganizationUser {
  id: string;
  displayName: string;
  role: UserRole;
  isActive: boolean;
  createdAt: string;
  email?: string;
}

export interface OrganizationInvitation {
  id: string;
  email: string;
  role: UserRole;
  status: 'pending' | 'accepted' | 'revoked' | 'expired';
  createdAt: string;
  expiresAt: string;
  acceptedAt?: string | null;
  revokedAt?: string | null;
  lastSentAt?: string | null;
}

export interface AcceptInviteInput {
  fullName: string;
  email: string;
  password: string;
  inviteCode: string;
}

export interface AcceptInviteResult {
  organizationId: string;
  role: UserRole;
  displayName: string;
  email: string;
}

export interface CreateRanchInput {
  ranchName: string;
  fullName: string;
  email: string;
  password: string;
}

export interface CreateRanchResult {
  organizationId: string;
  ranchName: string;
  role: 'admin';
  displayName: string;
  email: string;
}

type FunctionErrorWithContext = Error & {
  context?: Response;
};

async function getFunctionErrorMessage(error: FunctionErrorWithContext): Promise<string> {
  if (error.context) {
    try {
      const body = await error.context.clone().json();
      if (typeof body?.error === 'string') {
        if (typeof body?.betaDetail === 'string') {
          return `${body.error} (${body.betaDetail})`;
        }

        return body.error;
      }
    } catch (_parseError) {
      // Fall back to the function client's message below.
    }
  }

  return error.message || 'Unable to complete request.';
}

export const userManagementService = {
  async listOrganizationUsers(): Promise<OrganizationUser[]> {
    const { data, error } = await supabase
      .from('user_profiles')
      .select('id, display_name, role, is_active, created_at')
      .order('display_name', { ascending: true });

    if (error) {
      throw new Error(error.message);
    }

    return (data ?? []).map((row) => ({
      id: row.id,
      displayName: row.display_name,
      role: row.role,
      isActive: row.is_active,
      createdAt: row.created_at,
    }));
  },

  async listOrganizationInvitations(): Promise<OrganizationInvitation[]> {
    const { data, error } = await supabase
      .from('user_invitations')
      .select('id, email, role, status, created_at, expires_at, accepted_at, revoked_at, last_sent_at')
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(error.message);
    }

    return (data ?? []).map((row) => ({
      id: row.id,
      email: row.email,
      role: row.role,
      status: row.status,
      createdAt: row.created_at,
      expiresAt: row.expires_at,
      acceptedAt: row.accepted_at,
      revokedAt: row.revoked_at,
      lastSentAt: row.last_sent_at,
    }));
  },

  async createInvite(input: CreateInviteInput): Promise<CreateInviteResult> {
    const {
      data: { session },
      error: sessionError,
    } = await supabase.auth.getSession();

    if (sessionError) {
      throw new Error(sessionError.message);
    }

    if (!session?.access_token) {
      throw new Error('You must be signed in to create invites.');
    }

    const { data, error } = await supabase.functions.invoke<CreateInviteResult>('create-invite', {
      body: input,
      headers: {
        Authorization: `Bearer ${session.access_token}`,
      },
    });

    if (error) {
      throw new Error(await getFunctionErrorMessage(error as FunctionErrorWithContext));
    }

    if (!data?.invitation) {
      throw new Error('Invite creation returned an unexpected response.');
    }

    if (!data.inviteCode) {
      throw new Error('Invite was created but no code was returned. Create a new invite.');
    }

    return {
      invitation: data.invitation,
      inviteCode: data.inviteCode,
    };
  },

  async acceptInvite(input: AcceptInviteInput): Promise<AcceptInviteResult> {
    const { data, error } = await supabase.functions.invoke<AcceptInviteResult>('accept-invite', {
      body: input,
    });

    if (error) {
      throw new Error(await getFunctionErrorMessage(error as FunctionErrorWithContext));
    }

    if (!data?.organizationId || !data.role || !data.displayName || !data.email) {
      throw new Error('Invite acceptance returned an unexpected response.');
    }

    return data;
  },

  async createRanch(input: CreateRanchInput): Promise<CreateRanchResult> {
    const { data, error } = await supabase.functions.invoke<CreateRanchResult>('create-ranch', {
      body: input,
    });

    if (error) {
      throw new Error(await getFunctionErrorMessage(error as FunctionErrorWithContext));
    }

    if (!data?.organizationId || !data.ranchName || data.role !== 'admin' || !data.displayName || !data.email) {
      throw new Error('Ranch setup returned an unexpected response.');
    }

    return data;
  },
};
