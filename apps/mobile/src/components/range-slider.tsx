import { useCallback } from 'react';
import { View, Text } from 'react-native';
import MultiSlider from '@ptomasroos/react-native-multi-slider';
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
const THUMB_SIZE = 24;

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
  const { i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';

  const handleValuesChange = useCallback(
    (values: number[]) => {
      if (values[0] !== minValue) {
        onMinChange(values[0]);
      }
      if (values[1] !== maxValue) {
        onMaxChange(values[1]);
      }
    },
    [minValue, maxValue, onMinChange, onMaxChange]
  );

  return (
    <View>
      {/* Label */}
      <Text
        className={`text-typography-900 font-semibold mb-2 ${isRTL ? 'text-right' : ''}`}
      >
        {label}
      </Text>

      {/* Current values display */}
      <View
        className={`flex-row justify-between mb-3 ${isRTL ? 'flex-row-reverse' : ''}`}
      >
        <Text className="text-primary-500 font-medium text-base">
          {formatValue(minValue)}
        </Text>
        <Text className="text-primary-500 font-medium text-base">
          {formatValue(maxValue)}
        </Text>
      </View>

      {/* Dual-thumb Range Slider */}
      <View className="items-center">
        <MultiSlider
          values={[minValue, maxValue]}
          min={min}
          max={max}
          step={step}
          onValuesChange={handleValuesChange}
          sliderLength={280}
          selectedStyle={{ backgroundColor: PRIMARY_COLOR }}
          unselectedStyle={{ backgroundColor: TRACK_COLOR }}
          trackStyle={{
            height: 4,
            borderRadius: 2,
          }}
          markerStyle={{
            height: THUMB_SIZE,
            width: THUMB_SIZE,
            borderRadius: THUMB_SIZE / 2,
            backgroundColor: PRIMARY_COLOR,
            borderWidth: 3,
            borderColor: '#FFFFFF',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.2,
            shadowRadius: 3,
            elevation: 3,
          }}
          pressedMarkerStyle={{
            height: THUMB_SIZE + 4,
            width: THUMB_SIZE + 4,
          }}
          containerStyle={{
            height: 40,
          }}
          enabledOne
          enabledTwo
          minMarkerOverlapDistance={20}
          snapped
        />
      </View>

      {/* Range labels */}
      <View
        className={`flex-row justify-between mt-1 ${isRTL ? 'flex-row-reverse' : ''}`}
      >
        <Text className="text-typography-400 text-xs">
          {formatValue(min)}
        </Text>
        <Text className="text-typography-400 text-xs">
          {formatValue(max)}
        </Text>
      </View>
    </View>
  );
}
