import { View, Text, Pressable, Linking } from 'react-native';
import { useTranslation } from 'react-i18next';
import { PhoneIcon, EmailIcon, MapPinIcon, CheckBadgeIcon } from '@/components/icons';

interface OfficeContactSectionProps {
  office: {
    name: string;
    phone: string | null;
    email: string | null;
    address: string | null;
    isVerified: boolean;
  };
}

export function OfficeContactSection({ office }: OfficeContactSectionProps) {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';

  const handleCall = () => {
    if (office.phone) {
      Linking.openURL(`tel:${office.phone}`);
    }
  };

  const handleEmail = () => {
    if (office.email) {
      Linking.openURL(`mailto:${office.email}`);
    }
  };

  const handleWhatsApp = () => {
    if (office.phone) {
      const phone = office.phone.replace(/[^0-9]/g, '');
      Linking.openURL(`https://wa.me/${phone}`);
    }
  };

  return (
    <View className="mt-6 p-4 bg-success-50 rounded-xl border border-success-200">
      <View className={`flex-row items-center mb-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
        <View className="w-12 h-12 rounded-full bg-success-100 items-center justify-center">
          <CheckBadgeIcon size={24} color="#16A34A" />
        </View>
        <View className={`flex-1 ${isRTL ? 'mr-3' : 'ml-3'}`}>
          <View className={`flex-row items-center ${isRTL ? 'flex-row-reverse' : ''}`}>
            <Text className={`text-typography-900 font-bold text-lg ${isRTL ? 'text-right' : ''}`}>
              {office.name}
            </Text>
            {office.isVerified && (
              <View className={`${isRTL ? 'mr-2' : 'ml-2'} px-2 py-0.5 bg-success-500 rounded-full`}>
                <Text className="text-white text-xs font-medium">{t('office.verified')}</Text>
              </View>
            )}
          </View>
          <Text className={`text-success-600 text-sm ${isRTL ? 'text-right' : ''}`}>
            {t('payment.contactUnlocked')}
          </Text>
        </View>
      </View>

      {/* Contact Details */}
      <View className="space-y-2">
        {office.phone && (
          <Pressable
            onPress={handleCall}
            className={`flex-row items-center p-3 bg-white rounded-lg ${isRTL ? 'flex-row-reverse' : ''}`}
          >
            <View className="w-9 h-9 rounded-full bg-success-100 items-center justify-center">
              <PhoneIcon size={18} color="#16A34A" />
            </View>
            <View className={`flex-1 ${isRTL ? 'mr-3' : 'ml-3'}`}>
              <Text className={`text-typography-500 text-xs ${isRTL ? 'text-right' : ''}`}>
                {t('profile.phone')}
              </Text>
              <Text className={`text-typography-900 font-medium ${isRTL ? 'text-right' : ''}`}>
                {office.phone}
              </Text>
            </View>
          </Pressable>
        )}

        {office.email && (
          <Pressable
            onPress={handleEmail}
            className={`flex-row items-center p-3 bg-white rounded-lg ${isRTL ? 'flex-row-reverse' : ''}`}
          >
            <View className="w-9 h-9 rounded-full bg-success-100 items-center justify-center">
              <EmailIcon size={18} color="#16A34A" />
            </View>
            <View className={`flex-1 ${isRTL ? 'mr-3' : 'ml-3'}`}>
              <Text className={`text-typography-500 text-xs ${isRTL ? 'text-right' : ''}`}>
                {t('profile.email')}
              </Text>
              <Text className={`text-typography-900 font-medium ${isRTL ? 'text-right' : ''}`}>
                {office.email}
              </Text>
            </View>
          </Pressable>
        )}

        {office.address && (
          <View className={`flex-row items-start p-3 bg-white rounded-lg ${isRTL ? 'flex-row-reverse' : ''}`}>
            <View className="w-9 h-9 rounded-full bg-success-100 items-center justify-center">
              <MapPinIcon size={18} color="#16A34A" />
            </View>
            <View className={`flex-1 ${isRTL ? 'mr-3' : 'ml-3'}`}>
              <Text className={`text-typography-500 text-xs ${isRTL ? 'text-right' : ''}`}>
                {t('office.address')}
              </Text>
              <Text className={`text-typography-900 font-medium ${isRTL ? 'text-right' : ''}`}>
                {office.address}
              </Text>
            </View>
          </View>
        )}
      </View>

      {/* Quick Actions */}
      {office.phone && (
        <View className={`flex-row gap-3 mt-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
          <Pressable
            onPress={handleCall}
            className="flex-1 py-3 bg-success-500 rounded-xl items-center"
          >
            <Text className="text-white font-semibold">{t('maid.contactOffice')}</Text>
          </Pressable>
          <Pressable
            onPress={handleWhatsApp}
            className="flex-1 py-3 bg-green-600 rounded-xl items-center"
          >
            <Text className="text-white font-semibold">WhatsApp</Text>
          </Pressable>
        </View>
      )}
    </View>
  );
}
