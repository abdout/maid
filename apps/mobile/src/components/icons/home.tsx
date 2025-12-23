import React from 'react';
import Svg, { Path } from 'react-native-svg';
import type { StyleProp, ViewStyle } from 'react-native';

interface IconProps {
  size?: number;
  color?: string;
  strokeWidth?: number;
  filled?: boolean;
  style?: StyleProp<ViewStyle>;
}

export default function HomeIcon({
  size = 24,
  color = '#222222',
  strokeWidth = 1.5,
  filled = false,
  style,
}: IconProps) {
  if (filled) {
    return (
      <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={style}>
        <Path
          d="M3 10.25V20C3 20.5523 3.44772 21 4 21H9V15C9 14.4477 9.44772 14 10 14H14C14.5523 14 15 14.4477 15 15V21H20C20.5523 21 21 20.5523 21 20V10.25L12 3L3 10.25Z"
          fill={color}
        />
      </Svg>
    );
  }

  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={style}>
      <Path
        d="M3 10.25V20C3 20.5523 3.44772 21 4 21H9V15C9 14.4477 9.44772 14 10 14H14C14.5523 14 15 14.4477 15 15V21H20C20.5523 21 21 20.5523 21 20V10.25L12 3L3 10.25Z"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}
