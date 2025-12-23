import React from 'react';
import Svg, { Path, Circle, Line } from 'react-native-svg';
import type { StyleProp, ViewStyle } from 'react-native';

interface IconProps {
  size?: number;
  color?: string;
  strokeWidth?: number;
  filled?: boolean;
  style?: StyleProp<ViewStyle>;
}

export default function CarIcon({
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
          d="M3 11L5 6C5.37 5.4 6.09 5 7 5H17C17.91 5 18.63 5.4 19 6L21 11"
          fill={color}
        />
        <Path
          d="M21 11V17C21 17.55 20.55 18 20 18H19C18.45 18 18 17.55 18 17V16H6V17C6 17.55 5.55 18 5 18H4C3.45 18 3 17.55 3 17V11C3 10.45 3.45 10 4 10H20C20.55 10 21 10.45 21 11Z"
          fill={color}
        />
        <Circle cx="7" cy="14" r="1.5" fill="white" />
        <Circle cx="17" cy="14" r="1.5" fill="white" />
      </Svg>
    );
  }

  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={style}>
      <Path
        d="M3 11L5 6C5.37 5.4 6.09 5 7 5H17C17.91 5 18.63 5.4 19 6L21 11"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M21 11V17C21 17.55 20.55 18 20 18H19C18.45 18 18 17.55 18 17V16H6V17C6 17.55 5.55 18 5 18H4C3.45 18 3 17.55 3 17V11C3 10.45 3.45 10 4 10H20C20.55 10 21 10.45 21 11Z"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Circle
        cx="7"
        cy="14"
        r="1.5"
        stroke={color}
        strokeWidth={strokeWidth}
      />
      <Circle
        cx="17"
        cy="14"
        r="1.5"
        stroke={color}
        strokeWidth={strokeWidth}
      />
    </Svg>
  );
}
