import { View, Text, Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { storage } from '@/lib/storage';
import { authConfig } from '@/config';
import { ServiceCard } from '@/components';
import { ONBOARDING_SERVICES, type OnboardingServiceType, type ServiceFlow } from '@/constants';

export default function OnboardingScreen() {
  const { t, i18n } = useTranslation();
  const router = useRouter();

  const handleServiceSelect = async (id: OnboardingServiceType, flow: ServiceFlow) => {
    await Promise.all([
      storage.setItem('selected_service', id),
      storage.setItem('user_intent', flow),
    ]);

    const requireAuth = flow === 'customer' ? authConfig.requireCustomerAuth : authConfig.requireOfficeAuth;
    router.replace(requireAuth ? '/login' : flow === 'customer' ? '/(customer)?initFilter=true' : '/(office)');
  };

  const row1 = ONBOARDING_SERVICES.slice(0, 2);
  const row2 = ONBOARDING_SERVICES.slice(2, 4);

  return (
    <View style={{ flex: 1, backgroundColor: '#F8F8F8' }}>
      <SafeAreaView style={{ flex: 1, paddingHorizontal: 16 }}>
        <View style={{ flex: 1, justifyContent: 'center' }}>
          <Text style={{ fontSize: 26, fontWeight: '700', color: '#111', textAlign: 'center' }}>
            أنا أبحث عن
          </Text>
          <Text style={{ fontSize: 22, color: '#000', marginBottom: 24, textAlign: 'center', marginTop: 4, fontWeight: '500' }}>
            I am looking for
          </Text>

          <View style={{ flexDirection: 'row' }}>
            {row1.map((s) => (
              <ServiceCard
                key={s.id}
                icon={s.icon}
                titleAr={s.titleAr}
                titleEn={s.titleEn}
                onPress={() => handleServiceSelect(s.id, s.flow)}
              />
            ))}
          </View>

          <View style={{ flexDirection: 'row' }}>
            {row2.map((s) => (
              <ServiceCard
                key={s.id}
                icon={s.icon}
                titleAr={s.titleAr}
                titleEn={s.titleEn}
                onPress={() => handleServiceSelect(s.id, s.flow)}
              />
            ))}
          </View>
        </View>

        {!authConfig.guestModeEnabled && (
          <Pressable
            onPress={() => router.replace('/login')}
            style={{
              flexDirection: i18n.language === 'ar' ? 'row-reverse' : 'row',
              alignItems: 'center',
              justifyContent: 'center',
              paddingBottom: 24,
            }}
          >
            <Text style={{ color: '#666', fontSize: 14 }}>{t('login.haveAccount')}</Text>
            <Text style={{ color: '#0066CC', fontWeight: '600', fontSize: 14, marginLeft: i18n.language === 'ar' ? 0 : 6, marginRight: i18n.language === 'ar' ? 6 : 0 }}>
              {t('auth.login')}
            </Text>
          </Pressable>
        )}
      </SafeAreaView>
    </View>
  );
}
