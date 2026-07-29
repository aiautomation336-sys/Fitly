export type SilhouetteHalfWidths = {
  chestHalf: number;
  waistHalf: number;
  hipsHalf: number;
};

// Переводит реальные обхваты (см) в половины ширины для рисования силуэта,
// масштабируя самый широкий из трёх под maxDrawWidth.
export function silhouetteHalfWidths(
  chestCm: number,
  waistCm: number,
  hipsCm: number,
  maxDrawWidth: number
): SilhouetteHalfWidths {
  const maxMeasurement = Math.max(chestCm, waistCm, hipsCm);
  if (maxMeasurement <= 0) {
    throw new Error('Измерения должны быть положительными числами.');
  }
  const scale = maxDrawWidth / maxMeasurement;
  return {
    chestHalf: (chestCm * scale) / 2,
    waistHalf: (waistCm * scale) / 2,
    hipsHalf: (hipsCm * scale) / 2,
  };
}
