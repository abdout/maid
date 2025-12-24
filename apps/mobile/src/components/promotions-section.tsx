import React from 'react';
import { View, Text, Pressable } from 'react-native';
import { useTranslation } from 'react-i18next';
import { GiftIcon, UsersIcon } from './icons';

interface Promotion {
  id: string;
  titleKey: string;
  descKey: string;
  icon: React.ComponentType<{ size: number; color: string }>;
  bgColor: string;
  iconBgColor: string;
}

const PROMOTIONS: Promotion[] = [
  {
    id: 'firstBooking',
    titleKey: 'promotions.firstBooking',
    descKey: 'promotions.firstBookingDesc',
    icon: GiftIcon,
    bgColor: 'bg-primary-50',
    iconBgColor: 'bg-primary-100',
  },
  {
    id: 'referFriend',
    titleKey: 'promotions.referFriend',
    descKey: 'promotions.referFriendDesc',
    icon: UsersIcon,
    bgColor: 'bg-success-50',
    iconBgColor: 'bg-success-100',
  },
];

interface PromotionsSectionProps {
  onPromoPress?: (promoId: string) => void;
}

export function PromotionsSection({ onPromoPress }: PromotionsSectionProps) {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';

  return (
    <View className="py-4 px-6">
      <Text
        className={`text-lg font-semibold text-typography-900 mb-3 ${isRTL ? 'text-right' : 'text-left'}`}
      >
        {t('home.promotions')}
      </Text>

      <View className={`flex-row gap-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
        {PROMOTIONS.map((promo) => {
          const IconComponent = promo.icon;

          return (
            <Pressable
              key={promo.id}
              onPress={() => onPromoPress?.(promo.id)}
              className={`flex-1 ${promo.bgColor} rounded-xl p-4`}
            >
              <View
                className={`${promo.iconBgColor} w-10 h-10 rounded-full items-center justify-center mb-3`}
              >
                <IconComponent size={20} color="#222222" />
              </View>
              <Text
                className={`text-sm font-semibold text-typography-900 mb-1 ${isRTL ? 'text-right' : 'text-left'}`}
              >
                {t(promo.titleKey)}
              </Text>
              <Text
                className={`text-xs text-typography-500 ${isRTL ? 'text-right' : 'text-left'}`}
              >
                {t(promo.descKey)}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

export default PromotionsSection;
