import { useEffect, useState } from 'react';
import { ActivityIndicator, Image, StyleSheet, View } from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';
import { getAvatarSignedUrl } from '@/lib/avatarStorage';

type Props = {
  avatarPath: string | null;
};

const SIZE = 200;

function GenericAvatarPlaceholder() {
  return (
    <View style={[styles.frame, styles.placeholderBg]}>
      <Svg width={SIZE * 0.6} height={SIZE * 0.6} viewBox="0 0 100 100">
        <Circle cx={50} cy={32} r={20} fill="#9aa5b1" />
        <Path
          d="M20 95 C20 65 35 55 50 55 C65 55 80 65 80 95 Z"
          fill="#9aa5b1"
        />
      </Svg>
    </View>
  );
}

export function BodyAvatar({ avatarPath }: Props) {
  const [signedUrl, setSignedUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(!!avatarPath);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (!avatarPath) {
      setSignedUrl(null);
      return;
    }
    setLoading(true);
    setFailed(false);
    getAvatarSignedUrl(avatarPath)
      .then(setSignedUrl)
      .catch(() => setFailed(true))
      .finally(() => setLoading(false));
  }, [avatarPath]);

  if (!avatarPath || failed) {
    return <GenericAvatarPlaceholder />;
  }

  if (loading || !signedUrl) {
    return (
      <View style={[styles.frame, styles.placeholderBg]}>
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <View style={styles.frame}>
      <Image source={{ uri: signedUrl }} style={styles.image} resizeMode="cover" />
    </View>
  );
}

const styles = StyleSheet.create({
  frame: {
    width: SIZE,
    height: SIZE,
    borderRadius: 16,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderBg: {
    backgroundColor: '#eceff1',
  },
  image: {
    width: '100%',
    height: '100%',
  },
});
