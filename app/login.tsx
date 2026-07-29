import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { confirmLogin, requestLoginCode } from '@/lib/auth';
import { errorMessage } from '@/lib/errorMessage';

type Step = 'enterEmail' | 'enterCode';

export default function Login() {
  const [step, setStep] = useState<Step>('enterEmail');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSendCode() {
    if (!email.includes('@')) {
      setError('Введи корректный email');
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      await requestLoginCode(email.trim());
      setStep('enterCode');
    } catch (err) {
      setError(errorMessage(err));
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
      await confirmLogin(email.trim(), code.trim());
      router.replace('/');
    } catch (err) {
      setError(errorMessage(err));
    } finally {
      setSubmitting(false);
    }
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
          <Text style={styles.buttonText}>{submitting ? 'Проверяю…' : 'Войти'}</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Pressable onPress={() => router.back()} hitSlop={8} style={styles.backLink}>
        <Text style={styles.link}>← Назад</Text>
      </Pressable>
      <Text style={styles.title}>Войти по email</Text>
      <Text style={styles.subtitle}>Если раньше привязывал email — введи его, вернём твой Body ID.</Text>
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
