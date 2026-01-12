import { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ImageBackground,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { authApi } from '@/lib/api';
import { useAuth } from '@/store/auth';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path } from 'react-native-svg';

const OTP_LENGTH = 4;

// Back Arrow Icon
function BackArrowIcon({ color = '#fff' }: { color?: string }) {
  return (
    <Svg width={24} height={24} viewBox="0 0 24 24" fill="none">
      <Path
        d="M19 12H5M5 12L12 19M5 12L12 5"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}

export default function VerifyScreen() {
  const { i18n } = useTranslation();
  const router = useRouter();
  const { phone } = useLocalSearchParams<{ phone: string }>();
  const { login } = useAuth();
  const [otp, setOtp] = useState<string[]>(new Array(OTP_LENGTH).fill(''));
  const [loading, setLoading] = useState(false);
  const [resendTimer, setResendTimer] = useState(60);
  const inputRefs = useRef<TextInput[]>([]);
  const isRTL = i18n.language === 'ar';

  useEffect(() => {
    if (resendTimer > 0) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendTimer]);

  useEffect(() => {
    // Focus first input on mount
    inputRefs.current[0]?.focus();
  }, []);

  const handleOtpChange = (value: string, index: number) => {
    if (value.length > 1) {
      // Handle paste
      const pastedOtp = value.slice(0, OTP_LENGTH).split('');
      const newOtp = [...otp];
      pastedOtp.forEach((char, i) => {
        if (index + i < OTP_LENGTH) {
          newOtp[index + i] = char;
        }
      });
      setOtp(newOtp);
      const nextIndex = Math.min(index + pastedOtp.length, OTP_LENGTH - 1);
      inputRefs.current[nextIndex]?.focus();
    } else {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);

      if (value && index < OTP_LENGTH - 1) {
        inputRefs.current[index + 1]?.focus();
      }
    }
  };

  const handleKeyPress = (e: { nativeEvent: { key: string } }, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async () => {
    const code = otp.join('');
    if (code.length !== OTP_LENGTH) return;

    setLoading(true);
    try {
      const result = await authApi.verifyOtp(phone || '', code);

      if (result.success && result.data) {
        await login({
          tokens: {
            accessToken: result.data.accessToken,
            refreshToken: result.data.refreshToken,
            expiresIn: result.data.expiresIn,
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
        router.replace('/');
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Verification failed';
      Alert.alert(isRTL ? 'خطأ' : 'Error', message);
      // Clear OTP on error
      setOtp(new Array(OTP_LENGTH).fill(''));
      inputRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendTimer > 0) return;

    try {
      await authApi.requestOtp(phone || '');
      setResendTimer(60);
      Alert.alert(
        isRTL ? 'تم' : 'Success',
        isRTL ? 'تم إعادة إرسال الرمز' : 'OTP resent successfully'
      );
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to resend OTP';
      Alert.alert(isRTL ? 'خطأ' : 'Error', message);
    }
  };

  const isComplete = otp.every((digit) => digit !== '');

  // Format phone for display
  const displayPhone = phone || '';

  return (
    <View className="flex-1">
      <ImageBackground
        source={{ uri: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?w=1200&q=80' }}
        style={{ flex: 1 }}
        resizeMode="cover"
      >
        <LinearGradient
          colors={['rgba(0,0,0,0.4)', 'rgba(0,0,0,0.6)', 'rgba(0,0,0,0.9)', 'rgba(0,0,0,0.98)']}
          locations={[0, 0.2, 0.5, 0.7]}
          style={{ flex: 1 }}
        >
          <SafeAreaView className="flex-1">
            <KeyboardAvoidingView
              behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
              className="flex-1"
            >
              {/* Header with Back Button */}
              <View className="px-6 pt-2 flex-row items-center">
                <Pressable
                  onPress={() => router.back()}
                  className="p-2 -ml-2 flex-row items-center"
                  style={{ transform: [{ scaleX: isRTL ? -1 : 1 }] }}
                >
                  <BackArrowIcon />
                </Pressable>
              </View>

              {/* Spacer */}
              <View className="flex-1" />

              {/* Content */}
              <View className="px-6 mx-4 pb-8">
                {/* Title */}
                <Text className="text-3xl font-bold text-white mb-2">
                  {isRTL ? 'أدخل رمز التحقق' : 'Enter verification code'}
                </Text>
                <Text className="text-white/70 text-base mb-8">
                  {isRTL
                    ? `لقد أرسلنا رمز تحقق إلى ${displayPhone}`
                    : `We sent a code to ${displayPhone}`}
                </Text>

                {/* OTP Input */}
                <View className={`flex-row justify-between mb-6 gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                  {otp.map((digit, index) => (
                    <TextInput
                      key={index}
                      ref={(ref) => {
                        if (ref) inputRefs.current[index] = ref;
                      }}
                      value={digit}
                      onChangeText={(value) => handleOtpChange(value, index)}
                      onKeyPress={(e) => handleKeyPress(e, index)}
                      keyboardType="number-pad"
                      maxLength={1}
                      selectTextOnFocus
                      className={`flex-1 h-14 bg-white/10 border-2 rounded-xl text-center text-2xl text-white ${
                        digit ? 'border-[#FF385C]' : 'border-white/30'
                      }`}
                    />
                  ))}
                </View>

                {/* Resend */}
                <View className="items-center mb-6">
                  {resendTimer > 0 ? (
                    <Text className="text-white/60">
                      {isRTL
                        ? `إعادة الإرسال بعد ${resendTimer} ثانية`
                        : `Resend code in ${resendTimer}s`}
                    </Text>
                  ) : (
                    <Pressable onPress={handleResend}>
                      <Text className="text-[#FF385C] font-medium">
                        {isRTL ? 'إعادة إرسال الرمز' : 'Resend code'}
                      </Text>
                    </Pressable>
                  )}
                </View>

                {/* Verify Button */}
                <Pressable
                  onPress={handleVerify}
                  disabled={loading || !isComplete}
                  className={`py-4 rounded-xl items-center ${
                    isComplete && !loading ? 'bg-[#FF385C]' : 'bg-[#FF385C]/50'
                  }`}
                >
                  <Text className="text-white font-semibold text-base">
                    {loading
                      ? isRTL ? 'جاري التحقق...' : 'Verifying...'
                      : isRTL ? 'تحقق' : 'Verify'}
                  </Text>
                </Pressable>

                {/* Dev hint */}
                <Text className="text-center text-white/40 text-xs mt-6">
                  {isRTL
                    ? 'للاختبار، استخدم الرمز: 1234'
                    : 'For testing, use code: 1234'}
                </Text>
              </View>
            </KeyboardAvoidingView>
          </SafeAreaView>
        </LinearGradient>
      </ImageBackground>
    </View>
  );
}
