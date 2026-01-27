import { View, Text, Pressable, ImageBackground, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { storage } from '@/lib/storage';
import { LinearGradient } from 'expo-linear-gradient';
import { authConfig } from '@/config';
import { LanguageToggle } from '@/components';

const { width, height } = Dimensions.get('window');

export default function OnboardingScreen() {
  const { i18n } = useTranslation();
  const router = useRouter();
  const isRTL = i18n.language === 'ar';

  const handleComplete = async (type: 'customer' | 'office') => {
    await storage.setItem('user_intent', type);

    // Check if auth is required based on config
    const requireAuth = type === 'customer'
      ? authConfig.requireCustomerAuth
      : authConfig.requireOfficeAuth;

    if (requireAuth) {
      router.replace('/login');
    } else {
      // Go directly to the respective screen without auth
      router.replace(type === 'customer' ? '/(customer)?initFilter=true' : '/(office)');
    }
  };

  const handleLogin = async () => {
    router.replace('/login');
  };

  return (
    <View className="flex-1">
      <ImageBackground
        source={{ uri: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=1200&q=80' }}
        style={{ flex: 1 }}
        resizeMode="cover"
      >
        <LinearGradient
          colors={['transparent', 'rgba(0,0,0,0.3)', 'rgba(0,0,0,0.85)', 'rgba(0,0,0,0.95)']}
          locations={[0, 0.45, 0.7, 0.85]}
          style={{ flex: 1 }}
        >
          <SafeAreaView className="flex-1">
            {/* Language Toggle - Top left corner */}
            <View className="absolute top-4 left-4 z-10">
              <LanguageToggle variant="text" />
            </View>

            {/* Spacer - pushes content to bottom */}
            <View className="flex-1" />

            {/* Content at bottom */}
            <View className="pb-8 px-6 mx-4">
              {/* Headline */}
              <Text className="text-4xl font-bold text-white text-center leading-tight">
                {isRTL ? 'تطبيق واحد،' : 'One app,'}
              </Text>
              <Text className="text-4xl font-bold text-white text-center leading-tight mb-4">
                {isRTL ? 'كل العمال المنزليين' : 'all domestic workers'}
              </Text>

              {/* Subtitle */}
              <Text className="text-base text-white/70 text-center leading-relaxed mb-8 px-2">
                {isRTL
                  ? 'اختر خياراً للبدء. يمكنك إضافة حساب آخر في أي وقت.'
                  : 'Choose an option to get started. You can add another account at any time.'}
              </Text>

              {/* Merged Buttons with divider */}
              <View
                className={`flex-row border-2 border-white rounded-full overflow-hidden mb-6 ${isRTL ? 'flex-row-reverse' : ''}`}
              >
                {/* Customer Button */}
                <Pressable
                  onPress={() => handleComplete('customer')}
                  className="flex-1 py-4 items-center justify-center"
                >
                  <Text className="text-white font-semibold text-base">
                    {isRTL ? 'أبحث عن عاملة' : "I'm hiring"}
                  </Text>
                </Pressable>

                {/* Vertical Divider */}
                <View className="w-0.5 bg-white" />

                {/* Office Button */}
                <Pressable
                  onPress={() => handleComplete('office')}
                  className="flex-1 py-4 items-center justify-center"
                >
                  <Text className="text-white font-semibold text-base">
                    {isRTL ? 'أدرج عاملاتي' : "I'm an office"}
                  </Text>
                </Pressable>
              </View>

              {/* Login Link - only shown when auth is enabled */}
              {!authConfig.guestModeEnabled && (
                <View className="items-center pb-2">
                  <Pressable onPress={handleLogin} className="flex-row items-center">
                    <Text className="text-white/70 text-base">
                      {isRTL ? 'لديك حساب بالفعل؟' : 'Already have an account?'}
                    </Text>
                    <Text className="text-white font-semibold text-base ml-2 underline">
                      {isRTL ? 'تسجيل الدخول' : 'Log in'}
                    </Text>
                  </Pressable>
                </View>
              )}
            </View>
          </SafeAreaView>
        </LinearGradient>
      </ImageBackground>
    </View>
  );
}
