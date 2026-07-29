import { router } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text } from 'react-native';
import { BodyMeasurementsForm } from '@/components/BodyMeasurementsForm';
import { ensureSession } from '@/lib/auth';
import { createProfile } from '@/lib/bodyProfiles';

export default function ManualInput() {
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(values: {
    heightCm: number;
    weightKg: number;
    chestCm: number;
    waistCm: number;
    hipsCm: number;
  }) {
    setSubmitting(true);
    setSubmitError(null);
    try {
      const session = await ensureSession();
      const profile = await createProfile(session.user.id, {
        height_cm: values.heightCm,
        weight_kg: values.weightKg,
        chest_cm: values.chestCm,
        waist_cm: values.waistCm,
        hips_cm: values.hipsCm,
        input_method: 'manual',
      });
      router.replace({
        pathname: '/onboarding/result',
        params: {
          profileId: profile.id,
          chestCm: String(values.chestCm),
          waistCm: String(values.waistCm),
          hipsCm: String(values.hipsCm),
        },
      });
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : String(err));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Твои параметры</Text>
      <BodyMeasurementsForm
        submitLabel="Сохранить"
        submitting={submitting}
        submitError={submitError}
        onSubmit={handleSubmit}
      />
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
});
