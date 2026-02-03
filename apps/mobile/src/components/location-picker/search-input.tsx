import { View, TextInput, Pressable, Text, FlatList, ActivityIndicator } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { type MapboxFeature } from '@/lib/mapbox';

interface SearchInputProps {
  query: string;
  onQueryChange: (query: string) => void;
  results: MapboxFeature[];
  loading: boolean;
  onSelectResult: (feature: MapboxFeature) => void;
  onClear: () => void;
  placeholder?: string;
}

export function SearchInput({
  query,
  onQueryChange,
  results,
  loading,
  onSelectResult,
  onClear,
  placeholder,
}: SearchInputProps) {
  const { i18n, t } = useTranslation();
  const isRTL = i18n.language === 'ar';

  const showResults = results.length > 0 && query.length >= 2;

  return (
    <View className="relative z-10">
      {/* Search Input */}
      <View className="flex-row items-center bg-background-50 border border-background-200 rounded-xl px-3">
        <Ionicons
          name="search"
          size={20}
          color="#9CA3AF"
          style={{ marginRight: isRTL ? 0 : 8, marginLeft: isRTL ? 8 : 0 }}
        />
        <TextInput
          value={query}
          onChangeText={onQueryChange}
          placeholder={placeholder || t('locationPicker.searchPlaceholder')}
          placeholderTextColor="#9CA3AF"
          className={`flex-1 py-3 text-base text-typography-900 ${isRTL ? 'text-right' : 'text-left'}`}
          textAlign={isRTL ? 'right' : 'left'}
          autoCapitalize="none"
          autoCorrect={false}
        />
        {loading && (
          <ActivityIndicator size="small" color="#6B7280" />
        )}
        {query.length > 0 && !loading && (
          <Pressable onPress={onClear} className="p-1">
            <Ionicons name="close-circle" size={20} color="#9CA3AF" />
          </Pressable>
        )}
      </View>

      {/* Results Dropdown */}
      {showResults && (
        <View className="absolute top-full left-0 right-0 mt-1 bg-background-0 border border-background-200 rounded-xl shadow-lg max-h-48 overflow-hidden z-20">
          <FlatList
            data={results}
            keyExtractor={(item) => item.id}
            keyboardShouldPersistTaps="handled"
            renderItem={({ item }) => (
              <Pressable
                onPress={() => onSelectResult(item)}
                className="px-4 py-3 border-b border-background-100 active:bg-background-50"
              >
                <View className={`flex-row items-start ${isRTL ? 'flex-row-reverse' : ''}`}>
                  <Ionicons
                    name="location"
                    size={18}
                    color="#6B7280"
                    style={{ marginTop: 2, marginRight: isRTL ? 0 : 10, marginLeft: isRTL ? 10 : 0 }}
                  />
                  <Text
                    className={`flex-1 text-sm text-typography-700 ${isRTL ? 'text-right' : 'text-left'}`}
                    numberOfLines={2}
                  >
                    {isRTL && item.place_name_ar ? item.place_name_ar : item.place_name}
                  </Text>
                </View>
              </Pressable>
            )}
          />
        </View>
      )}
    </View>
  );
}
