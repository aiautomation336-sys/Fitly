import { router } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';

export default function PhotoScan() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Скоро здесь будет фото-скан</Text>
      <Text style={styles.subtitle}>
        Расчёт параметров по фото добавим на следующем этапе разработки. Пока можно ввести
        параметры вручную.
      </Text>
      <Pressable style={styles.button} onPress={() => router.replace('/onboarding/manual-input')}>
        <Text style={styles.buttonText}>Ввести вручную</Text>
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
    alignItems: 'center',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#111',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    marginTop: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '600',
  },
});
