import { sizeExplanation, universalSize } from '../sizeFormula';

describe('universalSize', () => {
  it('returns XS below the lowest band', () => {
    expect(universalSize(80)).toBe('XS');
  });

  it('is inclusive on band boundaries', () => {
    expect(universalSize(86)).toBe('XS');
    expect(universalSize(87)).toBe('S');
    expect(universalSize(94)).toBe('S');
    expect(universalSize(95)).toBe('M');
    expect(universalSize(102)).toBe('M');
    expect(universalSize(103)).toBe('L');
    expect(universalSize(110)).toBe('L');
    expect(universalSize(111)).toBe('XL');
    expect(universalSize(118)).toBe('XL');
    expect(universalSize(119)).toBe('XXL');
  });

  it('returns XXL for very large values', () => {
    expect(universalSize(200)).toBe('XXL');
  });
});

describe('sizeExplanation', () => {
  it('includes the size and the chest measurement', () => {
    expect(sizeExplanation(96)).toBe('Твой размер: M — по обхвату груди 96 см');
  });
});
