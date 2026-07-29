import { supabase } from './supabase';

export type FitFeedbackInput = {
  userId: string;
  bodyProfileId: string;
  brand: string;
  recommendedSize: string;
  fits: boolean;
};

export async function submitFeedback(input: FitFeedbackInput): Promise<void> {
  const { error } = await supabase.from('fit_feedback').insert({
    user_id: input.userId,
    body_profile_id: input.bodyProfileId,
    brand: input.brand,
    recommended_size: input.recommendedSize,
    fits: input.fits,
  });
  if (error) throw error;
}
