import { useState, useEffect } from 'react';
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
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { authApi } from '@/lib/api';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

type PasswordStrength = 'weak' | 'fair' | 'good' | 'strong';

function getPasswordStrength(password: string): PasswordStrength {
  if (!password || password.length < 8) return 'weak';

  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[a-z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  if (score <= 2) return 'weak';
  if (score <= 3) return 'fair';
  if (score <= 4) return 'good';
  return 'strong';
}

function getStrengthColor(strength: PasswordStrength): string {
  switch (strength) {
    case 'weak': return '#ef4444';
    case 'fair': return '#f59e0b';
    case 'good': return '#22c55e';
    case 'strong': return '#10b981';
  }
}

function getStrengthWidth(strength: PasswordStrength): `${number}%` {
  switch (strength) {
    case 'weak': return '25%';
    case 'fair': return '50%';
    case 'good': return '75%';
    case 'strong': return '100%';
  }
}

export default function ResetPasswordScreen() {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const params = useLocalSearchParams<{ token?: string }>();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [invalidToken, setInvalidToken] = useState(false);
  const isRTL = i18n.language === 'ar';

  const token = params.token;
  const passwordStrength = getPasswordStrength(password);

  useEffect(() => {
    if (!token) {
      setInvalidToken(true);
    }
  }, [token]);

  const handleSubmit = async () => {
    if (!token) {
      setInvalidToken(true);
      return;
    }

    if (!password || !confirmPassword) {
      Alert.alert(
        isRTL ? 'خطأ' : 'Error',
        isRTL ? 'الرجاء ملء جميع الحقول' : 'Please fill in all fields'
      );
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert(
        isRTL ? 'خطأ' : 'Error',
        t('resetPassword.passwordMismatch')
      );
      return;
    }

    if (password.length < 8) {
      Alert.alert(
        isRTL ? 'خطأ' : 'Error',
        isRTL ? 'كلمة المرور يجب أن تكون 8 أحرف على الأقل' : 'Password must be at least 8 characters'
      );
      return;
    }

    setLoading(true);
    try {
      const result = await authApi.resetPassword(token, password);

      if (result.success) {
        setSuccess(true);
      } else {
        setInvalidToken(true);
      }
    } catch (error) {
      console.error('Reset password error:', error);
      const message = error instanceof Error ? error.message : '';
      if (message.includes('expired') || message.includes('invalid')) {
        setInvalidToken(true);
      } else {
        Alert.alert(
          isRTL ? 'خطأ' : 'Error',
          isRTL ? 'فشل إعادة تعيين كلمة المرور' : 'Failed to reset password'
        );
      }
    } finally {
      setLoading(false);
    }
  };

  const toggleLanguage = () => {
    const newLang = i18n.language === 'ar' ? 'en' : 'ar';
    i18n.changeLanguage(newLang);
  };

  const handleGoToLogin = () => {
    router.replace('/login');
  };

  const canSubmit = password && confirmPassword && password.length >= 8 && !loading;

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
              {/* Header with language toggle */}
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
                  {invalidToken ? (
                    // Invalid Token State
                    <>
                      <View className="items-center mb-6">
                        <View className="w-20 h-20 bg-red-500/20 rounded-full items-center justify-center mb-4">
                          <Ionicons name="alert-circle-outline" size={40} color="#ef4444" />
                        </View>
                        <Text className="text-3xl font-bold text-white mb-2 text-center">
                          {isRTL ? 'رابط غير صالح' : 'Invalid Link'}
                        </Text>
                        <Text className="text-white/70 text-base text-center">
                          {t('resetPassword.invalidToken')}
                        </Text>
                      </View>

                      <Pressable
                        onPress={handleGoToLogin}
                        className="py-4 rounded-xl items-center bg-[#FF385C]"
                      >
                        <Text className="text-white font-semibold text-base">
                          {t('forgotPassword.backToLogin')}
                        </Text>
                      </Pressable>
                    </>
                  ) : success ? (
                    // Success State
                    <>
                      <View className="items-center mb-6">
                        <View className="w-20 h-20 bg-green-500/20 rounded-full items-center justify-center mb-4">
                          <Ionicons name="checkmark-circle-outline" size={40} color="#22c55e" />
                        </View>
                        <Text className="text-3xl font-bold text-white mb-2 text-center">
                          {t('resetPassword.success')}
                        </Text>
                        <Text className="text-white/70 text-base text-center">
                          {t('resetPassword.successSubtitle')}
                        </Text>
                      </View>

                      <Pressable
                        onPress={handleGoToLogin}
                        className="py-4 rounded-xl items-center bg-[#FF385C]"
                      >
                        <Text className="text-white font-semibold text-base">
                          {t('resetPassword.loginNow')}
                        </Text>
                      </Pressable>
                    </>
                  ) : (
                    // Form State
                    <>
                      {/* Title */}
                      <Text className="text-3xl font-bold text-white mb-2">
                        {t('resetPassword.title')}
                      </Text>
                      <Text className="text-white/70 text-base mb-8">
                        {t('resetPassword.subtitle')}
                      </Text>

                      {/* Password Input */}
                      <TextInput
                        value={password}
                        onChangeText={setPassword}
                        placeholder={t('resetPassword.passwordPlaceholder')}
                        secureTextEntry
                        autoCapitalize="none"
                        autoComplete="new-password"
                        className={`bg-white/10 border border-white/30 rounded-t-xl px-4 py-4 text-white text-base ${isRTL ? 'text-right' : 'text-left'}`}
                        placeholderTextColor="rgba(255,255,255,0.5)"
                      />

                      {/* Confirm Password Input */}
                      <TextInput
                        value={confirmPassword}
                        onChangeText={setConfirmPassword}
                        placeholder={t('resetPassword.confirmPlaceholder')}
                        secureTextEntry
                        autoCapitalize="none"
                        autoComplete="new-password"
                        className={`bg-white/10 border border-t-0 border-white/30 rounded-b-xl px-4 py-4 text-white text-base ${isRTL ? 'text-right' : 'text-left'}`}
                        placeholderTextColor="rgba(255,255,255,0.5)"
                      />

                      {/* Password Strength Indicator */}
                      {password.length > 0 && (
                        <View className="mt-3 mb-4">
                          <View className="flex-row items-center justify-between mb-1">
                            <Text className="text-white/60 text-xs">
                              {isRTL ? 'قوة كلمة المرور' : 'Password strength'}
                            </Text>
                            <Text
                              style={{ color: getStrengthColor(passwordStrength) }}
                              className="text-xs font-medium"
                            >
                              {t(`signup.passwordStrength.${passwordStrength}`)}
                            </Text>
                          </View>
                          <View className="h-1 bg-white/20 rounded-full overflow-hidden">
                            <View
                              style={{
                                width: getStrengthWidth(passwordStrength),
                                backgroundColor: getStrengthColor(passwordStrength),
                              }}
                              className="h-full rounded-full"
                            />
                          </View>
                        </View>
                      )}

                      {/* Submit Button */}
                      <Pressable
                        onPress={handleSubmit}
                        disabled={!canSubmit}
                        className={`py-4 rounded-xl items-center mt-4 mb-6 ${
                          canSubmit ? 'bg-[#FF385C]' : 'bg-[#FF385C]/50'
                        }`}
                      >
                        <Text className="text-white font-semibold text-base">
                          {loading ? t('resetPassword.loading') : t('resetPassword.button')}
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
