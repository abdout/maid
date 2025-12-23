import React from 'react';
import Svg, { Path, Circle } from 'react-native-svg';
import type { StyleProp, ViewStyle } from 'react-native';

interface IconProps {
  size?: number;
  color?: string;
  strokeWidth?: number;
  style?: StyleProp<ViewStyle>;
}

export default function FilterIcon({
  size = 24,
  color = '#222222',
  strokeWidth = 1.5,
  style,
}: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={style}>
      <Path
        d="M4 6H20"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />
      <Path
        d="M4 12H20"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />
      <Path
        d="M4 18H20"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />
      <Circle cx="8" cy="6" r="2" fill={color} />
      <Circle cx="16" cy="12" r="2" fill={color} />
      <Circle cx="10" cy="18" r="2" fill={color} />
    </Svg>
  );
}
