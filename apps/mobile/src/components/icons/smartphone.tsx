import React from 'react';
import Svg, { Rect, Path } from 'react-native-svg';
import type { StyleProp, ViewStyle } from 'react-native';

interface IconProps {
  size?: number;
  color?: string;
  strokeWidth?: number;
  style?: StyleProp<ViewStyle>;
}

export default function SmartphoneIcon({
  size = 24,
  color = '#222222',
  strokeWidth = 1.5,
  style,
}: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={style}>
      <Rect
        x="5"
        y="2"
        width="14"
        height="20"
        rx="3"
        stroke={color}
        strokeWidth={strokeWidth}
      />
      <Path
        d="M12 18H12.01"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
      />
    </Svg>
  );
}
