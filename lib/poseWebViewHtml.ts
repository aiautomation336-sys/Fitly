// HTML-страница, выполняемая внутри скрытого WebView. Загружает MediaPipe Tasks Vision
// (JS/WASM-сборка) из CDN и прогоняет Pose Landmarker по одному кадру — фото пользователя.
// Почему WebView, а не нативный модуль: см. FITLY_TZ.md, Этап 4 — нативные RN-обёртки над
// MediaPipe Pose либо заброшены, либо требуют кастомную сборку (EAS Build) вместо Expo Go.
export function buildPoseHtml(imageDataUri: string): string {
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8" /><meta name="viewport" content="width=device-width, initial-scale=1" /></head>
<body style="margin:0;background:#000;">
<script type="module">
  function post(message) {
    window.ReactNativeWebView.postMessage(JSON.stringify(message));
  }

  async function run() {
    try {
      const { FilesetResolver, PoseLandmarker } = await import(
        'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest'
      );

      const vision = await FilesetResolver.forVisionTasks(
        'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm'
      );

      const poseLandmarker = await PoseLandmarker.createFromOptions(vision, {
        baseOptions: {
          modelAssetPath:
            'https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/latest/pose_landmarker_lite.task',
        },
        runningMode: 'IMAGE',
      });

      const img = new Image();
      img.onload = () => {
        try {
          const result = poseLandmarker.detect(img);
          if (!result.landmarks || result.landmarks.length === 0) {
            post({ type: 'error', message: 'Тело на фото не распознано — попробуй другое фото в полный рост.' });
            return;
          }
          post({
            type: 'result',
            landmarks: result.landmarks[0].map((p) => ({ x: p.x, y: p.y })),
            imageWidth: img.naturalWidth,
            imageHeight: img.naturalHeight,
          });
        } catch (e) {
          post({ type: 'error', message: 'Ошибка распознавания: ' + String(e) });
        }
      };
      img.onerror = () => post({ type: 'error', message: 'Не удалось загрузить фото в модель.' });
      img.src = ${JSON.stringify(imageDataUri)};
    } catch (e) {
      post({ type: 'error', message: 'Не удалось загрузить модель распознавания: ' + String(e) });
    }
  }

  run();
</script>
</body>
</html>`;
}
