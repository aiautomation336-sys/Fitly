import Svg, { Circle, Polygon } from 'react-native-svg';
import { StyleSheet, Text, View } from 'react-native';
import { silhouetteHalfWidths } from '@/lib/silhouetteGeometry';

type Props = {
  chestCm: number;
  waistCm: number;
  hipsCm: number;
};

const VIEW_WIDTH = 200;
const VIEW_HEIGHT = 220;
const MAX_DRAW_WIDTH = 140;
const CENTER_X = VIEW_WIDTH / 2;
const CHEST_Y = 20;
const WAIST_Y = 110;
const HIPS_Y = 200;

export function BodySilhouette({ chestCm, waistCm, hipsCm }: Props) {
  const { chestHalf, waistHalf, hipsHalf } = silhouetteHalfWidths(
    chestCm,
    waistCm,
    hipsCm,
    MAX_DRAW_WIDTH
  );

  const points = [
    `${CENTER_X - chestHalf},${CHEST_Y}`,
    `${CENTER_X + chestHalf},${CHEST_Y}`,
    `${CENTER_X + waistHalf},${WAIST_Y}`,
    `${CENTER_X + hipsHalf},${HIPS_Y}`,
    `${CENTER_X - hipsHalf},${HIPS_Y}`,
    `${CENTER_X - waistHalf},${WAIST_Y}`,
  ].join(' ');

  return (
    <View style={styles.row}>
      <Svg width={VIEW_WIDTH} height={VIEW_HEIGHT}>
        <Circle cx={CENTER_X} cy={4} r={14} fill="#ddd" />
        <Polygon points={points} fill="#8ab4f8" stroke="#3b6fd4" strokeWidth={2} />
      </Svg>
      <View style={styles.labels}>
        <Text style={styles.label}>Грудь: {chestCm} см</Text>
        <Text style={styles.label}>Талия: {waistCm} см</Text>
        <Text style={styles.label}>Бёдра: {hipsCm} см</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  labels: {
    gap: 14,
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
  },
});
