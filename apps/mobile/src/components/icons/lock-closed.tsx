import React from 'react';
import Svg, { Path } from 'react-native-svg';
import type { StyleProp, ViewStyle } from 'react-native';

interface LockClosedIconProps {
  size?: number;
  color?: string;
  strokeWidth?: number;
  style?: StyleProp<ViewStyle>;
}

export default function LockClosedIcon({
  size = 24,
  color = '#222222',
  strokeWidth = 1.5,
  style,
}: LockClosedIconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={style}>
      <Path
        d="M18 10V6C18 3.79086 16.2091 2 14 2H10C7.79086 2 6 3.79086 6 6V10"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M5 10H19C20.1046 10 21 10.8954 21 12V20C21 21.1046 20.1046 22 19 22H5C3.89543 22 3 21.1046 3 20V12C3 10.8954 3.89543 10 5 10Z"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M12 14V18"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />
    </Svg>
  );
}
