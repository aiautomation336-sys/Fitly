import { Session } from '@supabase/supabase-js';
import { supabase } from './supabase';

export async function ensureSession(): Promise<Session> {
  const { data: existing } = await supabase.auth.getSession();
  if (existing.session) return existing.session;

  const { data, error } = await supabase.auth.signInAnonymously();
  if (error) throw error;
  if (!data.session) throw new Error('Anonymous sign-in returned no session.');
  return data.session;
}
