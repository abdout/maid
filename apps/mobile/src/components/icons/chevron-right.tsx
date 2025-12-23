import React from 'react';
import Svg, { Path } from 'react-native-svg';
import type { StyleProp, ViewStyle } from 'react-native';

interface IconProps {
  size?: number;
  color?: string;
  strokeWidth?: number;
  style?: StyleProp<ViewStyle>;
}

export default function ChevronRightIcon({
  size = 24,
  color = '#222222',
  strokeWidth = 1.5,
  style,
}: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={style}>
      <Path
        d="M9 18L15 12L9 6"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}
