import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { BodySilhouette } from '@/components/BodySilhouette';
import { BodyMeasurementsForm } from '@/components/BodyMeasurementsForm';
import { ensureSession } from '@/lib/auth';
import { getLatestProfile, updateProfile } from '@/lib/bodyProfiles';
import { allBrandSizes } from '@/lib/brandSizeCharts';
import { sizeExplanation } from '@/lib/sizeFormula';
import { BodyProfileRow } from '@/types/BodyProfile';

const INPUT_METHOD_LABEL: Record<BodyProfileRow['input_method'], string> = {
  manual: 'вручную',
  photo: 'по фото',
};

export default function Profile() {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<BodyProfileRow | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    setLoadError(null);
    try {
      const session = await ensureSession();
      const latest = await getLatestProfile(session.user.id);
      setProfile(latest);
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  }

  async function handleSave(values: {
    heightCm: number;
    weightKg: number;
    chestCm: number;
    waistCm: number;
    hipsCm: number;
  }) {
    if (!profile) return;
    setSaving(true);
    setSaveError(null);
    try {
      await updateProfile(profile.id, {
        height_cm: values.heightCm,
        weight_kg: values.weightKg,
        chest_cm: values.chestCm,
        waist_cm: values.waistCm,
        hips_cm: values.hipsCm,
        input_method: profile.input_method,
      });
      await load();
      setEditing(false);
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : String(err));
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (loadError) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Не удалось загрузить профиль</Text>
        <Text style={styles.error}>{loadError}</Text>
      </View>
    );
  }

  if (!profile) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Профиль ещё не создан</Text>
        <Pressable style={styles.button} onPress={() => router.replace('/onboarding/choose-method')}>
          <Text style={styles.buttonText}>Создать Body ID</Text>
        </Pressable>
      </View>
    );
  }

  if (editing) {
    return (
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Редактирование</Text>
        <BodyMeasurementsForm
          initialValues={{
            heightCm: String(profile.height_cm),
            weightKg: String(profile.weight_kg),
            chestCm: String(profile.chest_cm),
            waistCm: String(profile.waist_cm),
            hipsCm: String(profile.hips_cm),
          }}
          submitLabel="Сохранить изменения"
          submitting={saving}
          submitError={saveError}
          onSubmit={handleSave}
        />
        <Pressable onPress={() => setEditing(false)}>
          <Text style={styles.link}>Отмена</Text>
        </Pressable>
      </ScrollView>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Твой Body ID</Text>
      <Text style={styles.updatedAt}>
        Обновлено {new Date(profile.updated_at).toLocaleDateString('ru-RU')} ·{' '}
        {INPUT_METHOD_LABEL[profile.input_method]}
      </Text>

      <View style={styles.paramsList}>
        <View style={styles.paramRow}>
          <Text style={styles.paramLabel}>Рост</Text>
          <Text style={styles.paramValue}>{profile.height_cm} см</Text>
        </View>
        <View style={styles.paramRow}>
          <Text style={styles.paramLabel}>Вес</Text>
          <Text style={styles.paramValue}>{profile.weight_kg} кг</Text>
        </View>
      </View>

      <Text style={styles.explanation}>{sizeExplanation(profile.chest_cm)}</Text>

      <BodySilhouette chestCm={profile.chest_cm} waistCm={profile.waist_cm} hipsCm={profile.hips_cm} />

      <Text style={styles.sectionTitle}>Размер по брендам</Text>
      <View style={styles.brandList}>
        {allBrandSizes(profile.chest_cm).map((item) => (
          <View key={item.brand} style={styles.brandRow}>
            <Text style={styles.brandName}>{item.brand}</Text>
            <Text style={styles.brandSize}>{item.size}</Text>
          </View>
        ))}
      </View>

      <Pressable style={styles.button} onPress={() => setEditing(true)}>
        <Text style={styles.buttonText}>Редактировать</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    gap: 14,
    alignItems: 'center',
    flexGrow: 1,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  updatedAt: {
    fontSize: 13,
    color: '#888',
  },
  paramsList: {
    width: '100%',
    gap: 6,
  },
  paramRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  paramLabel: {
    fontSize: 15,
    color: '#444',
  },
  paramValue: {
    fontSize: 15,
    fontWeight: '600',
  },
  explanation: {
    fontSize: 16,
    textAlign: 'center',
    color: '#333',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    alignSelf: 'flex-start',
  },
  brandList: {
    width: '100%',
    gap: 8,
  },
  brandRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingVertical: 10,
    width: '100%',
  },
  brandName: {
    fontSize: 15,
    color: '#444',
  },
  brandSize: {
    fontSize: 15,
    fontWeight: '700',
  },
  button: {
    backgroundColor: '#111',
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  link: {
    textAlign: 'center',
    color: '#666',
    marginTop: 4,
    textDecorationLine: 'underline',
  },
  error: {
    color: '#c0392b',
    fontSize: 14,
    textAlign: 'center',
  },
});
