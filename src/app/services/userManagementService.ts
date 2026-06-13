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

  return error.message || 'Unable to create invitation.';
}

export const userManagementService = {
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

    if (!data?.invitation || !data.inviteCode) {
      throw new Error('Invite creation returned an unexpected response.');
    }

    return data;
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
};
