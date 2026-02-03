import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  ImageBackground,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { authApi } from '@/lib/api';
import { useAuth } from '@/store/auth';
import { useToast } from '@/hooks';
import { LinearGradient } from 'expo-linear-gradient';

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

export default function SignupScreen() {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const { login } = useAuth();
  const toast = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const isRTL = i18n.language === 'ar';

  const passwordStrength = getPasswordStrength(password);

  const handleSignup = async () => {
    if (!email || !password || !confirmPassword) {
      toast.error(t('validation.fillRequiredFields'));
      return;
    }

    if (password !== confirmPassword) {
      toast.error(t('validation.passwordMismatch'));
      return;
    }

    if (password.length < 8) {
      toast.error(t('validation.minLength', { min: 8 }));
      return;
    }

    setLoading(true);
    try {
      const result = await authApi.register(
        email.trim().toLowerCase(),
        password,
        name.trim() || undefined
      );

      if (result.success && result.data) {
        await login({
          tokens: {
            accessToken: result.data.accessToken,
            refreshToken: result.data.refreshToken || '',
            expiresIn: result.data.expiresIn || 900,
          },
          user: {
            id: result.data.user.id,
            phone: result.data.user.phone,
            email: result.data.user.email,
            name: result.data.user.name,
            role: result.data.user.role as 'customer' | 'office_admin' | 'super_admin',
            officeId: result.data.user.officeId,
            createdAt: new Date(),
          },
        });

        // Route based on user role
        if (result.data.user.role === 'office_admin' && result.data.user.officeId) {
          router.replace('/(office)/maids');
        } else {
          router.replace('/');
        }
      } else {
        toast.error(isRTL ? 'فشل إنشاء الحساب' : 'Failed to create account');
      }
    } catch (error) {
      console.error('Signup error:', error);
      const message = error instanceof Error ? error.message : 'Signup failed';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const toggleLanguage = () => {
    const newLang = i18n.language === 'ar' ? 'en' : 'ar';
    i18n.changeLanguage(newLang);
  };

  const canSubmit = email && password && confirmPassword && password.length >= 8 && !loading;

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
                    {t('signup.title')}
                  </Text>
                  <Text className="text-white/70 text-base mb-8">
                    {t('signup.subtitle')}
                  </Text>

                  {/* Name Input (Optional) */}
                  <TextInput
                    value={name}
                    onChangeText={setName}
                    placeholder={t('signup.namePlaceholder')}
                    autoCapitalize="words"
                    autoComplete="name"
                    className={`bg-white/10 border border-white/30 rounded-t-xl px-4 py-4 text-white text-base ${isRTL ? 'text-right' : 'text-left'}`}
                    placeholderTextColor="rgba(255,255,255,0.5)"
                  />

                  {/* Email Input */}
                  <TextInput
                    value={email}
                    onChangeText={setEmail}
                    placeholder={t('signup.emailPlaceholder')}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoComplete="email"
                    className={`bg-white/10 border border-t-0 border-white/30 px-4 py-4 text-white text-base ${isRTL ? 'text-right' : 'text-left'}`}
                    placeholderTextColor="rgba(255,255,255,0.5)"
                  />

                  {/* Password Input */}
                  <TextInput
                    value={password}
                    onChangeText={setPassword}
                    placeholder={t('signup.passwordPlaceholder')}
                    secureTextEntry
                    autoCapitalize="none"
                    autoComplete="new-password"
                    className={`bg-white/10 border border-t-0 border-white/30 px-4 py-4 text-white text-base ${isRTL ? 'text-right' : 'text-left'}`}
                    placeholderTextColor="rgba(255,255,255,0.5)"
                  />

                  {/* Confirm Password Input */}
                  <TextInput
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                    placeholder={t('signup.confirmPasswordPlaceholder')}
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

                  {/* Sign Up Button */}
                  <Pressable
                    onPress={handleSignup}
                    disabled={!canSubmit}
                    className={`py-4 rounded-xl items-center mt-4 mb-6 ${
                      canSubmit ? 'bg-[#FF385C]' : 'bg-[#FF385C]/50'
                    }`}
                  >
                    <Text className="text-white font-semibold text-base">
                      {loading ? t('signup.loading') : t('signup.button')}
                    </Text>
                  </Pressable>

                  {/* Login Link */}
                  <View className="flex-row items-center justify-center">
                    <Text className="text-white/60 text-sm">
                      {t('signup.haveAccount')}{' '}
                    </Text>
                    <Pressable onPress={() => router.push('/login')}>
                      <Text className="text-[#FF385C] font-semibold text-sm">
                        {t('signup.loginLink')}
                      </Text>
                    </Pressable>
                  </View>

                  {/* Terms */}
                  <Text className="text-center text-white/50 text-xs mt-6 leading-relaxed">
                    {t('login.terms')}
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
