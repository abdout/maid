import React from 'react';
import Svg, { Circle, Path } from 'react-native-svg';
import type { StyleProp, ViewStyle } from 'react-native';

interface IconProps {
  size?: number;
  color?: string;
  strokeWidth?: number;
  filled?: boolean;
  style?: StyleProp<ViewStyle>;
}

export default function SearchIcon({
  size = 24,
  color = '#222222',
  strokeWidth = 1.5,
  style,
}: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={style}>
      <Circle
        cx="11"
        cy="11"
        r="7"
        stroke={color}
        strokeWidth={strokeWidth}
      />
      <Path
        d="M21 21L16.5 16.5"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />
    </Svg>
  );
}
