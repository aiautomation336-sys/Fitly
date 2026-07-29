import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { BodySilhouette } from '@/components/BodySilhouette';
import { BrandSizeFeedbackRow } from '@/components/BrandSizeFeedbackRow';
import { ensureSession } from '@/lib/auth';
import { getLatestProfile } from '@/lib/bodyProfiles';
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
  const [isAnonymous, setIsAnonymous] = useState(false);

  useEffect(() => {
    load();
  }, []);

  async function load() {
    setLoading(true);
    setLoadError(null);
    try {
      const session = await ensureSession();
      setIsAnonymous(session.user.is_anonymous ?? false);
      const latest = await getLatestProfile(session.user.id);
      setProfile(latest);
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
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
          <BrandSizeFeedbackRow
            key={item.brand}
            brand={item.brand}
            size={item.size}
            bodyProfileId={profile.id}
          />
        ))}
      </View>

      <Pressable
        style={styles.button}
        onPress={() =>
          router.push({ pathname: '/onboarding/choose-method', params: { editProfileId: profile.id } })
        }
      >
        <Text style={styles.buttonText}>Редактировать</Text>
      </Pressable>

      {isAnonymous && (
        <Pressable onPress={() => router.push('/account')}>
          <Text style={styles.link}>Привязать email, чтобы не потерять данные при смене телефона</Text>
        </Pressable>
      )}
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
  error: {
    color: '#c0392b',
    fontSize: 14,
    textAlign: 'center',
  },
  link: {
    textAlign: 'center',
    color: '#666',
    fontSize: 13,
    textDecorationLine: 'underline',
    marginTop: 4,
  },
});
