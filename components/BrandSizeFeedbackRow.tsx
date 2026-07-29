import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { ensureSession } from '@/lib/auth';
import { submitFeedback } from '@/lib/fitFeedback';

type Props = {
  brand: string;
  size: string;
  bodyProfileId: string;
};

type Status = 'idle' | 'saving' | 'saved' | 'error';

export function BrandSizeFeedbackRow({ brand, size, bodyProfileId }: Props) {
  const [status, setStatus] = useState<Status>('idle');
  const [choice, setChoice] = useState<boolean | null>(null);

  async function handleFeedback(fits: boolean) {
    setStatus('saving');
    try {
      const session = await ensureSession();
      await submitFeedback({
        userId: session.user.id,
        bodyProfileId,
        brand,
        recommendedSize: size,
        fits,
      });
      setChoice(fits);
      setStatus('saved');
    } catch {
      setStatus('error');
    }
  }

  return (
    <View style={styles.row}>
      <View style={styles.info}>
        <Text style={styles.brandName}>{brand}</Text>
        <Text style={styles.brandSize}>{size}</Text>
      </View>
      <View style={styles.feedback}>
        <Pressable onPress={() => handleFeedback(true)} disabled={status === 'saving'} hitSlop={8}>
          <Text style={[styles.icon, choice === true && styles.iconActive]}>👍</Text>
        </Pressable>
        <Pressable onPress={() => handleFeedback(false)} disabled={status === 'saving'} hitSlop={8}>
          <Text style={[styles.icon, choice === false && styles.iconActive]}>👎</Text>
        </Pressable>
      </View>
      {status === 'error' && <Text style={styles.error}>Не сохранилось, попробуй ещё раз</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingVertical: 10,
    width: '100%',
  },
  info: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'baseline',
  },
  brandName: {
    fontSize: 15,
    color: '#444',
  },
  brandSize: {
    fontSize: 15,
    fontWeight: '700',
  },
  feedback: {
    flexDirection: 'row',
    gap: 12,
  },
  icon: {
    fontSize: 20,
    opacity: 0.35,
  },
  iconActive: {
    opacity: 1,
  },
  error: {
    color: '#c0392b',
    fontSize: 11,
    position: 'absolute',
    bottom: -2,
    right: 0,
  },
});
