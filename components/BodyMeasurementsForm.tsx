import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';

export type FieldKey = 'heightCm' | 'weightKg' | 'chestCm' | 'waistCm' | 'hipsCm';

type FieldConfig = {
  key: FieldKey;
  label: string;
  min: number;
  max: number;
};

export const MEASUREMENT_FIELDS: FieldConfig[] = [
  { key: 'heightCm', label: 'Рост (см)', min: 100, max: 250 },
  { key: 'weightKg', label: 'Вес (кг)', min: 30, max: 300 },
  { key: 'chestCm', label: 'Обхват груди (см)', min: 50, max: 200 },
  { key: 'waistCm', label: 'Обхват талии (см)', min: 40, max: 200 },
  { key: 'hipsCm', label: 'Обхват бёдер (см)', min: 50, max: 200 },
];

type Props = {
  initialValues?: Partial<Record<FieldKey, string>>;
  submitLabel: string;
  submitting: boolean;
  submitError: string | null;
  onSubmit: (values: Record<FieldKey, number>) => void;
};

export function BodyMeasurementsForm({ initialValues, submitLabel, submitting, submitError, onSubmit }: Props) {
  const [values, setValues] = useState<Record<FieldKey, string>>({
    heightCm: initialValues?.heightCm ?? '',
    weightKg: initialValues?.weightKg ?? '',
    chestCm: initialValues?.chestCm ?? '',
    waistCm: initialValues?.waistCm ?? '',
    hipsCm: initialValues?.hipsCm ?? '',
  });
  const [errors, setErrors] = useState<Partial<Record<FieldKey, string>>>({});

  function validate(): Record<FieldKey, number> | null {
    const nextErrors: Partial<Record<FieldKey, string>> = {};
    const parsed: Partial<Record<FieldKey, number>> = {};

    for (const field of MEASUREMENT_FIELDS) {
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

  function handleSubmit() {
    const parsed = validate();
    if (parsed) onSubmit(parsed);
  }

  return (
    <View style={styles.form}>
      {MEASUREMENT_FIELDS.map((field) => (
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
        <Text style={styles.buttonText}>{submitting ? 'Сохраняю…' : submitLabel}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  form: {
    gap: 12,
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
