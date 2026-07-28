import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { ensureSession } from '@/lib/auth';
import { supabase } from '@/lib/supabase';

type FieldKey = 'heightCm' | 'weightKg' | 'chestCm' | 'waistCm' | 'hipsCm';

type FieldConfig = {
  key: FieldKey;
  label: string;
  min: number;
  max: number;
};

const FIELDS: FieldConfig[] = [
  { key: 'heightCm', label: 'Рост (см)', min: 100, max: 250 },
  { key: 'weightKg', label: 'Вес (кг)', min: 30, max: 300 },
  { key: 'chestCm', label: 'Обхват груди (см)', min: 50, max: 200 },
  { key: 'waistCm', label: 'Обхват талии (см)', min: 40, max: 200 },
  { key: 'hipsCm', label: 'Обхват бёдер (см)', min: 50, max: 200 },
];

export default function ManualInput() {
  const [values, setValues] = useState<Record<FieldKey, string>>({
    heightCm: '',
    weightKg: '',
    chestCm: '',
    waistCm: '',
    hipsCm: '',
  });
  const [errors, setErrors] = useState<Partial<Record<FieldKey, string>>>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [saved, setSaved] = useState(false);

  function validate(): Record<FieldKey, number> | null {
    const nextErrors: Partial<Record<FieldKey, string>> = {};
    const parsed: Partial<Record<FieldKey, number>> = {};

    for (const field of FIELDS) {
      const raw = values[field.key].trim().replace(',', '.');
      const num = Number(raw);
      if (raw === '' || Number.isNaN(num)) {
        nextErrors[field.key] = 'Введи число';
      } else if (num < field.min || num > field.max) {
        nextErrors[field.key] = `Ожидается от ${field.min} до ${field.max}`;
      } else {
        parsed[field.key] = num;
      }
    }

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return null;
    return parsed as Record<FieldKey, number>;
  }

  async function handleSubmit() {
    const parsed = validate();
    if (!parsed) return;

    setSubmitting(true);
    setSubmitError(null);
    try {
      const session = await ensureSession();
      const { error } = await supabase.from('body_profiles').insert({
        user_id: session.user.id,
        height_cm: parsed.heightCm,
        weight_kg: parsed.weightKg,
        chest_cm: parsed.chestCm,
        waist_cm: parsed.waistCm,
        hips_cm: parsed.hipsCm,
        input_method: 'manual',
      });
      if (error) throw error;
      setSaved(true);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : String(err));
    } finally {
      setSubmitting(false);
    }
  }

  if (saved) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Сохранено ✅</Text>
        <Text style={styles.subtitle}>Твой Body ID создан.</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Твои параметры</Text>

      {FIELDS.map((field) => (
        <View key={field.key} style={styles.fieldGroup}>
          <Text style={styles.label}>{field.label}</Text>
          <TextInput
            style={styles.input}
            keyboardType="numeric"
            value={values[field.key]}
            onChangeText={(text) => setValues((prev) => ({ ...prev, [field.key]: text }))}
            placeholder={`${field.min}–${field.max}`}
          />
          {errors[field.key] && <Text style={styles.error}>{errors[field.key]}</Text>}
        </View>
      ))}

      {submitError && <Text style={styles.error}>{submitError}</Text>}

      <Pressable style={styles.button} onPress={handleSubmit} disabled={submitting}>
        <Text style={styles.buttonText}>{submitting ? 'Сохраняю…' : 'Сохранить'}</Text>
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
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
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
    fontSize: 12,
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
});
