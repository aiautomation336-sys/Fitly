export type BrandKey = 'zara' | 'hm' | 'uniqlo' | 'nike';

type ChestBand = {
  maxChestCm: number;
  label: string;
};

type Brand = {
  key: BrandKey;
  name: string;
  bands: ChestBand[];
};

// Стартовые приблизительные диапазоны по публичным размерным сеткам брендов.
// Не точный скрейп — ориентир для MVP, уточним по мере роста и фидбека "село/не село".
const BRANDS: Brand[] = [
  {
    key: 'zara',
    name: 'Zara',
    bands: [
      { maxChestCm: 92, label: 'S' },
      { maxChestCm: 100, label: 'M' },
      { maxChestCm: 108, label: 'L' },
      { maxChestCm: 116, label: 'XL' },
      { maxChestCm: Infinity, label: 'XXL' },
    ],
  },
  {
    key: 'hm',
    name: 'H&M',
    bands: [
      { maxChestCm: 88, label: 'S' },
      { maxChestCm: 96, label: 'M' },
      { maxChestCm: 104, label: 'L' },
      { maxChestCm: 112, label: 'XL' },
      { maxChestCm: Infinity, label: 'XXL' },
    ],
  },
  {
    key: 'uniqlo',
    name: 'Uniqlo',
    bands: [
      { maxChestCm: 90, label: 'S' },
      { maxChestCm: 98, label: 'M' },
      { maxChestCm: 106, label: 'L' },
      { maxChestCm: 114, label: 'XL' },
      { maxChestCm: Infinity, label: 'XXL' },
    ],
  },
  {
    key: 'nike',
    name: 'Nike',
    bands: [
      { maxChestCm: 91, label: 'S' },
      { maxChestCm: 101, label: 'M' },
      { maxChestCm: 111, label: 'L' },
      { maxChestCm: 121, label: 'XL' },
      { maxChestCm: Infinity, label: 'XXL' },
    ],
  },
];

export function brandSize(brandKey: BrandKey, chestCm: number): string {
  const brand = BRANDS.find((b) => b.key === brandKey);
  if (!brand) throw new Error(`Unknown brand: ${brandKey}`);
  const band = brand.bands.find((b) => chestCm <= b.maxChestCm);
  return (band ?? brand.bands[brand.bands.length - 1]).label;
}

export function allBrandSizes(chestCm: number): { brand: string; size: string }[] {
  return BRANDS.map((brand) => ({ brand: brand.name, size: brandSize(brand.key, chestCm) }));
}
