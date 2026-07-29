import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { confirmEmailLink, ensureSession, requestEmailLink } from '@/lib/auth';

type Step = 'loading' | 'linked' | 'enterEmail' | 'enterCode';

export default function Account() {
  const [step, setStep] = useState<Step>('loading');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [linkedEmail, setLinkedEmail] = useState<string | null>(null);

  useEffect(() => {
    ensureSession()
      .then((session) => {
        if (!session.user.is_anonymous && session.user.email) {
          setLinkedEmail(session.user.email);
          setStep('linked');
        } else {
          setStep('enterEmail');
        }
      })
      .catch((err) => setError(err instanceof Error ? err.message : String(err)));
  }, []);

  async function handleSendCode() {
    if (!email.includes('@')) {
      setError('Введи корректный email');
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await requestEmailLink(email.trim());
      setStep('enterCode');
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setSubmitting(false);
    }
  }

  async function handleConfirmCode() {
    if (code.trim().length < 4) {
      setError('Введи код из письма');
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await confirmEmailLink(email.trim(), code.trim());
      setLinkedEmail(email.trim());
      setStep('linked');
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setSubmitting(false);
    }
  }

  if (step === 'loading') {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (step === 'linked') {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Аккаунт привязан ✅</Text>
        <Text style={styles.subtitle}>{linkedEmail}</Text>
        <Text style={styles.hint}>
          Теперь профиль не потеряется при смене телефона — просто войди с этим email.
        </Text>
        <Pressable style={styles.button} onPress={() => router.replace('/profile')}>
          <Text style={styles.buttonText}>Готово</Text>
        </Pressable>
      </View>
    );
  }

  if (step === 'enterCode') {
    return (
      <View style={styles.container}>
        <Pressable onPress={() => setStep('enterEmail')} hitSlop={8} style={styles.backLink}>
          <Text style={styles.link}>← Изменить email</Text>
        </Pressable>
        <Text style={styles.title}>Введи код из письма</Text>
        <Text style={styles.subtitle}>Отправили на {email}</Text>
        <TextInput
          style={styles.input}
          keyboardType="number-pad"
          value={code}
          onChangeText={setCode}
          placeholder="123456"
        />
        {error && <Text style={styles.error}>{error}</Text>}
        <Pressable style={styles.button} onPress={handleConfirmCode} disabled={submitting}>
          <Text style={styles.buttonText}>{submitting ? 'Проверяю…' : 'Подтвердить'}</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Pressable onPress={() => router.back()} hitSlop={8} style={styles.backLink}>
        <Text style={styles.link}>← Назад</Text>
      </Pressable>
      <Text style={styles.title}>Привязать email</Text>
      <Text style={styles.subtitle}>
        Чтобы твой Body ID не потерялся при смене телефона — привяжи email, данные сохранятся.
      </Text>
      <TextInput
        style={styles.input}
        keyboardType="email-address"
        autoCapitalize="none"
        value={email}
        onChangeText={setEmail}
        placeholder="you@example.com"
      />
      {error && <Text style={styles.error}>{error}</Text>}
      <Pressable style={styles.button} onPress={handleSendCode} disabled={submitting}>
        <Text style={styles.buttonText}>{submitting ? 'Отправляю…' : 'Отправить код'}</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
    gap: 12,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
  },
  hint: {
    fontSize: 13,
    color: '#888',
    textAlign: 'center',
    marginTop: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 16,
    textAlign: 'center',
  },
  error: {
    color: '#c0392b',
    fontSize: 13,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#111',
    paddingVertical: 14,
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
    textDecorationLine: 'underline',
  },
  backLink: {
    alignSelf: 'flex-start',
  },
});
