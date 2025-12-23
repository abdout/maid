import React from 'react';
import Svg, { Path, Rect } from 'react-native-svg';
import type { StyleProp, ViewStyle } from 'react-native';

interface IconProps {
  size?: number;
  color?: string;
  strokeWidth?: number;
  style?: StyleProp<ViewStyle>;
}

export default function BuildingIcon({
  size = 24,
  color = '#222222',
  strokeWidth = 1.5,
  style,
}: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={style}>
      <Rect
        x="4"
        y="2"
        width="16"
        height="20"
        rx="2"
        stroke={color}
        strokeWidth={strokeWidth}
      />
      <Path d="M9 6H10" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
      <Path d="M14 6H15" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
      <Path d="M9 10H10" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
      <Path d="M14 10H15" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
      <Path d="M9 14H10" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
      <Path d="M14 14H15" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" />
      <Path d="M10 22V18H14V22" stroke={color} strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}
