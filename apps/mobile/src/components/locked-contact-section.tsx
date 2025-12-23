import { View, Text, Pressable, ActivityIndicator } from 'react-native';
import { useTranslation } from 'react-i18next';
import { LockClosedIcon } from '@/components/icons';

interface LockedContactSectionProps {
  price: number;
  currency: string;
  isUnlocking?: boolean;
  onUnlock: () => void;
}

export function LockedContactSection({
  price,
  currency,
  isUnlocking = false,
  onUnlock,
}: LockedContactSectionProps) {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';

  return (
    <View className="mt-6 p-4 bg-background-50 rounded-xl border border-background-200">
      <View className={`flex-row items-center mb-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
        <View className="w-10 h-10 rounded-full bg-primary-100 items-center justify-center">
          <LockClosedIcon size={20} color="#FF385C" />
        </View>
        <View className={`flex-1 ${isRTL ? 'mr-3' : 'ml-3'}`}>
          <Text className={`text-typography-900 font-semibold ${isRTL ? 'text-right' : ''}`}>
            {t('payment.contactLocked')}
          </Text>
          <Text className={`text-typography-500 text-sm ${isRTL ? 'text-right' : ''}`}>
            {t('payment.unlockDescription')}
          </Text>
        </View>
      </View>

      <View className="border-t border-background-200 pt-3 mt-1">
        <View className={`flex-row items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}>
          <View>
            <Text className={`text-typography-500 text-xs ${isRTL ? 'text-right' : ''}`}>
              {t('payment.unlockPrice')}
            </Text>
            <Text className="text-2xl font-bold text-primary-600">
              {price.toLocaleString()} {currency}
            </Text>
          </View>

          <Pressable
            onPress={onUnlock}
            disabled={isUnlocking}
            className={`px-6 py-3 rounded-xl flex-row items-center ${
              isUnlocking ? 'bg-primary-300' : 'bg-primary-500'
            } ${isRTL ? 'flex-row-reverse' : ''}`}
          >
            {isUnlocking ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <>
                <LockClosedIcon size={16} color="#FFFFFF" />
                <Text className={`text-white font-semibold ${isRTL ? 'mr-2' : 'ml-2'}`}>
                  {t('payment.unlockCv')}
                </Text>
              </>
            )}
          </Pressable>
        </View>
      </View>
    </View>
  );
}
