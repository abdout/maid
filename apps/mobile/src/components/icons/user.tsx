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

export default function UserIcon({
  size = 24,
  color = '#222222',
  strokeWidth = 1.5,
  filled = false,
  style,
}: IconProps) {
  if (filled) {
    return (
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={style}>
        <Circle cx="12" cy="8" r="4" fill={color} />
        <Path
          d="M4 20C4 16.6863 7.58172 14 12 14C16.4183 14 20 16.6863 20 20V21H4V20Z"
          fill={color}
        />
      </Svg>
    );
  }

  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={style}>
      <Circle
        cx="12"
        cy="8"
        r="4"
        stroke={color}
        strokeWidth={strokeWidth}
      />
      <Path
        d="M4 20C4 16.6863 7.58172 14 12 14C16.4183 14 20 16.6863 20 20V21H4V20Z"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}
