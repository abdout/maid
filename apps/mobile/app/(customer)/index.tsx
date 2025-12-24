import { useState, useCallback } from 'react';
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
import { useTranslation } from 'react-i18next';
import { useMaids, useNationalities } from '@/hooks';
import { MaidCard, CategoryFilter, FilterModal } from '@/components';
import {
  SearchIcon,
  ChevronDownIcon,
  UserIcon,
} from '@/components/icons';
import type { MaidFilters, ServiceType } from '@maid/shared';

export default function HomeScreen() {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';

  // Filter state
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState<Partial<MaidFilters>>({});
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [selectedServiceType, setSelectedServiceType] = useState<ServiceType | null>(null);

  const { data: nationalitiesData } = useNationalities();
  const { data: maidsData, isLoading, isRefetching, refetch } = useMaids({
    ...filters,
    serviceType: selectedServiceType || undefined,
    page,
    pageSize: 20,
  });

  const nationalities = nationalitiesData?.data || [];
  const maids = maidsData?.data?.items || [];
  const total = maidsData?.data?.total || 0;
  const totalPages = maidsData?.data?.totalPages || 1;

  const activeFilterCount = Object.values(filters).filter(Boolean).length;
  const hasActiveFilters = activeFilterCount > 0;

  const handleApplyFilters = useCallback((newFilters: Partial<MaidFilters>) => {
    setFilters(newFilters);
    setPage(1);
  }, []);

  const handleResetFilters = useCallback(() => {
    setFilters({});
    setSearchQuery('');
    setPage(1);
  }, []);

  const handleLoadMore = useCallback(() => {
    if (page < totalPages && !isLoading) {
      setPage((p) => p + 1);
    }
  }, [page, totalPages, isLoading]);

  const handleServiceTypeChange = useCallback((serviceType: ServiceType | null) => {
    setSelectedServiceType(serviceType);
    setPage(1);
  }, []);

  // Header component for FlatList (search + categories)
  const ListHeader = () => (
    <>
      {/* Search Bar with Filter Button */}
      <View className="mx-6 mt-4 mb-4">
        <View
          className={`flex-row items-center bg-background-0 rounded-full border border-background-200 ${isRTL ? 'flex-row-reverse' : ''}`}
          style={{
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.08,
            shadowRadius: 12,
            elevation: 3,
          }}
        >
          {/* Filter Button - Sharp inner corner */}
          <Pressable
            onPress={() => setShowFilters(true)}
            className={`flex-row items-center px-4 h-12 gap-1.5 ${isRTL ? 'rounded-r-full' : 'rounded-l-full'}`}
            style={isRTL
              ? { borderTopLeftRadius: 0, borderBottomLeftRadius: 0 }
              : { borderTopRightRadius: 0, borderBottomRightRadius: 0 }
            }
          >
            <Text className="text-sm font-medium text-typography-900">
              {t('common.filter')}
            </Text>
            <ChevronDownIcon size={14} color="#222222" />
            {activeFilterCount > 0 && (
              <View className="w-5 h-5 bg-primary-500 rounded-full items-center justify-center">
                <Text className="text-white text-xs font-bold">{activeFilterCount}</Text>
              </View>
            )}
          </Pressable>

          {/* Separator */}
          <View className="w-px h-6 bg-background-200" />

          {/* Search Input */}
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder={t('common.search')}
            placeholderTextColor="#717171"
            className={`flex-1 h-12 px-3 text-typography-900 ${isRTL ? 'text-right' : 'text-left'}`}
          />

          {/* Search Button */}
          <Pressable className="w-9 h-9 rounded-full bg-primary-500 items-center justify-center mr-1">
            <SearchIcon size={16} color="#FFFFFF" />
          </Pressable>
        </View>
      </View>

      {/* Category Filter */}
      <View className="mb-4">
        <CategoryFilter
          selected={selectedServiceType}
          onSelect={(id) => handleServiceTypeChange(id as ServiceType | null)}
        />
      </View>

      {/* Results Header - Only show when filters active */}
      {hasActiveFilters && (
        <View className="px-6 mb-3">
          <View className={`flex-row justify-between items-center ${isRTL ? 'flex-row-reverse' : ''}`}>
            <Text className="text-lg font-semibold text-typography-900">
              {t('search.results', { count: total })}
            </Text>
            <Pressable onPress={handleResetFilters}>
              <Text className="text-primary-500 font-medium">{t('filters.reset')}</Text>
            </Pressable>
          </View>
        </View>
      )}
    </>
  );

  // Empty state component
  const ListEmpty = () => (
    <View className="px-6 py-12 items-center">
      <View className="w-16 h-16 rounded-full bg-background-100 items-center justify-center mb-4">
        <UserIcon size={32} color="#B0B0B0" />
      </View>
      <Text className="text-typography-400 text-center mb-4">
        {hasActiveFilters ? t('search.noResults') : t('home.noMaidsYet')}
      </Text>
      {hasActiveFilters && (
        <Pressable
          onPress={handleResetFilters}
          className="px-6 py-3 bg-primary-500 rounded-lg"
        >
          <Text className="text-white font-medium">{t('filters.reset')}</Text>
        </Pressable>
      )}
    </View>
  );

  // Footer component for loading more
  const ListFooter = () => {
    if (isLoading && page > 1) {
      return (
        <View className="py-4">
          <ActivityIndicator color="#FF385C" />
        </View>
      );
    }
    return <View className="h-24" />;
  };

  return (
    <SafeAreaView className="flex-1 bg-background-0" edges={['top']}>
      {isLoading && page === 1 ? (
        <>
          <ListHeader />
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator size="large" color="#FF385C" />
          </View>
        </>
      ) : (
        <FlatList
          data={maids}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View className="px-6">
              <MaidCard maid={item} />
            </View>
          )}
          ListHeaderComponent={ListHeader}
          ListEmptyComponent={ListEmpty}
          ListFooterComponent={ListFooter}
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
        />
      )}

      {/* Filter Modal */}
      <FilterModal
        visible={showFilters}
        onClose={() => setShowFilters(false)}
        onApply={handleApplyFilters}
        initialFilters={filters}
      />
    </SafeAreaView>
  );
}
