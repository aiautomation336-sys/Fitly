export type NormalizedLandmark = { x: number; y: number };

// Индексы точек модели MediaPipe/BlazePose Pose (33 точки).
const LANDMARK = {
  NOSE: 0,
  LEFT_SHOULDER: 11,
  RIGHT_SHOULDER: 12,
  LEFT_HIP: 23,
  RIGHT_HIP: 24,
  LEFT_ANKLE: 27,
  RIGHT_ANKLE: 28,
} as const;

// Эмпирические коэффициенты "ширина по фото -> обхват". Ширина плеч/бёдер на фронтальном
// фото не равна обхвату (тело не плоское) — это приблизительные множители, ожидаемо менее
// точные, чем у платных 3D-скан API. Уточняются по фидбеку "село/не село" (Этап 7).
//
// Откалибровано 2026-07-29 по реальному тесту (A-pose, облегающая одежда, фронтальная
// камера + гид-силуэт): фото дало обхват груди 103 см при реальном ~95 см (было 120 см на
// исходном коэффициенте 2.7 при T-pose/мешковатой одежде — большая часть ошибки была именно
// от позы и одежды, не от коэффициента). Новый коэффициент груди посчитан от этой точки;
// талия/бёдра пересчитаны тем же относительным поправочным множителем (~0.926), так как
// отдельных калибровочных данных по ним пока нет.
const CHEST_FROM_SHOULDER_WIDTH = 2.5;
const WAIST_FROM_TORSO_WIDTH = 2.3;
const HIPS_FROM_HIP_WIDTH = 2.6;

export type BodyMeasurements = {
  chestCm: number;
  waistCm: number;
  hipsCm: number;
};

function pixelDistance(
  a: NormalizedLandmark,
  b: NormalizedLandmark,
  imageWidth: number,
  imageHeight: number
): number {
  const dx = (a.x - b.x) * imageWidth;
  const dy = (a.y - b.y) * imageHeight;
  return Math.sqrt(dx * dx + dy * dy);
}

export function measurementsFromLandmarks(
  landmarks: NormalizedLandmark[],
  imageWidth: number,
  imageHeight: number,
  heightCm: number
): BodyMeasurements {
  const nose = landmarks[LANDMARK.NOSE];
  const leftShoulder = landmarks[LANDMARK.LEFT_SHOULDER];
  const rightShoulder = landmarks[LANDMARK.RIGHT_SHOULDER];
  const leftHip = landmarks[LANDMARK.LEFT_HIP];
  const rightHip = landmarks[LANDMARK.RIGHT_HIP];
  const leftAnkle = landmarks[LANDMARK.LEFT_ANKLE];
  const rightAnkle = landmarks[LANDMARK.RIGHT_ANKLE];

  if (!nose || !leftShoulder || !rightShoulder || !leftHip || !rightHip || !leftAnkle || !rightAnkle) {
    throw new Error('Не удалось распознать все нужные точки тела на фото.');
  }

  const ankleMid: NormalizedLandmark = {
    x: (leftAnkle.x + rightAnkle.x) / 2,
    y: (leftAnkle.y + rightAnkle.y) / 2,
  };

  const pixelHeight = pixelDistance(nose, ankleMid, imageWidth, imageHeight);
  if (pixelHeight <= 0) {
    throw new Error('Не удалось вычислить масштаб по фото — попробуй сфотографироваться в полный рост, анфас.');
  }
  const cmPerPixel = heightCm / pixelHeight;

  const shoulderWidthCm = pixelDistance(leftShoulder, rightShoulder, imageWidth, imageHeight) * cmPerPixel;
  const hipWidthCm = pixelDistance(leftHip, rightHip, imageWidth, imageHeight) * cmPerPixel;
  const torsoWidthCm = (shoulderWidthCm + hipWidthCm) / 2;

  return {
    chestCm: Math.round(shoulderWidthCm * CHEST_FROM_SHOULDER_WIDTH),
    waistCm: Math.round(torsoWidthCm * WAIST_FROM_TORSO_WIDTH),
    hipsCm: Math.round(hipWidthCm * HIPS_FROM_HIP_WIDTH),
  };
}
