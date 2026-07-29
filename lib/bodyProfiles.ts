import { BodyProfileRow } from '@/types/BodyProfile';
import { supabase } from './supabase';

export async function getLatestProfile(userId: string): Promise<BodyProfileRow | null> {
  const { data, error } = await supabase
    .from('body_profiles')
    .select('*')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw error;
  return data;
}

export type ProfileMeasurements = Pick<
  BodyProfileRow,
  'height_cm' | 'weight_kg' | 'chest_cm' | 'waist_cm' | 'hips_cm' | 'input_method'
>;

export async function updateProfile(id: string, values: ProfileMeasurements): Promise<void> {
  const { error } = await supabase
    .from('body_profiles')
    .update({ ...values, updated_at: new Date().toISOString() })
    .eq('id', id);
  if (error) throw error;
}

export async function createProfile(
  userId: string,
  values: ProfileMeasurements
): Promise<BodyProfileRow> {
  const { data, error } = await supabase
    .from('body_profiles')
    .insert({ user_id: userId, ...values })
    .select()
    .single();
  if (error) throw error;
  return data;
}
