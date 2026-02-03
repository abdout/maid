import { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  Pressable,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  Alert,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useOfficeMaids, useUpdateMaidStatus, useDeleteMaid, useDebounce, useToast } from '@/hooks';
import { MaidCard } from '@/components';
import { PlusIcon, PencilIcon, CheckIcon, UserIcon, SearchIcon, XIcon } from '@/components/icons';

type MaidStatus = 'all' | 'available' | 'busy' | 'reserved' | 'inactive';

export default function OfficeMaidsScreen() {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const toast = useToast();
  const isRTL = i18n.language === 'ar';

  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<MaidStatus>('all');

  const debouncedSearch = useDebounce(searchQuery, 300);

  const queryParams = useMemo(() => ({
    page,
    pageSize: 20,
    search: debouncedSearch || undefined,
    status: statusFilter === 'all' ? undefined : statusFilter,
  }), [page, debouncedSearch, statusFilter]);

  const { data, isLoading, isRefetching, refetch, isFetching } = useOfficeMaids(queryParams);
  const isFetchingNextPage = isFetching && page > 1;
  const updateStatus = useUpdateMaidStatus();
  const deleteMaid = useDeleteMaid();

  const maids = data?.data?.items || [];
  const total = data?.data?.total || 0;
  const totalPages = data?.data?.totalPages || 1;
  const hasMore = page < totalPages;

  const statusTabs: { key: MaidStatus; label: string }[] = [
    { key: 'all', label: t('common.all') },
    { key: 'available', label: t('maid.available') },
    { key: 'busy', label: t('maid.busy') },
    { key: 'reserved', label: t('maid.reserved') },
    { key: 'inactive', label: t('maid.inactive') },
  ];

  const handleAddMaid = () => {
    router.push('/maid-onboarding');
  };

  const handleEditMaid = (id: string) => {
    router.push(`/edit-maid/${id}`);
  };

  const handleDeleteMaid = (id: string, name: string) => {
    // Keep Alert for destructive confirmation - user needs explicit choice
    Alert.alert(
      t('office.deleteMaidTitle'),
      t('office.deleteMaidConfirm', { name }),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('common.delete'),
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteMaid.mutateAsync(id);
              toast.success(t('success.deleted'));
            } catch (error) {
              toast.error(t('errors.somethingWrong'));
            }
          },
        },
      ]
    );
  };

  const getNextStatusLabel = (currentStatus: string): string => {
    switch (currentStatus) {
      case 'available':
        return t('office.setBusy');
      case 'busy':
        return t('office.setReserved');
      case 'reserved':
        return t('office.setInactive');
      case 'inactive':
        return t('office.setAvailable');
      default:
        return t('office.setBusy');
    }
  };

  const handleStatusChange = async (id: string, currentStatus: string) => {
    const statuses = ['available', 'busy', 'reserved', 'inactive'];
    const currentIndex = statuses.indexOf(currentStatus);
    const nextStatus = statuses[(currentIndex + 1) % statuses.length];

    try {
      await updateStatus.mutateAsync({ id, status: nextStatus });
      toast.success(t('success.updated'));
    } catch (error) {
      toast.error(t('errors.somethingWrong'));
    }
  };

  const handleStatusFilterChange = (status: MaidStatus) => {
    setStatusFilter(status);
    setPage(1);
  };

  const handleSearchChange = (text: string) => {
    setSearchQuery(text);
    setPage(1);
  };

  const clearSearch = () => {
    setSearchQuery('');
    setPage(1);
  };

  const handleLoadMore = useCallback(() => {
    if (hasMore && !isLoading && !isFetchingNextPage) {
      setPage((prev) => prev + 1);
    }
  }, [hasMore, isLoading, isFetchingNextPage]);

  const handleRefresh = useCallback(() => {
    setPage(1);
    refetch();
  }, [refetch]);

  const renderMaidItem = ({ item }: { item: typeof maids[0] }) => (
    <Pressable
      onPress={() => handleEditMaid(item.id)}
      onLongPress={() => handleDeleteMaid(item.id, item.name)}
      className="mb-3"
    >
      <View className="bg-background-0 rounded-xl overflow-hidden border border-background-200">
        <MaidCard maid={item} onPress={() => handleEditMaid(item.id)} />

        {/* Quick Actions */}
        <View className={`flex-row border-t border-background-100 ${isRTL ? 'flex-row-reverse' : ''}`}>
          <Pressable
            onPress={() => handleStatusChange(item.id, item.status)}
            className={`flex-1 py-3 items-center flex-row justify-center ${isRTL ? 'border-l' : 'border-r'} border-background-100 ${isRTL ? 'flex-row-reverse' : ''}`}
          >
            <CheckIcon size={16} color="#FF385C" />
            <Text className={`text-primary-500 font-medium ${isRTL ? 'mr-1' : 'ml-1'}`}>
              {getNextStatusLabel(item.status)}
            </Text>
          </Pressable>
          <Pressable
            onPress={() => handleEditMaid(item.id)}
            className={`flex-1 py-3 items-center flex-row justify-center ${isRTL ? 'flex-row-reverse' : ''}`}
          >
            <PencilIcon size={16} color="#717171" />
            <Text className={`text-typography-700 font-medium ${isRTL ? 'mr-1' : 'ml-1'}`}>
              {t('common.edit')}
            </Text>
          </Pressable>
        </View>
      </View>
    </Pressable>
  );

  const renderFooter = () => {
    if (!hasMore) return null;
    return (
      <View className="py-4 items-center">
        <ActivityIndicator size="small" color="#FF385C" />
      </View>
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-background-0" edges={['top']}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        {/* Header */}
        <View className={`px-6 pt-4 pb-2 flex-row items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
        <View>
          <Text className={`text-2xl font-bold text-typography-900 ${isRTL ? 'text-right' : ''}`}>
            {t('office.maids')}
          </Text>
          <Text className="text-typography-500">
            {total} {t('office.total')}
          </Text>
        </View>
        <Pressable
          onPress={handleAddMaid}
          className={`bg-primary-500 px-4 py-2 rounded-lg flex-row items-center ${isRTL ? 'flex-row-reverse' : ''}`}
        >
          <PlusIcon size={18} color="#FFFFFF" />
          <Text className={`text-white font-medium ${isRTL ? 'mr-1' : 'ml-1'}`}>{t('office.addMaid')}</Text>
        </Pressable>
      </View>

      {/* Search Bar */}
      <View className="px-6 py-3">
        <View className={`flex-row items-center bg-background-100 rounded-xl px-4 py-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
          <SearchIcon size={20} color="#717171" />
          <TextInput
            className={`flex-1 text-typography-900 ${isRTL ? 'text-right mr-3' : 'ml-3'}`}
            placeholder={t('office.searchMaids')}
            placeholderTextColor="#717171"
            value={searchQuery}
            onChangeText={handleSearchChange}
            autoCapitalize="none"
            autoCorrect={false}
          />
          {searchQuery.length > 0 && (
            <Pressable onPress={clearSearch} className="p-1">
              <XIcon size={18} color="#717171" />
            </Pressable>
          )}
        </View>
      </View>

      {/* Status Filter Tabs */}
      <View className="px-6 pb-3">
        <FlatList
          horizontal
          data={statusTabs}
          keyExtractor={(item) => item.key}
          showsHorizontalScrollIndicator={false}
          inverted={isRTL}
          renderItem={({ item }) => (
            <Pressable
              onPress={() => handleStatusFilterChange(item.key)}
              className={`px-4 py-2 rounded-full mr-2 ${
                statusFilter === item.key
                  ? 'bg-primary-500'
                  : 'bg-background-100'
              }`}
            >
              <Text
                className={`font-medium ${
                  statusFilter === item.key
                    ? 'text-white'
                    : 'text-typography-700'
                }`}
              >
                {item.label}
              </Text>
            </Pressable>
          )}
        />
      </View>

      {/* Maid List */}
      {isLoading && page === 1 ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator size="large" color="#FF385C" />
        </View>
      ) : maids.length === 0 ? (
        <View className="flex-1 items-center justify-center px-6">
          <View className="w-20 h-20 rounded-full bg-background-100 items-center justify-center mb-4">
            <UserIcon size={40} color="#B0B0B0" />
          </View>
          <Text className="text-typography-400 text-center mb-4">
            {searchQuery || statusFilter !== 'all'
              ? t('search.noResults')
              : t('office.noMaidsAdded')}
          </Text>
          {!searchQuery && statusFilter === 'all' && (
            <Pressable
              onPress={handleAddMaid}
              className={`bg-primary-500 px-6 py-3 rounded-lg flex-row items-center ${isRTL ? 'flex-row-reverse' : ''}`}
            >
              <PlusIcon size={18} color="#FFFFFF" />
              <Text className={`text-white font-medium ${isRTL ? 'mr-1' : 'ml-1'}`}>{t('office.addMaid')}</Text>
            </Pressable>
          )}
        </View>
      ) : (
        <FlatList
          data={maids}
          keyExtractor={(item) => item.id}
          renderItem={renderMaidItem}
          contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={handleRefresh}
              tintColor="#FF385C"
            />
          }
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          ListFooterComponent={renderFooter}
        />
      )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
