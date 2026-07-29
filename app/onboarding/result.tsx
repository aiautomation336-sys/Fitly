import { router, useLocalSearchParams } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { BodySilhouette } from '@/components/BodySilhouette';
import { BrandSizeFeedbackRow } from '@/components/BrandSizeFeedbackRow';
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

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Твой Body ID готов ✅</Text>
      <Text style={styles.explanation}>{sizeExplanation(chest)}</Text>

      <BodySilhouette chestCm={chest} waistCm={waist} hipsCm={hips} />

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
