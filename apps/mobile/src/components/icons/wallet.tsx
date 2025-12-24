import * as React from 'react';
import Svg, { Path, type SvgProps } from 'react-native-svg';

interface WalletIconProps extends SvgProps {
  size?: number;
  color?: string;
}

export function WalletIcon({ size = 24, color = 'currentColor', ...props }: WalletIconProps) {
  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <Path d="M21 12V7H5a2 2 0 0 1 0-4h14v4" />
      <Path d="M3 5v14a2 2 0 0 0 2 2h16v-5" />
      <Path d="M18 12a2 2 0 0 0 0 4h4v-4Z" />
    </Svg>
  );
}

export default WalletIcon;
