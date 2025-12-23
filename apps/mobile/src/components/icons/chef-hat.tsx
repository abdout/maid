import React from 'react';
import Svg, { Path, Line } from 'react-native-svg';
import type { StyleProp, ViewStyle } from 'react-native';

interface IconProps {
  size?: number;
  color?: string;
  strokeWidth?: number;
  filled?: boolean;
  style?: StyleProp<ViewStyle>;
}

export default function ChefHatIcon({
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
          d="M6 13V19C6 20.1046 6.89543 21 8 21H16C17.1046 21 18 20.1046 18 19V13"
          fill={color}
        />
        <Path
          d="M12 3C9.79086 3 8 4.79086 8 7C6.34315 7 5 8.34315 5 10C5 11.6569 6.34315 13 8 13H16C17.6569 13 19 11.6569 19 10C19 8.34315 17.6569 7 16 7C16 4.79086 14.2091 3 12 3Z"
          fill={color}
        />
      </Svg>
    );
  }

  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none" style={style}>
      <Path
        d="M6 13V19C6 20.1046 6.89543 21 8 21H16C17.1046 21 18 20.1046 18 19V13"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Path
        d="M12 3C9.79086 3 8 4.79086 8 7C6.34315 7 5 8.34315 5 10C5 11.6569 6.34315 13 8 13H16C17.6569 13 19 11.6569 19 10C19 8.34315 17.6569 7 16 7C16 4.79086 14.2091 3 12 3Z"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <Line
        x1="6"
        y1="17"
        x2="18"
        y2="17"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
      />
    </Svg>
  );
}
