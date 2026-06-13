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

type FunctionErrorWithContext = Error & {
  context?: Response;
};

async function getFunctionErrorMessage(error: FunctionErrorWithContext): Promise<string> {
  if (error.context) {
    try {
      const body = await error.context.clone().json();
      if (typeof body?.error === 'string') {
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
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();

    if (sessionError) {
      throw new Error(sessionError.message);
    }

    const accessToken = sessionData.session?.access_token;

    if (!accessToken) {
      throw new Error('Sign in again before creating an invite.');
    }

    const { data, error } = await supabase.functions.invoke<CreateInviteResult>('create-invite', {
      body: input,
      headers: {
        Authorization: `Bearer ${accessToken}`,
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
};
