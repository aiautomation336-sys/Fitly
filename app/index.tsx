import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import { ensureSession } from '@/lib/auth';
import { getLatestProfile } from '@/lib/bodyProfiles';
import { supabase } from '@/lib/supabase';

type Screen = 'loading' | 'welcomeChoice' | 'error';

export default function Home() {
  const [screen, setScreen] = useState<Screen>('loading');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth
      .getSession()
      .then(({ data }) => {
        if (data.session) {
          proceedWithSession(data.session.user.id);
        } else {
          setScreen('welcomeChoice');
        }
      })
      .catch((err) => showError(err));
  }, []);

  function showError(err: unknown) {
    setError(err instanceof Error ? err.message : String(err));
    setScreen('error');
  }

  async function proceedWithSession(userId: string) {
    try {
      const profile = await getLatestProfile(userId);
      router.replace(profile ? '/profile' : '/onboarding/choose-method');
    } catch (err) {
      showError(err);
    }
  }

  async function handleContinueAsGuest() {
    setScreen('loading');
    try {
      const session = await ensureSession();
      await proceedWithSession(session.user.id);
    } catch (err) {
      showError(err);
    }
  }

  if (screen === 'error') {
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

  if (screen === 'welcomeChoice') {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Fitly</Text>
        <Pressable style={styles.button} onPress={handleContinueAsGuest}>
          <Text style={styles.buttonText}>Продолжить</Text>
        </Pressable>
        <Pressable onPress={() => router.push('/login')}>
          <Text style={styles.link}>У меня уже есть аккаунт — войти по email</Text>
        </Pressable>
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
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 16,
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
  button: {
    backgroundColor: '#111',
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  link: {
    textAlign: 'center',
    color: '#666',
    marginTop: 16,
    textDecorationLine: 'underline',
  },
});
