import { measurementsFromLandmarks, NormalizedLandmark } from '../poseMeasurement';

const IMAGE_WIDTH = 1000;
const IMAGE_HEIGHT = 1000;
const HEIGHT_CM = 180;

function buildLandmarks(overrides: Partial<Record<number, NormalizedLandmark>> = {}): NormalizedLandmark[] {
  const base: NormalizedLandmark[] = new Array(33).fill(null).map(() => ({ x: 0, y: 0 }));
  base[0] = { x: 0.5, y: 0.1 }; // nose
  base[11] = { x: 0.4, y: 0.2 }; // left shoulder
  base[12] = { x: 0.6, y: 0.2 }; // right shoulder
  base[23] = { x: 0.42, y: 0.55 }; // left hip
  base[24] = { x: 0.58, y: 0.55 }; // right hip
  base[27] = { x: 0.45, y: 0.95 }; // left ankle
  base[28] = { x: 0.55, y: 0.95 }; // right ankle
  Object.entries(overrides).forEach(([index, landmark]) => {
    base[Number(index)] = landmark as NormalizedLandmark;
  });
  return base;
}

describe('measurementsFromLandmarks', () => {
  it('computes plausible measurements from a synthetic frontal pose', () => {
    const result = measurementsFromLandmarks(buildLandmarks(), IMAGE_WIDTH, IMAGE_HEIGHT, HEIGHT_CM);
    expect(result.chestCm).toBeGreaterThan(80);
    expect(result.chestCm).toBeLessThan(140);
    expect(result.waistCm).toBeGreaterThan(60);
    expect(result.hipsCm).toBeGreaterThan(60);
  });

  it('is deterministic for the same input', () => {
    const a = measurementsFromLandmarks(buildLandmarks(), IMAGE_WIDTH, IMAGE_HEIGHT, HEIGHT_CM);
    const b = measurementsFromLandmarks(buildLandmarks(), IMAGE_WIDTH, IMAGE_HEIGHT, HEIGHT_CM);
    expect(a).toEqual(b);
  });

  it('scales measurements up for a taller entered height', () => {
    const shorter = measurementsFromLandmarks(buildLandmarks(), IMAGE_WIDTH, IMAGE_HEIGHT, 160);
    const taller = measurementsFromLandmarks(buildLandmarks(), IMAGE_WIDTH, IMAGE_HEIGHT, 200);
    expect(taller.chestCm).toBeGreaterThan(shorter.chestCm);
  });

  it('throws when a required landmark is missing', () => {
    const incomplete = buildLandmarks().slice(0, 20); // drops hips/ankles
    expect(() => measurementsFromLandmarks(incomplete, IMAGE_WIDTH, IMAGE_HEIGHT, HEIGHT_CM)).toThrow();
  });

  it('throws when the pixel height is zero (nose and ankles coincide)', () => {
    const degenerate = buildLandmarks({
      27: { x: 0.5, y: 0.1 },
      28: { x: 0.5, y: 0.1 },
    });
    expect(() => measurementsFromLandmarks(degenerate, IMAGE_WIDTH, IMAGE_HEIGHT, HEIGHT_CM)).toThrow();
  });
});
