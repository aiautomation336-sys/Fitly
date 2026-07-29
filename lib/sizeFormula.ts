export type UniversalSize = 'XS' | 'S' | 'M' | 'L' | 'XL' | 'XXL';

type ChestBand = {
  maxChestCm: number;
  size: UniversalSize;
};

// Обхват груди — самый устойчивый ориентир для верхней одежды (устойчивее роста/веса).
// Границы — усреднённые унисекс-диапазоны, без привязки к конкретному бренду.
const UNIVERSAL_CHEST_BANDS: ChestBand[] = [
  { maxChestCm: 86, size: 'XS' },
  { maxChestCm: 94, size: 'S' },
  { maxChestCm: 102, size: 'M' },
  { maxChestCm: 110, size: 'L' },
  { maxChestCm: 118, size: 'XL' },
  { maxChestCm: Infinity, size: 'XXL' },
];

export function universalSize(chestCm: number): UniversalSize {
  const band = UNIVERSAL_CHEST_BANDS.find((b) => chestCm <= b.maxChestCm);
  return (band ?? UNIVERSAL_CHEST_BANDS[UNIVERSAL_CHEST_BANDS.length - 1]).size;
}

export function sizeExplanation(chestCm: number): string {
  return `Твой размер: ${universalSize(chestCm)} — по обхвату груди ${chestCm} см`;
}
