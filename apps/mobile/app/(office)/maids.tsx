import { useState } from 'react';
import {
  View,
  Text,
  Pressable,
  FlatList,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useOfficeMaids, useUpdateMaidStatus, useDeleteMaid } from '@/hooks';
import { MaidCard } from '@/components';
import { PlusIcon, PencilIcon, CheckIcon, UserIcon } from '@/components/icons';

export default function OfficeMaidsScreen() {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const isRTL = i18n.language === 'ar';

  const [page, setPage] = useState(1);
  const { data, isLoading, isRefetching, refetch } = useOfficeMaids({ page, pageSize: 20 });
  const updateStatus = useUpdateMaidStatus();
  const deleteMaid = useDeleteMaid();

  const maids = data?.data?.items || [];
  const total = data?.data?.total || 0;

  const handleAddMaid = () => {
    router.push('/(office)/create-maid');
  };

  const handleEditMaid = (id: string) => {
    router.push(`/(office)/edit-maid/${id}`);
  };

  const handleDeleteMaid = (id: string, name: string) => {
    Alert.alert(
      'Delete Maid',
      `Are you sure you want to delete ${name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteMaid.mutateAsync(id);
            } catch (error) {
              Alert.alert('Error', 'Failed to delete maid');
            }
          },
        },
      ]
    );
  };

  const handleStatusChange = async (id: string, currentStatus: string) => {
    const statuses = ['available', 'busy', 'reserved', 'inactive'];
    const currentIndex = statuses.indexOf(currentStatus);
    const nextStatus = statuses[(currentIndex + 1) % statuses.length];

    try {
      await updateStatus.mutateAsync({ id, status: nextStatus });
    } catch (error) {
      Alert.alert('Error', 'Failed to update status');
    }
  };

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
              {item.status === 'available' ? 'Set Busy' : 'Set Available'}
            </Text>
          </Pressable>
          <Pressable
            onPress={() => handleEditMaid(item.id)}
            className={`flex-1 py-3 items-center flex-row justify-center ${isRTL ? 'flex-row-reverse' : ''}`}
          >
            <PencilIcon size={16} color="#717171" />
            <Text className={`text-typography-700 font-medium ${isRTL ? 'mr-1' : 'ml-1'}`}>Edit</Text>
          </Pressable>
        </View>
      </View>
    </Pressable>
  );

  return (
    <SafeAreaView className="flex-1 bg-background-0" edges={['top']}>
      {/* Header */}
      <View className={`px-6 pt-4 pb-4 flex-row items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
        <View>
          <Text className={`text-2xl font-bold text-typography-900 ${isRTL ? 'text-right' : ''}`}>
            {t('office.maids')}
          </Text>
          <Text className="text-typography-500">{total} total</Text>
        </View>
        <Pressable
          onPress={handleAddMaid}
          className={`bg-primary-500 px-4 py-2 rounded-lg flex-row items-center ${isRTL ? 'flex-row-reverse' : ''}`}
        >
          <PlusIcon size={18} color="#FFFFFF" />
          <Text className={`text-white font-medium ${isRTL ? 'mr-1' : 'ml-1'}`}>{t('office.addMaid')}</Text>
        </Pressable>
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
            No maids added yet
          </Text>
          <Pressable
            onPress={handleAddMaid}
            className={`bg-primary-500 px-6 py-3 rounded-lg flex-row items-center ${isRTL ? 'flex-row-reverse' : ''}`}
          >
            <PlusIcon size={18} color="#FFFFFF" />
            <Text className={`text-white font-medium ${isRTL ? 'mr-1' : 'ml-1'}`}>{t('office.addMaid')}</Text>
          </Pressable>
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
              onRefresh={refetch}
              tintColor="#FF385C"
            />
          }
        />
      )}
    </SafeAreaView>
  );
}
