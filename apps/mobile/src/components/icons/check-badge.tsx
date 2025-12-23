import React from 'react';
import Svg, { Path } from 'react-native-svg';
import type { StyleProp, ViewStyle } from 'react-native';

interface CheckBadgeIconProps {
  size?: number;
  color?: string;
  strokeWidth?: number;
  style?: StyleProp<ViewStyle>;
}

export default function CheckBadgeIcon({
  size = 24,
  color = '#222222',
  strokeWidth = 1.5,
  style,
}: CheckBadgeIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={style}>
      <Path
        d="M9 12L11 14L15 10"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M12 2L14.39 5.42L18.5 4.23L17.87 8.47L21.5 10.82L18.5 13.77L19.13 18L15 16.5L12 19.5L9 16.5L4.87 18L5.5 13.77L2.5 10.82L6.13 8.47L5.5 4.23L9.61 5.42L12 2Z"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}
