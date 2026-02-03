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
import { Ionicons } from '@expo/vector-icons';

export default function ForgotPasswordScreen() {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [devToken, setDevToken] = useState<string | null>(null);
  const isRTL = i18n.language === 'ar';

  const handleSubmit = async () => {
    if (!email) {
      Alert.alert(
        isRTL ? 'خطأ' : 'Error',
        isRTL ? 'الرجاء إدخال البريد الإلكتروني' : 'Please enter your email'
      );
      return;
    }

    setLoading(true);
    try {
      const result = await authApi.forgotPassword(email.trim().toLowerCase());

      if (result.success) {
        setSuccess(true);
        // In dev mode, the API returns the token
        if (result.data?.token) {
          setDevToken(result.data.token);
        }
      }
    } catch (error) {
      console.error('Forgot password error:', error);
      // Always show success to prevent email enumeration
      setSuccess(true);
    } finally {
      setLoading(false);
    }
  };

  const toggleLanguage = () => {
    const newLang = i18n.language === 'ar' ? 'en' : 'ar';
    i18n.changeLanguage(newLang);
  };

  const handleBackToLogin = () => {
    router.push('/login');
  };

  const handleTestReset = () => {
    if (devToken) {
      router.push(`/reset-password?token=${devToken}`);
    }
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
              {/* Header with back button and language toggle */}
              <View className="flex-row justify-between items-center px-6 pt-2">
                <Pressable
                  onPress={handleBackToLogin}
                  className="p-2 -ml-2"
                >
                  <Ionicons
                    name={isRTL ? 'arrow-forward' : 'arrow-back'}
                    size={24}
                    color="white"
                  />
                </Pressable>
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
                  {success ? (
                    // Success State
                    <>
                      <View className="items-center mb-6">
                        <View className="w-20 h-20 bg-green-500/20 rounded-full items-center justify-center mb-4">
                          <Ionicons name="mail-outline" size={40} color="#22c55e" />
                        </View>
                        <Text className="text-3xl font-bold text-white mb-2 text-center">
                          {t('forgotPassword.success')}
                        </Text>
                        <Text className="text-white/70 text-base text-center">
                          {t('forgotPassword.successSubtitle')}
                        </Text>
                      </View>

                      {/* Dev Mode Token Display */}
                      {devToken && (
                        <View className="bg-yellow-500/20 border border-yellow-500/30 rounded-xl p-4 mb-6">
                          <Text className="text-yellow-500 font-medium text-sm mb-2">
                            {t('forgotPassword.devModeToken')}
                          </Text>
                          <Text
                            className="text-white/80 text-xs font-mono break-all"
                            selectable
                          >
                            {devToken.slice(0, 32)}...
                          </Text>
                          <Pressable
                            onPress={handleTestReset}
                            className="mt-3 py-2 bg-yellow-500/30 rounded-lg items-center"
                          >
                            <Text className="text-yellow-500 font-medium text-sm">
                              {isRTL ? 'اختبار إعادة التعيين' : 'Test Reset'}
                            </Text>
                          </Pressable>
                        </View>
                      )}

                      {/* Back to Login Button */}
                      <Pressable
                        onPress={handleBackToLogin}
                        className="py-4 rounded-xl items-center bg-[#FF385C]"
                      >
                        <Text className="text-white font-semibold text-base">
                          {t('forgotPassword.backToLogin')}
                        </Text>
                      </Pressable>
                    </>
                  ) : (
                    // Form State
                    <>
                      {/* Title */}
                      <Text className="text-3xl font-bold text-white mb-2">
                        {t('forgotPassword.title')}
                      </Text>
                      <Text className="text-white/70 text-base mb-8">
                        {t('forgotPassword.subtitle')}
                      </Text>

                      {/* Email Input */}
                      <TextInput
                        value={email}
                        onChangeText={setEmail}
                        placeholder={t('forgotPassword.emailPlaceholder')}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        autoComplete="email"
                        className={`bg-white/10 border border-white/30 rounded-xl px-4 py-4 text-white text-base mb-4 ${isRTL ? 'text-right' : 'text-left'}`}
                        placeholderTextColor="rgba(255,255,255,0.5)"
                      />

                      {/* Submit Button */}
                      <Pressable
                        onPress={handleSubmit}
                        disabled={loading || !email}
                        className={`py-4 rounded-xl items-center mb-6 ${
                          email && !loading ? 'bg-[#FF385C]' : 'bg-[#FF385C]/50'
                        }`}
                      >
                        <Text className="text-white font-semibold text-base">
                          {loading ? t('forgotPassword.loading') : t('forgotPassword.button')}
                        </Text>
                      </Pressable>

                      {/* Back to Login Link */}
                      <Pressable
                        onPress={handleBackToLogin}
                        className="items-center"
                      >
                        <Text className="text-[#FF385C] font-semibold text-sm">
                          {t('forgotPassword.backToLogin')}
                        </Text>
                      </Pressable>
                    </>
                  )}
                </View>
              </ScrollView>
            </KeyboardAvoidingView>
          </SafeAreaView>
        </LinearGradient>
      </ImageBackground>
    </View>
  );
}
