import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ImageBackground,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { authApi } from '@/lib/api';
import { LinearGradient } from 'expo-linear-gradient';
import { Image } from 'react-native';

// Country codes for UAE region
const countryCodes = [
  { code: '+971', country: 'UAE', flag: 'AE' },
  { code: '+966', country: 'KSA', flag: 'SA' },
  { code: '+974', country: 'Qatar', flag: 'QA' },
  { code: '+973', country: 'Bahrain', flag: 'BH' },
  { code: '+968', country: 'Oman', flag: 'OM' },
  { code: '+965', country: 'Kuwait', flag: 'KW' },
  { code: '+91', country: 'India', flag: 'IN' },
  { code: '+92', country: 'Pakistan', flag: 'PK' },
  { code: '+63', country: 'Philippines', flag: 'PH' },
];

export default function LoginScreen() {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const [phone, setPhone] = useState('');
  const [selectedCountry, setSelectedCountry] = useState(countryCodes[0]);
  const [showCountryPicker, setShowCountryPicker] = useState(false);
  const [loading, setLoading] = useState(false);
  const isRTL = i18n.language === 'ar';

  const handleRequestOtp = async () => {
    if (!phone || phone.length < 7) {
      Alert.alert(
        isRTL ? 'خطأ' : 'Error',
        isRTL ? 'الرجاء إدخال رقم هاتف صالح' : 'Please enter a valid phone number'
      );
      return;
    }

    const fullPhone = `${selectedCountry.code}${phone}`;
    setLoading(true);
    try {
      await authApi.requestOtp(fullPhone);
      router.push({
        pathname: '/verify',
        params: { phone: fullPhone },
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to send OTP';
      Alert.alert(isRTL ? 'خطأ' : 'Error', message);
    } finally {
      setLoading(false);
    }
  };

  const handleSocialLogin = (provider: 'google' | 'apple') => {
    Alert.alert(
      isRTL ? 'قريباً' : 'Coming Soon',
      isRTL
        ? `تسجيل الدخول عبر ${provider === 'google' ? 'جوجل' : 'أبل'} سيكون متاحاً قريباً`
        : `${provider === 'google' ? 'Google' : 'Apple'} sign-in coming soon`
    );
  };

  const toggleLanguage = () => {
    const newLang = i18n.language === 'ar' ? 'en' : 'ar';
    i18n.changeLanguage(newLang);
  };

  return (
    <View className="flex-1">
      <ImageBackground
        source={{ uri: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=1200&q=80' }}
        style={{ flex: 1 }}
        resizeMode="cover"
        blurRadius={Platform.OS === 'ios' ? 8 : 4}
      >
        <LinearGradient
          colors={['rgba(0,0,0,0.3)', 'rgba(0,0,0,0.5)', 'rgba(0,0,0,0.85)', 'rgba(0,0,0,0.98)']}
          locations={[0, 0.25, 0.55, 0.75]}
          style={{ flex: 1 }}
        >
          <SafeAreaView className="flex-1">
            <KeyboardAvoidingView
              behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
              className="flex-1"
            >
              {/* Language Toggle */}
              <View className="flex-row justify-end px-6 pt-2">
                <Pressable
                  onPress={toggleLanguage}
                  className="px-4 py-2 bg-white/10 rounded-full flex-row items-center"
                >
                  <Text className="text-white font-medium">
                    {i18n.language === 'ar' ? 'English' : 'العربية'}
                  </Text>
                </Pressable>
              </View>

              {/* Spacer */}
              <View className="flex-1" />

              {/* Content */}
              <ScrollView
                className="flex-none"
                contentContainerStyle={{ paddingBottom: 32 }}
                keyboardShouldPersistTaps="handled"
              >
                <View className="px-6 mx-4">
                  {/* Welcome Text */}
                  <Text className="text-3xl font-bold text-white mb-2">
                    {isRTL ? 'مرحباً بك' : 'Welcome'}
                  </Text>
                  <Text className="text-white/70 text-base mb-8">
                    {isRTL
                      ? 'سجل الدخول أو أنشئ حساب للمتابعة'
                      : 'Log in or sign up to continue'}
                  </Text>

                  {/* Phone Input Section */}
                  <View className="mb-4">
                    {/* Country Selector */}
                    <Pressable
                      onPress={() => setShowCountryPicker(!showCountryPicker)}
                      className="bg-white/10 border border-white/30 rounded-t-xl px-4 py-3 flex-row items-center justify-between"
                    >
                      <View>
                        <Text className="text-white/60 text-xs mb-1">
                          {isRTL ? 'الدولة / المنطقة' : 'Country/Region'}
                        </Text>
                        <View className="flex-row items-center">
                          <View className="w-8 h-5 bg-white/20 rounded items-center justify-center mr-2">
                            <Text className="text-white text-xs font-bold">{selectedCountry.flag}</Text>
                          </View>
                          <Text className="text-white text-base">
                            {selectedCountry.country} ({selectedCountry.code})
                          </Text>
                        </View>
                      </View>
                      <Text className="text-white text-lg">▼</Text>
                    </Pressable>

                    {/* Country Picker Dropdown */}
                    {showCountryPicker && (
                      <View className="bg-white/10 border-x border-white/30">
                        {countryCodes.map((country) => (
                          <Pressable
                            key={country.code}
                            onPress={() => {
                              setSelectedCountry(country);
                              setShowCountryPicker(false);
                            }}
                            className={`px-4 py-3 border-b border-white/10 flex-row items-center ${
                              selectedCountry.code === country.code ? 'bg-white/20' : ''
                            }`}
                          >
                            <View className="w-8 h-5 bg-white/20 rounded items-center justify-center mr-2">
                              <Text className="text-white text-xs font-bold">{country.flag}</Text>
                            </View>
                            <Text className="text-white text-base">
                              {country.country} ({country.code})
                            </Text>
                          </Pressable>
                        ))}
                      </View>
                    )}

                    {/* Phone Number Input */}
                    <View className="bg-white/10 border border-t-0 border-white/30 rounded-b-xl px-4 py-3">
                      <Text className="text-white/60 text-xs mb-1">
                        {isRTL ? 'رقم الهاتف' : 'Phone number'}
                      </Text>
                      <TextInput
                        value={phone}
                        onChangeText={setPhone}
                        placeholder={isRTL ? 'أدخل رقم الهاتف' : 'Enter phone number'}
                        keyboardType="phone-pad"
                        autoComplete="tel"
                        className={`text-white text-base ${isRTL ? 'text-right' : 'text-left'}`}
                        placeholderTextColor="rgba(255,255,255,0.4)"
                      />
                    </View>
                  </View>

                  {/* Help Text */}
                  <Text className="text-white/50 text-xs mb-4 leading-relaxed">
                    {isRTL
                      ? 'سنرسل لك رمز تحقق عبر رسالة نصية. قد تُطبق رسوم الرسائل.'
                      : "We'll text you to confirm your number. Standard message and data rates apply."}
                  </Text>

                  {/* Continue Button */}
                  <Pressable
                    onPress={handleRequestOtp}
                    disabled={loading || phone.length < 7}
                    className={`py-4 rounded-xl items-center mb-6 ${
                      phone.length >= 7 && !loading
                        ? 'bg-[#FF385C]'
                        : 'bg-[#FF385C]/50'
                    }`}
                  >
                    <Text className="text-white font-semibold text-base">
                      {loading
                        ? isRTL ? 'جاري الإرسال...' : 'Sending...'
                        : isRTL ? 'متابعة' : 'Continue'}
                    </Text>
                  </Pressable>

                  {/* Divider */}
                  <View className="flex-row items-center mb-6">
                    <View className="flex-1 h-px bg-white/30" />
                    <Text className="text-white/60 text-xs mx-4">
                      {isRTL ? 'أو' : 'or'}
                    </Text>
                    <View className="flex-1 h-px bg-white/30" />
                  </View>

                  {/* Social Login Buttons */}
                  <View className="space-y-3">
                    {/* Google Button */}
                    <Pressable
                      onPress={() => handleSocialLogin('google')}
                      className="flex-row items-center justify-center bg-white rounded-xl py-4 px-4 mb-3"
                    >
                      <Image
                        source={{ uri: 'https://developers.google.com/identity/images/g-logo.png' }}
                        style={{ width: 20, height: 20, marginRight: 8 }}
                        resizeMode="contain"
                      />
                      <Text className="text-gray-900 font-medium text-base">
                        {isRTL ? 'المتابعة عبر جوجل' : 'Continue with Google'}
                      </Text>
                    </Pressable>

                    {/* Apple Button */}
                    <Pressable
                      onPress={() => handleSocialLogin('apple')}
                      className="flex-row items-center justify-center bg-white rounded-xl py-4 px-4"
                    >
                      <Image
                        source={{ uri: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/fa/Apple_logo_black.svg/160px-Apple_logo_black.svg.png' }}
                        style={{ width: 18, height: 22, marginRight: 8 }}
                        resizeMode="contain"
                      />
                      <Text className="text-gray-900 font-medium text-base">
                        {isRTL ? 'المتابعة عبر أبل' : 'Continue with Apple'}
                      </Text>
                    </Pressable>
                  </View>

                  {/* Terms */}
                  <Text className="text-center text-white/50 text-xs mt-6 leading-relaxed">
                    {isRTL
                      ? 'بالمتابعة، أنت توافق على شروط الخدمة وسياسة الخصوصية'
                      : 'By continuing, you agree to our Terms of Service and Privacy Policy'}
                  </Text>
                </View>
              </ScrollView>
            </KeyboardAvoidingView>
          </SafeAreaView>
        </LinearGradient>
      </ImageBackground>
    </View>
  );
}
