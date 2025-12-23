import React from 'react';
import Svg, { Rect } from 'react-native-svg';
import type { StyleProp, ViewStyle } from 'react-native';

interface IconProps {
  size?: number;
  color?: string;
  strokeWidth?: number;
  filled?: boolean;
  style?: StyleProp<ViewStyle>;
}

export default function GridIcon({
  size = 24,
  color = '#222222',
  strokeWidth = 1.5,
  filled = false,
  style,
}: IconProps) {
  if (filled) {
    return (
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={style}>
        <Rect x="3" y="3" width="7" height="7" rx="1" fill={color} />
        <Rect x="14" y="3" width="7" height="7" rx="1" fill={color} />
        <Rect x="3" y="14" width="7" height="7" rx="1" fill={color} />
        <Rect x="14" y="14" width="7" height="7" rx="1" fill={color} />
      </Svg>
    );
  }

  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={style}>
      <Rect
        x="3"
        y="3"
        width="7"
        height="7"
        rx="1"
        stroke={color}
        strokeWidth={strokeWidth}
      />
      <Rect
        x="14"
        y="3"
        width="7"
        height="7"
        rx="1"
        stroke={color}
        strokeWidth={strokeWidth}
      />
      <Rect
        x="3"
        y="14"
        width="7"
        height="7"
        rx="1"
        stroke={color}
        strokeWidth={strokeWidth}
      />
      <Rect
        x="14"
        y="14"
        width="7"
        height="7"
        rx="1"
        stroke={color}
        strokeWidth={strokeWidth}
      />
    </Svg>
  );
}
