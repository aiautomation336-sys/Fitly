import { router, useLocalSearchParams } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { BodySilhouette } from '@/components/BodySilhouette';
import { allBrandSizes } from '@/lib/brandSizeCharts';
import { sizeExplanation } from '@/lib/sizeFormula';

export default function Result() {
  const { chestCm, waistCm, hipsCm } = useLocalSearchParams<{
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
      <View style={styles.brandList}>
        {allBrandSizes(chest).map((item) => (
          <View key={item.brand} style={styles.brandRow}>
            <Text style={styles.brandName}>{item.brand}</Text>
            <Text style={styles.brandSize}>{item.size}</Text>
          </View>
        ))}
      </View>

      <Pressable style={styles.button} onPress={() => router.replace('/profile/index')}>
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
});
