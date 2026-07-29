import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text } from 'react-native';
import { BodyMeasurementsForm } from '@/components/BodyMeasurementsForm';
import { ensureSession } from '@/lib/auth';
import { createProfile, getProfileById, updateProfile } from '@/lib/bodyProfiles';

export default function ManualInput() {
  const { editProfileId } = useLocalSearchParams<{ editProfileId?: string }>();
  const [loadingInitial, setLoadingInitial] = useState(!!editProfileId);
  const [initialValues, setInitialValues] = useState<
    Partial<Record<'heightCm' | 'weightKg' | 'chestCm' | 'waistCm' | 'hipsCm', string>> | undefined
  >(undefined);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!editProfileId) return;
    getProfileById(editProfileId)
      .then((profile) => {
        if (!profile) return;
        setInitialValues({
          heightCm: String(profile.height_cm),
          weightKg: String(profile.weight_kg),
          chestCm: String(profile.chest_cm),
          waistCm: String(profile.waist_cm),
          hipsCm: String(profile.hips_cm),
        });
      })
      .catch((err) => setSubmitError(err instanceof Error ? err.message : String(err)))
      .finally(() => setLoadingInitial(false));
  }, [editProfileId]);

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
      if (editProfileId) {
        await updateProfile(editProfileId, {
          height_cm: values.heightCm,
          weight_kg: values.weightKg,
          chest_cm: values.chestCm,
          waist_cm: values.waistCm,
          hips_cm: values.hipsCm,
          input_method: 'manual',
        });
        router.replace('/profile');
        return;
      }

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
      <Pressable
        onPress={() => router.replace(editProfileId ? '/profile' : '/onboarding/choose-method')}
        hitSlop={8}
        style={styles.backLink}
      >
        <Text style={styles.link}>← Назад</Text>
      </Pressable>
      <Text style={styles.title}>Твои параметры</Text>
      {loadingInitial ? (
        <ActivityIndicator size="large" />
      ) : (
        <BodyMeasurementsForm
          initialValues={initialValues}
          submitLabel={editProfileId ? 'Сохранить изменения' : 'Сохранить'}
          submitting={submitting}
          submitError={submitError}
          onSubmit={handleSubmit}
        />
      )}
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
  link: {
    textAlign: 'center',
    color: '#666',
    textDecorationLine: 'underline',
  },
  backLink: {
    alignSelf: 'flex-start',
  },
});
