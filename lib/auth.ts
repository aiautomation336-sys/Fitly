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

// Привязывает email к текущей (обычно анонимной) сессии — тот же user_id сохраняется,
// профиль и история не теряются. Supabase шлёт код подтверждения на почту.
export async function requestEmailLink(email: string): Promise<void> {
  const { error } = await supabase.auth.updateUser({ email });
  if (error) throw error;
}

// Подтверждает код из письма и завершает привязку email к аккаунту.
export async function confirmEmailLink(email: string, token: string): Promise<void> {
  const { error } = await supabase.auth.verifyOtp({ email, token, type: 'email_change' });
  if (error) throw error;
}

// Вход на новом устройстве по уже привязанному email — заменяет текущую (анонимную)
// сессию на постоянный аккаунт, чтобы вернуть сохранённые ранее данные.
export async function requestLoginCode(email: string): Promise<void> {
  const { error } = await supabase.auth.signInWithOtp({ email });
  if (error) throw error;
}

export async function confirmLogin(email: string, token: string): Promise<void> {
  const { error } = await supabase.auth.verifyOtp({ email, token, type: 'email' });
  if (error) throw error;
}
