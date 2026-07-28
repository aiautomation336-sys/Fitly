import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { ensureSession } from '@/lib/auth';

export default function Home() {
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    ensureSession()
      .then(() => router.replace('/onboarding/choose-method'))
      .catch((err) => setError(err instanceof Error ? err.message : String(err)));
  }, []);

  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Не удалось войти</Text>
        <Text style={styles.subtitle}>{error}</Text>
        <Text style={styles.hint}>
          Проверь в Supabase: Authentication → Sign In / Providers → Anonymous Sign-Ins включены.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    padding: 24,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  hint: {
    fontSize: 13,
    color: '#999',
    textAlign: 'center',
    marginTop: 8,
  },
});
