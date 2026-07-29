import { router, useLocalSearchParams } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

export default function ChooseMethod() {
  const { editProfileId } = useLocalSearchParams<{ editProfileId?: string }>();

  return (
    <View style={styles.container}>
      {editProfileId && (
        <Pressable onPress={() => router.replace('/profile')} hitSlop={8} style={styles.backLink}>
          <Text style={styles.link}>← Назад</Text>
        </Pressable>
      )}
      <Text style={styles.title}>Как введём твои параметры?</Text>

      <Pressable
        style={styles.card}
        onPress={() => router.push({ pathname: '/onboarding/photo-scan', params: { editProfileId } })}
      >
        <Text style={styles.cardEmoji}>📷</Text>
        <Text style={styles.cardTitle}>Сфотографироваться</Text>
        <Text style={styles.cardSubtitle}>Автоматический расчёт по фото</Text>
      </Pressable>

      <Pressable
        style={styles.card}
        onPress={() => router.push({ pathname: '/onboarding/manual-input', params: { editProfileId } })}
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
  link: {
    textAlign: 'center',
    color: '#666',
    textDecorationLine: 'underline',
  },
  backLink: {
    position: 'absolute',
    top: 24,
    left: 24,
  },
});
