import { allBrandSizes, brandSize } from '../brandSizeCharts';

describe('brandSize', () => {
  it('respects band boundaries per brand', () => {
    expect(brandSize('zara', 92)).toBe('S');
    expect(brandSize('zara', 93)).toBe('M');
    expect(brandSize('hm', 88)).toBe('S');
    expect(brandSize('hm', 89)).toBe('M');
  });

  it('falls back to the largest label above the top band', () => {
    expect(brandSize('nike', 500)).toBe('XXL');
  });

  it('throws for an unknown brand key', () => {
    // @ts-expect-error testing runtime guard against an invalid key
    expect(() => brandSize('unknown-brand', 96)).toThrow();
  });
});

describe('allBrandSizes', () => {
  it('returns one entry per known brand', () => {
    const sizes = allBrandSizes(96);
    expect(sizes.map((s) => s.brand)).toEqual(['Zara', 'H&M', 'Uniqlo', 'Nike']);
    expect(sizes.every((s) => typeof s.size === 'string')).toBe(true);
  });
});
