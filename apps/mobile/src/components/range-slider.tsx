import { useCallback } from 'react';
import { View, Text } from 'react-native';
import Slider from '@react-native-community/slider';
import { useTranslation } from 'react-i18next';

interface RangeSliderProps {
  label: string;
  min: number;
  max: number;
  step?: number;
  minValue: number;
  maxValue: number;
  onMinChange: (value: number) => void;
  onMaxChange: (value: number) => void;
  formatValue?: (value: number) => string;
}

const PRIMARY_COLOR = '#FF385C';
const TRACK_COLOR = '#E5E5E5';

export function RangeSlider({
  label,
  min,
  max,
  step = 1,
  minValue,
  maxValue,
  onMinChange,
  onMaxChange,
  formatValue = (v) => v.toString(),
}: RangeSliderProps) {
  const { i18n, t } = useTranslation();
  const isRTL = i18n.language === 'ar';

  const handleMinChange = useCallback(
    (value: number) => {
      const rounded = Math.round(value / step) * step;
      if (rounded < maxValue) {
        onMinChange(rounded);
      }
    },
    [maxValue, onMinChange, step]
  );

  const handleMaxChange = useCallback(
    (value: number) => {
      const rounded = Math.round(value / step) * step;
      if (rounded > minValue) {
        onMaxChange(rounded);
      }
    },
    [minValue, onMaxChange, step]
  );

  return (
    <View>
      <Text
        className={`text-typography-900 font-semibold mb-3 ${isRTL ? 'text-right' : ''}`}
      >
        {label}
      </Text>

      {/* Current values display */}
      <View
        className={`flex-row justify-between mb-2 ${isRTL ? 'flex-row-reverse' : ''}`}
      >
        <Text className="text-primary-500 font-medium">
          {formatValue(minValue)}
        </Text>
        <Text className="text-typography-400">—</Text>
        <Text className="text-primary-500 font-medium">
          {formatValue(maxValue)}
        </Text>
      </View>

      {/* Min Slider */}
      <View className="mb-3">
        <Text className={`text-typography-400 text-xs mb-1 ${isRTL ? 'text-right' : ''}`}>
          {t('common.min')}
        </Text>
        <View className="bg-background-50 rounded-xl px-2 py-1">
          <Slider
            style={{ width: '100%', height: 40 }}
            minimumValue={min}
            maximumValue={max}
            step={step}
            value={minValue}
            onValueChange={handleMinChange}
            minimumTrackTintColor={PRIMARY_COLOR}
            maximumTrackTintColor={TRACK_COLOR}
            thumbTintColor={PRIMARY_COLOR}
          />
        </View>
      </View>

      {/* Max Slider */}
      <View>
        <Text className={`text-typography-400 text-xs mb-1 ${isRTL ? 'text-right' : ''}`}>
          {t('common.max')}
        </Text>
        <View className="bg-background-50 rounded-xl px-2 py-1">
          <Slider
            style={{ width: '100%', height: 40 }}
            minimumValue={min}
            maximumValue={max}
            step={step}
            value={maxValue}
            onValueChange={handleMaxChange}
            minimumTrackTintColor={PRIMARY_COLOR}
            maximumTrackTintColor={TRACK_COLOR}
            thumbTintColor={PRIMARY_COLOR}
          />
        </View>
      </View>
    </View>
  );
}
