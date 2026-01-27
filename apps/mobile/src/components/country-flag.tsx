import { Image, View } from 'react-native';

interface CountryFlagProps {
  /** ISO 3166-1 alpha-2 country code (e.g., 'ID', 'PH', 'LK') */
  code: string;
  /** Width of the flag in pixels (height auto-calculated for 4:3 ratio) */
  width?: number;
  /** Optional className for the container */
  className?: string;
}

/**
 * Renders a sharp rectangular country flag using flagcdn.com CDN
 *
 * Uses 4:3 aspect ratio flags (standard for most national flags)
 * Falls back to a gray placeholder if the flag fails to load
 */
export function CountryFlag({ code, width = 24, className }: CountryFlagProps) {
  // Height calculated for 4:3 aspect ratio (common for flags)
  const height = Math.round(width * 0.75);

  // Use flagcdn.com for sharp rectangular flags
  // w40 provides a good balance of quality and size
  const flagUrl = `https://flagcdn.com/w40/${code.toLowerCase()}.png`;

  return (
    <View className={className}>
      <Image
        source={{ uri: flagUrl }}
        style={{ width, height, borderRadius: 2 }}
        resizeMode="cover"
      />
    </View>
  );
}
