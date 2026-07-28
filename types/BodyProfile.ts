export type InputMethod = 'manual' | 'photo';

export type BodyProfile = {
  id: string;
  userId: string;
  heightCm: number;
  weightKg: number;
  chestCm: number;
  waistCm: number;
  hipsCm: number;
  inputMethod: InputMethod;
  updatedAt: string;
};
