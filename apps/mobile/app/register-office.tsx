import { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TextInput,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, Stack } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useMutation } from '@tanstack/react-query';
import { officesApi } from '@/lib/api';
import { useAuth } from '@/store/auth';

export default function RegisterOfficeScreen() {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const { user } = useAuth();
  const isRTL = i18n.language === 'ar';

  const [form, setForm] = useState({
    name: '',
    nameAr: '',
    phone: user?.phone || '',
    email: '',
    address: '',
    addressAr: '',
  });

  const registerMutation = useMutation({
    mutationFn: () => officesApi.register(form),
    onSuccess: () => {
      Alert.alert(
        'Success',
        'Office registered successfully! Please login again to access your office dashboard.',
        [
          {
            text: 'OK',
            onPress: () => router.replace('/login'),
          },
        ]
      );
    },
    onError: (error: Error) => {
      Alert.alert('Error', error.message || 'Failed to register office');
    },
  });

  const handleSubmit = () => {
    if (!form.name.trim()) {
      Alert.alert('Error', 'Office name is required');
      return;
    }
    if (!form.phone.trim()) {
      Alert.alert('Error', 'Phone number is required');
      return;
    }
    registerMutation.mutate();
  };

  const isValid = form.name.trim() && form.phone.trim();

  return (
    <SafeAreaView className="flex-1 bg-background-0">
      <Stack.Screen
        options={{
          headerShown: true,
          title: 'Register Office',
          headerLeft: () => (
            <Pressable onPress={() => router.back()}>
              <Text className="text-primary-500 text-lg">{t('common.cancel')}</Text>
            </Pressable>
          ),
        }}
      />

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView className="flex-1 px-6" showsVerticalScrollIndicator={false}>
          {/* Header */}
          <View className="py-6">
            <Text className="text-4xl mb-2">🏢</Text>
            <Text className={`text-2xl font-bold text-typography-900 ${isRTL ? 'text-right' : ''}`}>
              Register Your Office
            </Text>
            <Text className={`text-typography-500 mt-2 ${isRTL ? 'text-right' : ''}`}>
              Create an account to list and manage your maids
            </Text>
          </View>

          {/* Form */}
          <View className="mb-6">
            <Text className={`text-typography-700 mb-2 font-medium ${isRTL ? 'text-right' : ''}`}>
              Office Name (English) *
            </Text>
            <TextInput
              value={form.name}
              onChangeText={(v) => setForm((f) => ({ ...f, name: v }))}
              placeholder="Your office name"
              className="bg-background-50 rounded-xl px-4 py-4 text-typography-900 border border-background-200"
            />
          </View>

          <View className="mb-6">
            <Text className={`text-typography-700 mb-2 font-medium ${isRTL ? 'text-right' : ''}`}>
              اسم المكتب (بالعربي)
            </Text>
            <TextInput
              value={form.nameAr}
              onChangeText={(v) => setForm((f) => ({ ...f, nameAr: v }))}
              placeholder="اسم المكتب"
              className="bg-background-50 rounded-xl px-4 py-4 text-typography-900 border border-background-200 text-right"
            />
          </View>

          <View className="mb-6">
            <Text className={`text-typography-700 mb-2 font-medium ${isRTL ? 'text-right' : ''}`}>
              Phone Number *
            </Text>
            <TextInput
              value={form.phone}
              onChangeText={(v) => setForm((f) => ({ ...f, phone: v }))}
              placeholder="+971 50 123 4567"
              keyboardType="phone-pad"
              className="bg-background-50 rounded-xl px-4 py-4 text-typography-900 border border-background-200"
            />
          </View>

          <View className="mb-6">
            <Text className={`text-typography-700 mb-2 font-medium ${isRTL ? 'text-right' : ''}`}>
              Email
            </Text>
            <TextInput
              value={form.email}
              onChangeText={(v) => setForm((f) => ({ ...f, email: v }))}
              placeholder="office@example.com"
              keyboardType="email-address"
              autoCapitalize="none"
              className="bg-background-50 rounded-xl px-4 py-4 text-typography-900 border border-background-200"
            />
          </View>

          <View className="mb-6">
            <Text className={`text-typography-700 mb-2 font-medium ${isRTL ? 'text-right' : ''}`}>
              Address
            </Text>
            <TextInput
              value={form.address}
              onChangeText={(v) => setForm((f) => ({ ...f, address: v }))}
              placeholder="Office address"
              multiline
              numberOfLines={3}
              className="bg-background-50 rounded-xl px-4 py-4 text-typography-900 border border-background-200 min-h-[80px]"
              textAlignVertical="top"
            />
          </View>

          <View className="mb-6">
            <Text className={`text-typography-700 mb-2 font-medium ${isRTL ? 'text-right' : ''}`}>
              العنوان (بالعربي)
            </Text>
            <TextInput
              value={form.addressAr}
              onChangeText={(v) => setForm((f) => ({ ...f, addressAr: v }))}
              placeholder="عنوان المكتب"
              multiline
              numberOfLines={3}
              className="bg-background-50 rounded-xl px-4 py-4 text-typography-900 border border-background-200 min-h-[80px] text-right"
              textAlignVertical="top"
            />
          </View>

          {/* Submit Button */}
          <Pressable
            onPress={handleSubmit}
            disabled={!isValid || registerMutation.isPending}
            className={`py-4 rounded-xl items-center mb-10 ${
              !isValid || registerMutation.isPending ? 'bg-primary-200' : 'bg-primary-500'
            }`}
          >
            <Text className="text-white font-semibold text-lg">
              {registerMutation.isPending ? t('common.loading') : 'Register Office'}
            </Text>
          </Pressable>

          {/* Info */}
          <View className="mb-10 p-4 bg-primary-50 rounded-xl">
            <Text className="text-primary-700 text-sm">
              After registration, your office will be reviewed by our team.
              You'll be able to start adding maids once verified.
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
