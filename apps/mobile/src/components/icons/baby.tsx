import React from 'react';
import Svg, { Circle, Path, Line } from 'react-native-svg';
import type { StyleProp, ViewStyle } from 'react-native';

interface IconProps {
  size?: number;
  color?: string;
  strokeWidth?: number;
  filled?: boolean;
  style?: StyleProp<ViewStyle>;
}

export default function BabyIcon({
  size = 24,
  color = '#222222',
  strokeWidth = 1.5,
  filled = false,
  style,
}: IconProps) {
  if (filled) {
    return (
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={style}>
        <Circle cx="12" cy="12" r="9" fill={color} />
        <Circle cx="9" cy="10" r="1" fill="white" />
        <Circle cx="15" cy="10" r="1" fill="white" />
        <Path
          d="M9 14C9 14 10 16 12 16C14 16 15 14 15 14"
          stroke="white"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />
        <Path
          d="M8 4C8 4 10 2 12 2C14 2 16 4 16 4"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />
      </Svg>
    );
  }

  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={style}>
      <Circle
        cx="12"
        cy="12"
        r="9"
        stroke={color}
        strokeWidth={strokeWidth}
      />
      <Circle cx="9" cy="10" r="1" fill={color} />
      <Circle cx="15" cy="10" r="1" fill={color} />
      <Path
        d="M9 14C9 14 10 16 12 16C14 16 15 14 15 14"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />
      <Path
        d="M8 4C8 4 10 2 12 2C14 2 16 4 16 4"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />
    </Svg>
  );
}
