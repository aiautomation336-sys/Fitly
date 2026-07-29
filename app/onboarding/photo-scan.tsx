import { CameraType, CameraView, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { WebView, WebViewMessageEvent } from 'react-native-webview';
import { PoseGuideOverlay } from '@/components/PoseGuideOverlay';
import { ensureSession } from '@/lib/auth';
import { uploadAvatarPhoto } from '@/lib/avatarStorage';
import { createProfile, updateProfile } from '@/lib/bodyProfiles';
import { errorMessage } from '@/lib/errorMessage';
import { BodyMeasurements, measurementsFromLandmarks, NormalizedLandmark } from '@/lib/poseMeasurement';
import { buildPoseHtml } from '@/lib/poseWebViewHtml';

type Step = 'input' | 'camera' | 'processing' | 'review';

type PoseResultMessage =
  | { type: 'result'; landmarks: NormalizedLandmark[]; imageWidth: number; imageHeight: number }
  | { type: 'error'; message: string };

function validateRange(raw: string, min: number, max: number): number | null {
  const num = Number(raw.trim().replace(',', '.'));
  if (raw.trim() === '' || Number.isNaN(num) || num < min || num > max) return null;
  return num;
}

export default function PhotoScan() {
  const { editProfileId } = useLocalSearchParams<{ editProfileId?: string }>();
  const [step, setStep] = useState<Step>('input');
  const [heightCm, setHeightCm] = useState('');
  const [weightKg, setWeightKg] = useState('');
  const [fieldError, setFieldError] = useState<string | null>(null);
  const [photoDataUri, setPhotoDataUri] = useState<string | null>(null);
  const [measurements, setMeasurements] = useState<BodyMeasurements | null>(null);
  const [scanError, setScanError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const [facing, setFacing] = useState<CameraType>('back');
  const [timerSeconds, setTimerSeconds] = useState<0 | 3 | 5 | 10>(5);
  const [countdown, setCountdown] = useState<number | null>(null);
  const cameraRef = useRef<CameraView>(null);

  useEffect(() => {
    if (countdown === null) return;
    if (countdown === 0) {
      setCountdown(null);
      capturePhoto();
      return;
    }
    const timeout = setTimeout(() => setCountdown((prev) => (prev !== null ? prev - 1 : null)), 1000);
    return () => clearTimeout(timeout);
  }, [countdown]);

  function validateFields(): { height: number; weight: number } | null {
    setFieldError(null);
    const height = validateRange(heightCm, 100, 250);
    const weight = validateRange(weightKg, 30, 300);
    if (height === null) {
      setFieldError('Введи рост от 100 до 250 см');
      return null;
    }
    if (weight === null) {
      setFieldError('Введи вес от 30 до 300 кг');
      return null;
    }
    return { height, weight };
  }

  async function openCamera() {
    if (!validateFields()) return;
    if (!cameraPermission?.granted) {
      const result = await requestCameraPermission();
      if (!result.granted) {
        setFieldError('Нужен доступ к камере, чтобы сделать фото-скан.');
        return;
      }
    }
    setStep('camera');
  }

  function handleShutterPress() {
    if (timerSeconds === 0) {
      capturePhoto();
      return;
    }
    setCountdown(timerSeconds);
  }

  function cycleTimer() {
    setTimerSeconds((prev) => (prev === 0 ? 3 : prev === 3 ? 5 : prev === 5 ? 10 : 0));
  }

  async function capturePhoto() {
    if (!cameraRef.current) return;
    const photo = await cameraRef.current.takePictureAsync({ base64: true, quality: 0.7 });
    if (!photo?.base64) {
      setFieldError('Не удалось сделать фото, попробуй ещё раз.');
      setStep('input');
      return;
    }
    setPhotoDataUri(`data:image/jpeg;base64,${photo.base64}`);
    setStep('processing');
  }

  async function pickFromLibrary() {
    if (!validateFields()) return;

    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      setFieldError('Нужен доступ к галерее, чтобы выбрать фото.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({ base64: true, quality: 0.7 });
    if (result.canceled || !result.assets[0]?.base64) return;

    const mimeType = result.assets[0].mimeType ?? 'image/jpeg';
    setPhotoDataUri(`data:${mimeType};base64,${result.assets[0].base64}`);
    setStep('processing');
  }

  function handleWebViewMessage(event: WebViewMessageEvent) {
    let message: PoseResultMessage;
    try {
      message = JSON.parse(event.nativeEvent.data);
    } catch {
      setScanError('Не удалось прочитать ответ от модели распознавания.');
      setStep('input');
      return;
    }

    if (message.type === 'error') {
      setScanError(message.message);
      setStep('input');
      return;
    }

    try {
      const height = validateRange(heightCm, 100, 250)!;
      const result = measurementsFromLandmarks(
        message.landmarks,
        message.imageWidth,
        message.imageHeight,
        height
      );
      setMeasurements(result);
      setStep('review');
    } catch (err) {
      setScanError(errorMessage(err));
      setStep('input');
    }
  }

  async function handleSave() {
    if (!measurements) return;
    const height = validateRange(heightCm, 100, 250)!;
    const weight = validateRange(weightKg, 30, 300)!;

    setSaving(true);
    setScanError(null);
    try {
      const session = await ensureSession();
      let avatarPath: string | null = null;
      if (photoDataUri) {
        const base64 = photoDataUri.split(',')[1];
        avatarPath = await uploadAvatarPhoto(session.user.id, base64);
      }

      if (editProfileId) {
        await updateProfile(editProfileId, {
          height_cm: height,
          weight_kg: weight,
          chest_cm: measurements.chestCm,
          waist_cm: measurements.waistCm,
          hips_cm: measurements.hipsCm,
          input_method: 'photo',
          avatar_path: avatarPath,
        });
        router.replace('/profile');
        return;
      }

      const profile = await createProfile(session.user.id, {
        height_cm: height,
        weight_kg: weight,
        chest_cm: measurements.chestCm,
        waist_cm: measurements.waistCm,
        hips_cm: measurements.hipsCm,
        input_method: 'photo',
        avatar_path: avatarPath,
      });
      router.replace({
        pathname: '/onboarding/result',
        params: {
          profileId: profile.id,
          chestCm: String(measurements.chestCm),
          waistCm: String(measurements.waistCm),
          hipsCm: String(measurements.hipsCm),
        },
      });
    } catch (err) {
      setScanError(errorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  if (step === 'camera') {
    return (
      <View style={styles.cameraContainer}>
        <CameraView ref={cameraRef} style={StyleSheet.absoluteFill} facing={facing}>
          <PoseGuideOverlay />

          <View style={styles.cameraTopBar}>
            <Pressable onPress={() => setStep('input')} hitSlop={8}>
              <Text style={styles.cameraCancel}>Отмена</Text>
            </Pressable>
            <View style={styles.cameraTopBarRight}>
              <Pressable onPress={cycleTimer} hitSlop={8} style={styles.cameraTopButton}>
                <Text style={styles.cameraTopButtonText}>
                  ⏱ {timerSeconds === 0 ? 'выкл' : `${timerSeconds}с`}
                </Text>
              </Pressable>
              <Pressable
                onPress={() => setFacing((prev) => (prev === 'back' ? 'front' : 'back'))}
                hitSlop={8}
                style={styles.cameraTopButton}
              >
                <Text style={styles.cameraTopButtonText}>🔄</Text>
              </Pressable>
            </View>
          </View>

          {countdown !== null && (
            <View style={styles.countdownOverlay}>
              <Text style={styles.countdownText}>{countdown}</Text>
            </View>
          )}

          <View style={styles.cameraOverlayUi}>
            <Text style={styles.cameraHint}>
              Встань в полный рост, совместив силуэт с подсказкой. Руки слегка в стороны и вниз —
              не поднимай до уровня плеч.
            </Text>
            <Pressable style={styles.shutterButton} onPress={handleShutterPress} />
          </View>
        </CameraView>
      </View>
    );
  }

  if (step === 'review' && measurements) {
    return (
      <View style={styles.container}>
        <Pressable onPress={() => setStep('input')} hitSlop={8} style={styles.backLink}>
          <Text style={styles.link}>← Переснять фото</Text>
        </Pressable>
        <Text style={styles.title}>Вот что получилось</Text>
        <Text style={styles.subtitle}>Приблизительно, по фото — можно уточнить позже вручную.</Text>
        <View style={styles.resultRow}>
          <Text style={styles.resultLabel}>Обхват груди</Text>
          <Text style={styles.resultValue}>{measurements.chestCm} см</Text>
        </View>
        <View style={styles.resultRow}>
          <Text style={styles.resultLabel}>Обхват талии</Text>
          <Text style={styles.resultValue}>{measurements.waistCm} см</Text>
        </View>
        <View style={styles.resultRow}>
          <Text style={styles.resultLabel}>Обхват бёдер</Text>
          <Text style={styles.resultValue}>{measurements.hipsCm} см</Text>
        </View>
        <Pressable style={styles.button} onPress={handleSave} disabled={saving}>
          <Text style={styles.buttonText}>
            {saving ? 'Сохраняю…' : editProfileId ? 'Сохранить изменения' : 'Сохранить'}
          </Text>
        </Pressable>
        {scanError && <Text style={styles.error}>{scanError}</Text>}
      </View>
    );
  }

  if (step === 'processing' && photoDataUri) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" />
        <Text style={styles.subtitle}>Распознаю позу на фото…</Text>
        <Pressable onPress={() => setStep('input')} hitSlop={8}>
          <Text style={styles.link}>Отмена</Text>
        </Pressable>
        <View style={styles.hiddenWebView}>
          <WebView
            originWhitelist={['*']}
            source={{ html: buildPoseHtml(photoDataUri) }}
            onMessage={handleWebViewMessage}
            javaScriptEnabled
          />
        </View>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Pressable
        onPress={() =>
          router.replace({ pathname: '/onboarding/choose-method', params: { editProfileId } })
        }
        hitSlop={8}
        style={styles.backLink}
      >
        <Text style={styles.link}>← Назад</Text>
      </Pressable>
      <Text style={styles.title}>Фото-скан</Text>
      <Text style={styles.subtitle}>
        Встань в полный рост анфас, в облегающей однотонной одежде — мешковатая одежда искажает
        измерения. Рост и вес пока вводим вручную — их нельзя определить по одному фото без
        специальных датчиков.
      </Text>

      <View style={styles.fieldGroup}>
        <Text style={styles.label}>Рост (см)</Text>
        <TextInput
          style={styles.input}
          keyboardType="numeric"
          value={heightCm}
          onChangeText={setHeightCm}
          placeholder="100–250"
        />
      </View>
      <View style={styles.fieldGroup}>
        <Text style={styles.label}>Вес (кг)</Text>
        <TextInput
          style={styles.input}
          keyboardType="numeric"
          value={weightKg}
          onChangeText={setWeightKg}
          placeholder="30–300"
        />
      </View>

      {(fieldError || scanError) && <Text style={styles.error}>{fieldError ?? scanError}</Text>}

      <Pressable style={styles.button} onPress={openCamera}>
        <Text style={styles.buttonText}>📷 Сделать фото</Text>
      </Pressable>
      <Pressable style={styles.buttonSecondary} onPress={pickFromLibrary}>
        <Text style={styles.buttonSecondaryText}>Выбрать из галереи</Text>
      </Pressable>
      <Pressable
        onPress={() =>
          router.replace({ pathname: '/onboarding/manual-input', params: { editProfileId } })
        }
      >
        <Text style={styles.link}>Ввести параметры вручную вместо этого</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    gap: 12,
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'stretch',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 8,
  },
  fieldGroup: {
    gap: 4,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
  },
  error: {
    color: '#c0392b',
    fontSize: 13,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#111',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonSecondary: {
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ccc',
  },
  buttonSecondaryText: {
    fontSize: 15,
    fontWeight: '600',
  },
  link: {
    textAlign: 'center',
    color: '#666',
    marginTop: 8,
    textDecorationLine: 'underline',
  },
  backLink: {
    alignSelf: 'flex-start',
  },
  hiddenWebView: {
    position: 'absolute',
    width: 300,
    height: 300,
    opacity: 0,
  },
  resultRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingVertical: 10,
  },
  resultLabel: {
    fontSize: 15,
    color: '#444',
  },
  resultValue: {
    fontSize: 15,
    fontWeight: '700',
  },
  cameraContainer: {
    flex: 1,
    backgroundColor: '#000',
  },
  cameraOverlayUi: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 24,
    gap: 16,
    alignItems: 'center',
  },
  cameraHint: {
    color: '#fff',
    fontSize: 13,
    textAlign: 'center',
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 8,
    borderRadius: 8,
  },
  cameraTopBar: {
    position: 'absolute',
    top: 48,
    left: 24,
    right: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cameraTopBarRight: {
    flexDirection: 'row',
    gap: 12,
  },
  cameraTopButton: {
    backgroundColor: 'rgba(0,0,0,0.5)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  cameraTopButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  cameraCancel: {
    color: '#fff',
    fontSize: 15,
  },
  countdownOverlay: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  countdownText: {
    color: '#fff',
    fontSize: 96,
    fontWeight: '800',
    textShadowColor: 'rgba(0,0,0,0.6)',
    textShadowRadius: 12,
  },
  shutterButton: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: '#fff',
    borderWidth: 4,
    borderColor: 'rgba(255,255,255,0.4)',
  },
});
