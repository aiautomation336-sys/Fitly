import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import { useState } from 'react';
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
import { ensureSession } from '@/lib/auth';
import { BodyMeasurements, measurementsFromLandmarks, NormalizedLandmark } from '@/lib/poseMeasurement';
import { buildPoseHtml } from '@/lib/poseWebViewHtml';
import { supabase } from '@/lib/supabase';

type Step = 'input' | 'processing' | 'review' | 'saved';

type PoseResultMessage =
  | { type: 'result'; landmarks: NormalizedLandmark[]; imageWidth: number; imageHeight: number }
  | { type: 'error'; message: string };

function validateRange(raw: string, min: number, max: number): number | null {
  const num = Number(raw.trim().replace(',', '.'));
  if (raw.trim() === '' || Number.isNaN(num) || num < min || num > max) return null;
  return num;
}

export default function PhotoScan() {
  const [step, setStep] = useState<Step>('input');
  const [heightCm, setHeightCm] = useState('');
  const [weightKg, setWeightKg] = useState('');
  const [fieldError, setFieldError] = useState<string | null>(null);
  const [photoDataUri, setPhotoDataUri] = useState<string | null>(null);
  const [measurements, setMeasurements] = useState<BodyMeasurements | null>(null);
  const [scanError, setScanError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  async function pickPhoto(source: 'camera' | 'library') {
    setFieldError(null);
    const height = validateRange(heightCm, 100, 250);
    const weight = validateRange(weightKg, 30, 300);
    if (height === null) return setFieldError('Введи рост от 100 до 250 см');
    if (weight === null) return setFieldError('Введи вес от 30 до 300 кг');

    const permission =
      source === 'camera'
        ? await ImagePicker.requestCameraPermissionsAsync()
        : await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      setFieldError('Нужен доступ к камере/галерее, чтобы сделать фото-скан.');
      return;
    }

    const result =
      source === 'camera'
        ? await ImagePicker.launchCameraAsync({ base64: true, quality: 0.7 })
        : await ImagePicker.launchImageLibraryAsync({ base64: true, quality: 0.7 });

    if (result.canceled || !result.assets[0]?.base64) return;

    const mimeType = result.assets[0].mimeType ?? 'image/jpeg';
    const dataUri = `data:${mimeType};base64,${result.assets[0].base64}`;
    setPhotoDataUri(dataUri);
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
      setScanError(err instanceof Error ? err.message : String(err));
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
      const { error } = await supabase.from('body_profiles').insert({
        user_id: session.user.id,
        height_cm: height,
        weight_kg: weight,
        chest_cm: measurements.chestCm,
        waist_cm: measurements.waistCm,
        hips_cm: measurements.hipsCm,
        input_method: 'photo',
      });
      if (error) throw error;
      setStep('saved');
    } catch (err) {
      setScanError(err instanceof Error ? err.message : String(err));
    } finally {
      setSaving(false);
    }
  }

  if (step === 'saved') {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Сохранено ✅</Text>
        <Text style={styles.subtitle}>Твой Body ID создан по фото.</Text>
      </View>
    );
  }

  if (step === 'review' && measurements) {
    return (
      <View style={styles.container}>
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
          <Text style={styles.buttonText}>{saving ? 'Сохраняю…' : 'Сохранить'}</Text>
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
      <Text style={styles.title}>Фото-скан</Text>
      <Text style={styles.subtitle}>
        Встань в полный рост анфас. Рост и вес пока вводим вручную — их нельзя определить по
        одному фото без специальных датчиков.
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

      <Pressable style={styles.button} onPress={() => pickPhoto('camera')}>
        <Text style={styles.buttonText}>📷 Сделать фото</Text>
      </Pressable>
      <Pressable style={styles.buttonSecondary} onPress={() => pickPhoto('library')}>
        <Text style={styles.buttonSecondaryText}>Выбрать из галереи</Text>
      </Pressable>
      <Pressable onPress={() => router.replace('/onboarding/manual-input')}>
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
});
