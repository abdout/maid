import { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  FlatList,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useBusinesses, useDebounce } from '@/hooks';
import { BusinessCard } from '@/components';
import { SearchIcon, FilterIcon, BuildingIcon } from '@/components/icons';
import { EMIRATES } from '@/constants';

type BusinessType = 'typing_office' | 'visa_transfer';

export default function BusinessesScreen() {
  const { t, i18n } = useTranslation();
  const { type } = useLocalSearchParams<{ type?: BusinessType }>();
  const isRTL = i18n.language === 'ar';

  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearch = useDebounce(searchQuery, 300);
  const [isFocused, setIsFocused] = useState(false);
  const [selectedEmirate, setSelectedEmirate] = useState<string | undefined>();
  const [page, setPage] = useState(1);

  // Reset page when search changes
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, selectedEmirate]);

  const { data, isLoading, isRefetching, refetch } = useBusinesses({
    type,
    search: debouncedSearch.length >= 2 ? debouncedSearch : undefined,
    emirate: selectedEmirate,
    page,
    pageSize: 20,
  });

  const businesses = data?.data?.items || [];
  const total = data?.data?.total || 0;
  const totalPages = data?.data?.totalPages || 1;

  const handleLoadMore = useCallback(() => {
    if (page < totalPages && !isLoading) {
      setPage((p) => p + 1);
    }
  }, [page, totalPages, isLoading]);

  const pageTitle = type === 'typing_office'
    ? t('business.typingOffices', 'Typing Offices')
    : type === 'visa_transfer'
      ? t('business.visaTransfer', 'Visa Transfer Services')
      : t('business.allServices', 'All Services');

  return (
    <SafeAreaView className="flex-1 bg-background-0" edges={['top']}>
      {/* Header */}
      <View className="px-6 pt-4 pb-2">
        <Text className={`text-2xl font-bold text-typography-900 ${isRTL ? 'text-right' : 'text-left'}`}>
          {pageTitle}
        </Text>
      </View>

      {/* Search Header */}
      <View className="px-6 pt-2 pb-4">
        <View
          className={`flex-row items-center bg-background-0 rounded-full border ${
            isFocused ? 'border-primary-500' : 'border-background-200'
          } ${isRTL ? 'flex-row-reverse' : ''}`}
          style={{
            shadowColor: '#000',
            shadowOffset: { width: 0, height: isFocused ? 2 : 1 },
            shadowOpacity: isFocused ? 0.12 : 0.08,
            shadowRadius: isFocused ? 8 : 4,
            elevation: isFocused ? 4 : 2,
          }}
        >
          {/* Search Icon */}
          <View className={isRTL ? 'pr-4 pl-2' : 'pl-4 pr-2'}>
            <SearchIcon size={20} color={isFocused ? '#FF385C' : '#717171'} />
          </View>

          {/* Search Input */}
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder={t('business.searchPlaceholder', 'Search by name...')}
            placeholderTextColor="#717171"
            className={`flex-1 h-12 text-typography-900 ${isRTL ? 'text-right' : 'text-left'}`}
            style={{ writingDirection: isRTL ? 'rtl' : 'ltr' }}
          />
        </View>
      </View>

      {/* Emirate Filter Chips */}
      <View className="px-6 pb-4">
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={[{ id: 'all', nameEn: 'All', nameAr: 'الكل' }, ...EMIRATES]}
          inverted={isRTL}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => {
            const isSelected = item.id === 'all' ? !selectedEmirate : selectedEmirate === item.id;
            return (
              <Pressable
                onPress={() => setSelectedEmirate(item.id === 'all' ? undefined : item.id)}
                className={`px-4 py-2 rounded-full mr-2 ${
                  isSelected ? 'bg-primary-500' : 'bg-background-100'
                }`}
              >
                <Text className={isSelected ? 'text-white font-medium' : 'text-typography-700'}>
                  {isRTL ? item.nameAr : item.nameEn}
                </Text>
              </Pressable>
            );
          }}
        />
      </View>

      {/* Results Count */}
      <View className="px-6 pb-2">
        <Text className={`text-typography-500 ${isRTL ? 'text-right' : 'text-left'}`}>
          {t('search.results', { count: total })}
        </Text>
      </View>

      {/* Results */}
      {isLoading && page === 1 ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#FF385C" />
        </View>
      ) : businesses.length === 0 ? (
        <View className="flex-1 items-center justify-center px-6">
          <View className="w-16 h-16 rounded-full bg-background-100 items-center justify-center mb-4">
            <BuildingIcon size={32} color="#B0B0B0" />
          </View>
          <Text className="text-typography-400 text-center">
            {t('business.noResults', 'No businesses found')}
          </Text>
          {(selectedEmirate || searchQuery) && (
            <Pressable
              onPress={() => {
                setSelectedEmirate(undefined);
                setSearchQuery('');
              }}
              className="mt-4 px-6 py-3 bg-primary-500 rounded-lg"
            >
              <Text className="text-white font-medium">{t('filters.reset', 'Reset Filters')}</Text>
            </Pressable>
          )}
        </View>
      ) : (
        <FlatList
          data={businesses}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <BusinessCard business={item} />}
          contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={refetch}
              tintColor="#FF385C"
            />
          }
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          ListFooterComponent={
            isLoading && page > 1 ? (
              <View className="py-4">
                <ActivityIndicator color="#FF385C" />
              </View>
            ) : null
          }
        />
      )}
    </SafeAreaView>
  );
}
