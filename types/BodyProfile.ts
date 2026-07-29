export type InputMethod = 'manual' | 'photo';

export type BodyProfileRow = {
  id: string;
  user_id: string;
  height_cm: number;
  weight_kg: number;
  chest_cm: number;
  waist_cm: number;
  hips_cm: number;
  input_method: InputMethod;
  updated_at: string;
};
