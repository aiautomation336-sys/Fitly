import { silhouetteHalfWidths } from '../silhouetteGeometry';

describe('silhouetteHalfWidths', () => {
  it('scales the widest measurement to exactly half of maxDrawWidth', () => {
    const result = silhouetteHalfWidths(100, 80, 90, 140);
    expect(result.chestHalf).toBeCloseTo(70); // widest (100cm) -> maxDrawWidth/2
  });

  it('keeps proportions between measurements', () => {
    const result = silhouetteHalfWidths(100, 80, 90, 140);
    expect(result.waistHalf).toBeCloseTo(result.chestHalf * 0.8);
    expect(result.hipsHalf).toBeCloseTo(result.chestHalf * 0.9);
  });

  it('throws when all measurements are zero', () => {
    expect(() => silhouetteHalfWidths(0, 0, 0, 140)).toThrow();
  });
});
