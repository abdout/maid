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
import { useAuth } from '@/store/auth';
import { LinearGradient } from 'expo-linear-gradient';
import { Image } from 'react-native';

export default function LoginScreen() {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const isRTL = i18n.language === 'ar';

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert(
        isRTL ? 'خطأ' : 'Error',
        isRTL ? 'الرجاء إدخال البريد الإلكتروني وكلمة المرور' : 'Please enter email and password'
      );
      return;
    }

    setLoading(true);
    try {
      const result = await authApi.login(email, password);
      if (result.success && result.data) {
        await login({
          token: result.data.token,
          user: {
            id: result.data.user.id,
            phone: null,
            email: result.data.user.email,
            name: result.data.user.name,
            role: result.data.user.role as 'customer' | 'office_admin' | 'super_admin',
            officeId: result.data.user.officeId,
            createdAt: new Date(),
          },
        });
        router.replace('/');
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Login failed';
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
                      ? 'سجل الدخول للمتابعة'
                      : 'Log in to continue'}
                  </Text>

                  {/* Email Input */}
                  <View className="bg-white/10 border border-white/30 rounded-t-xl px-4 py-3">
                    <Text className="text-white/60 text-xs mb-1">
                      {isRTL ? 'البريد الإلكتروني' : 'Email'}
                    </Text>
                    <TextInput
                      value={email}
                      onChangeText={setEmail}
                      placeholder={isRTL ? 'أدخل بريدك الإلكتروني' : 'Enter your email'}
                      keyboardType="email-address"
                      autoCapitalize="none"
                      autoComplete="email"
                      className={`text-white text-base ${isRTL ? 'text-right' : 'text-left'}`}
                      placeholderTextColor="rgba(255,255,255,0.4)"
                    />
                  </View>

                  {/* Password Input */}
                  <View className="bg-white/10 border border-t-0 border-white/30 rounded-b-xl px-4 py-3 mb-4">
                    <Text className="text-white/60 text-xs mb-1">
                      {isRTL ? 'كلمة المرور' : 'Password'}
                    </Text>
                    <TextInput
                      value={password}
                      onChangeText={setPassword}
                      placeholder={isRTL ? 'أدخل كلمة المرور' : 'Enter your password'}
                      secureTextEntry
                      autoCapitalize="none"
                      autoComplete="password"
                      className={`text-white text-base ${isRTL ? 'text-right' : 'text-left'}`}
                      placeholderTextColor="rgba(255,255,255,0.4)"
                    />
                  </View>

                  {/* Dev hint */}
                  <Text className="text-white/40 text-xs mb-4">
                    {isRTL
                      ? 'للاختبار: customer@hotmail.com / 1234'
                      : 'For testing: customer@hotmail.com / 1234'}
                  </Text>

                  {/* Login Button */}
                  <Pressable
                    onPress={handleLogin}
                    disabled={loading || !email || !password}
                    className={`py-4 rounded-xl items-center mb-6 ${
                      email && password && !loading
                        ? 'bg-[#FF385C]'
                        : 'bg-[#FF385C]/50'
                    }`}
                  >
                    <Text className="text-white font-semibold text-base">
                      {loading
                        ? isRTL ? 'جاري الدخول...' : 'Logging in...'
                        : isRTL ? 'تسجيل الدخول' : 'Login'}
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
