import Svg, { Circle, Line, Polygon } from 'react-native-svg';
import { StyleSheet } from 'react-native';

// Силуэт-подсказка поверх камеры: A-поза (руки слегка в стороны и вниз, не горизонтально) —
// горизонтальный T-pose задирает футболку у плеч и искажает измерение обхвата груди.
export function PoseGuideOverlay() {
  return (
    <Svg
      style={StyleSheet.absoluteFill}
      viewBox="0 0 300 600"
      pointerEvents="none"
    >
      <Circle cx={150} cy={45} r={28} stroke="#fff" strokeWidth={2} fill="none" opacity={0.6} />

      <Polygon
        points="105,90 195,90 178,300 190,340 110,340 122,300"
        stroke="#fff"
        strokeWidth={2}
        fill="none"
        opacity={0.6}
      />

      <Line x1={105} y1={95} x2={55} y2={230} stroke="#fff" strokeWidth={2} opacity={0.6} />
      <Line x1={195} y1={95} x2={245} y2={230} stroke="#fff" strokeWidth={2} opacity={0.6} />

      <Line x1={120} y1={340} x2={128} y2={560} stroke="#fff" strokeWidth={2} opacity={0.6} />
      <Line x1={180} y1={340} x2={172} y2={560} stroke="#fff" strokeWidth={2} opacity={0.6} />
    </Svg>
  );
}
