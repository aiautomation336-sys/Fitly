import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { BodyAvatar } from '@/components/BodyAvatar';
import { BrandSizeFeedbackRow } from '@/components/BrandSizeFeedbackRow';
import { getProfileById } from '@/lib/bodyProfiles';
import { allBrandSizes } from '@/lib/brandSizeCharts';
import { sizeExplanation } from '@/lib/sizeFormula';

export default function Result() {
  const { profileId, chestCm, waistCm, hipsCm } = useLocalSearchParams<{
    profileId: string;
    chestCm: string;
    waistCm: string;
    hipsCm: string;
  }>();

  const chest = Number(chestCm);
  const waist = Number(waistCm);
  const hips = Number(hipsCm);
  const [avatarPath, setAvatarPath] = useState<string | null>(null);

  useEffect(() => {
    getProfileById(profileId)
      .then((profile) => setAvatarPath(profile?.avatar_path ?? null))
      .catch(() => setAvatarPath(null));
  }, [profileId]);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Твой Body ID готов ✅</Text>

      <BodyAvatar avatarPath={avatarPath} />

      <Text style={styles.explanation}>{sizeExplanation(chest)}</Text>

      <View style={styles.paramsList}>
        <View style={styles.paramRow}>
          <Text style={styles.paramLabel}>Грудь</Text>
          <Text style={styles.paramValue}>{chest} см</Text>
        </View>
        <View style={styles.paramRow}>
          <Text style={styles.paramLabel}>Талия</Text>
          <Text style={styles.paramValue}>{waist} см</Text>
        </View>
        <View style={styles.paramRow}>
          <Text style={styles.paramLabel}>Бёдра</Text>
          <Text style={styles.paramValue}>{hips} см</Text>
        </View>
      </View>

      <Text style={styles.sectionTitle}>Размер по брендам</Text>
      <Text style={styles.hint}>Отметь 👍/👎, если уже носишь эту марку — поможет уточнить формулу</Text>
      <View style={styles.brandList}>
        {allBrandSizes(chest).map((item) => (
          <BrandSizeFeedbackRow
            key={item.brand}
            brand={item.brand}
            size={item.size}
            bodyProfileId={profileId}
          />
        ))}
      </View>

      <Pressable style={styles.button} onPress={() => router.replace('/profile')}>
        <Text style={styles.buttonText}>Готово</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    gap: 16,
    alignItems: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  explanation: {
    fontSize: 16,
    textAlign: 'center',
    color: '#333',
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
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    alignSelf: 'flex-start',
    marginTop: 8,
  },
  hint: {
    fontSize: 12,
    color: '#888',
    alignSelf: 'flex-start',
    marginTop: -12,
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
});
