import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

export default function ChooseMethod() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Как введём твои параметры?</Text>

      <Pressable
        style={styles.card}
        onPress={() => router.push('/onboarding/photo-scan')}
      >
        <Text style={styles.cardEmoji}>📷</Text>
        <Text style={styles.cardTitle}>Сфотографироваться</Text>
        <Text style={styles.cardSubtitle}>Автоматический расчёт по фото</Text>
      </Pressable>

      <Pressable
        style={styles.card}
        onPress={() => router.push('/onboarding/manual-input')}
      >
        <Text style={styles.cardEmoji}>✍️</Text>
        <Text style={styles.cardTitle}>Ввести вручную</Text>
        <Text style={styles.cardSubtitle}>Рост, вес и обхваты своими руками</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
    gap: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
  },
  card: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    gap: 4,
  },
  cardEmoji: {
    fontSize: 32,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  cardSubtitle: {
    fontSize: 13,
    color: '#666',
  },
});
