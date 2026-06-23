import { supabase } from './supabaseClient';

interface DeleteAccountResult {
  deletedUserId?: string;
  removedProfileAccess?: boolean;
  message?: string;
}

export const authService = {
  async signInWithPassword(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      throw new Error(error.message);
    }

    return data;
  },

  async signOut() {
    const { error } = await supabase.auth.signOut();

    if (error) {
      throw new Error(error.message);
    }
  },

  async getCurrentUser() {
    const { data, error } = await supabase.auth.getUser();

    if (error) {
      return null;
    }

    return data.user;
  },

  async deleteAccount() {
    const { data, error } = await supabase.functions.invoke<DeleteAccountResult>('delete-account', {
      body: {},
    });

    if (error) {
      const context = 'context' in error ? (error as { context?: Response }).context : null;

      if (context) {
        try {
          const errorBody = await context.clone().json();

          if (typeof errorBody?.error === 'string') {
            throw new Error(errorBody.error);
          }
        } catch (_parseError) {
          // Fall through to the Supabase error message.
        }
      }

      throw new Error(error.message);
    }

    return data;
  },
};
