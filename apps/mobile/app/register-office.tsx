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
  Modal,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, Stack } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useMutation } from '@tanstack/react-query';
import DateTimePicker from '@react-native-community/datetimepicker';
import { officesApi, authApi } from '@/lib/api';
import { useAuth } from '@/store/auth';
import { storage } from '@/lib/storage';
import { EMIRATES, getEmirateName } from '@/constants';
import { ChevronDownIcon, CalendarIcon } from '@/components/icons';

interface OfficeFormData {
  name: string;
  nameAr: string;
  licenseNumber: string;
  licenseExpiry: Date | null;
  emirate: string;
  address: string;
  addressAr: string;
  googleMapsUrl: string;
  managerPhone1: string;
  managerPhone2: string;
  phone: string;
  email: string;
  website: string;
}

export default function RegisterOfficeScreen() {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const { user, updateUser } = useAuth();
  const isRTL = i18n.language === 'ar';

  const [form, setForm] = useState<OfficeFormData>({
    name: '',
    nameAr: '',
    licenseNumber: '',
    licenseExpiry: null,
    emirate: '',
    address: '',
    addressAr: '',
    googleMapsUrl: '',
    managerPhone1: user?.phone || '',
    managerPhone2: '',
    phone: '',
    email: '',
    website: '',
  });

  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showEmiratePicker, setShowEmiratePicker] = useState(false);

  const registerMutation = useMutation({
    mutationFn: async () => {
      // Register the office with all fields
      await officesApi.register({
        name: form.name,
        nameAr: form.nameAr || undefined,
        licenseNumber: form.licenseNumber || undefined,
        licenseExpiry: form.licenseExpiry?.toISOString() || undefined,
        emirate: form.emirate || undefined,
        address: form.address || undefined,
        addressAr: form.addressAr || undefined,
        googleMapsUrl: form.googleMapsUrl || undefined,
        managerPhone1: form.managerPhone1,
        managerPhone2: form.managerPhone2 || undefined,
        phone: form.phone || form.managerPhone1,
        email: form.email || undefined,
        website: form.website || undefined,
      });
      // Clear the intent
      await storage.deleteItem('user_intent');
      // Refresh user data to get updated role
      const meResult = await authApi.getMe();
      if (meResult.success && meResult.data) {
        await updateUser({
          id: meResult.data.id,
          phone: meResult.data.phone,
          email: meResult.data.email,
          name: meResult.data.name,
          role: meResult.data.role as 'customer' | 'office_admin' | 'super_admin',
          officeId: meResult.data.officeId,
          createdAt: new Date(),
        });
      }
    },
    onSuccess: () => {
      router.replace('/(office)');
    },
    onError: (error: Error) => {
      Alert.alert(t('common.error'), error.message || t('errors.somethingWrong'));
    },
  });

  const handleSubmit = () => {
    if (!form.name.trim()) {
      Alert.alert(t('common.error'), t('office.nameRequired', 'Office name is required'));
      return;
    }
    if (!form.managerPhone1.trim()) {
      Alert.alert(t('common.error'), t('office.phoneRequired', 'Manager phone is required'));
      return;
    }
    registerMutation.mutate();
  };

  const handleDateChange = (_: unknown, selectedDate?: Date) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (selectedDate) {
      setForm((f) => ({ ...f, licenseExpiry: selectedDate }));
    }
  };

  const isValid = form.name.trim() && form.managerPhone1.trim();

  const formatDate = (date: Date | null) => {
    if (!date) return '';
    return date.toLocaleDateString(isRTL ? 'ar-AE' : 'en-AE');
  };

  return (
    <SafeAreaView className="flex-1 bg-background-0">
      <Stack.Screen
        options={{
          headerShown: true,
          title: t('office.register', 'Register Office'),
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
              {t('office.registerTitle', 'Register Your Office')}
            </Text>
            <Text className={`text-typography-500 mt-2 ${isRTL ? 'text-right' : ''}`}>
              {t('office.registerSubtitle', 'Create an account to list and manage your workers')}
            </Text>
          </View>

          {/* Section: Basic Info */}
          <Text className={`text-sm font-semibold text-typography-500 uppercase mb-3 ${isRTL ? 'text-right' : ''}`}>
            {t('office.basicInfo', 'Basic Information')}
          </Text>

          {/* Office Name English */}
          <View className="mb-4">
            <Text className={`text-typography-700 mb-2 font-medium ${isRTL ? 'text-right' : ''}`}>
              {t('office.nameEn', 'Office Name (English)')} *
            </Text>
            <TextInput
              value={form.name}
              onChangeText={(v) => setForm((f) => ({ ...f, name: v }))}
              placeholder={t('office.namePlaceholder', 'As per trade license')}
              className="bg-background-50 rounded-xl px-4 py-4 text-typography-900 border border-background-200"
            />
          </View>

          {/* Office Name Arabic */}
          <View className="mb-4">
            <Text className={`text-typography-700 mb-2 font-medium ${isRTL ? 'text-right' : ''}`}>
              {t('office.nameAr', 'اسم المركز (بالعربي)')}
            </Text>
            <TextInput
              value={form.nameAr}
              onChangeText={(v) => setForm((f) => ({ ...f, nameAr: v }))}
              placeholder="حسب الرخصة التجارية"
              className="bg-background-50 rounded-xl px-4 py-4 text-typography-900 border border-background-200 text-right"
            />
          </View>

          {/* License Number */}
          <View className="mb-4">
            <Text className={`text-typography-700 mb-2 font-medium ${isRTL ? 'text-right' : ''}`}>
              {t('office.licenseNumber', 'License Number')}
            </Text>
            <TextInput
              value={form.licenseNumber}
              onChangeText={(v) => setForm((f) => ({ ...f, licenseNumber: v }))}
              placeholder={t('office.licenseNumberPlaceholder', 'Trade license number')}
              className="bg-background-50 rounded-xl px-4 py-4 text-typography-900 border border-background-200"
            />
          </View>

          {/* License Expiry Date */}
          <View className="mb-4">
            <Text className={`text-typography-700 mb-2 font-medium ${isRTL ? 'text-right' : ''}`}>
              {t('office.licenseExpiry', 'License Expiry Date')}
            </Text>
            <Pressable
              onPress={() => setShowDatePicker(true)}
              className={`bg-background-50 rounded-xl px-4 py-4 border border-background-200 flex-row items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}
            >
              <Text className={`${form.licenseExpiry ? 'text-typography-900' : 'text-typography-400'}`}>
                {form.licenseExpiry ? formatDate(form.licenseExpiry) : t('office.selectDate', 'Select date')}
              </Text>
              <CalendarIcon size={20} color="#717171" />
            </Pressable>
          </View>

          {showDatePicker && (
            <DateTimePicker
              value={form.licenseExpiry || new Date()}
              mode="date"
              display={Platform.OS === 'ios' ? 'spinner' : 'default'}
              onChange={handleDateChange}
              minimumDate={new Date()}
            />
          )}

          {/* Emirate */}
          <View className="mb-6">
            <Text className={`text-typography-700 mb-2 font-medium ${isRTL ? 'text-right' : ''}`}>
              {t('office.emirate', 'Emirate / City')}
            </Text>
            <Pressable
              onPress={() => setShowEmiratePicker(true)}
              className={`bg-background-50 rounded-xl px-4 py-4 border border-background-200 flex-row items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}
            >
              <Text className={`${form.emirate ? 'text-typography-900' : 'text-typography-400'}`}>
                {form.emirate ? getEmirateName(form.emirate, isRTL) : t('office.selectEmirate', 'Select emirate')}
              </Text>
              <ChevronDownIcon size={20} color="#717171" />
            </Pressable>
          </View>

          {/* Section: Contact Info */}
          <Text className={`text-sm font-semibold text-typography-500 uppercase mb-3 mt-2 ${isRTL ? 'text-right' : ''}`}>
            {t('office.contactInfo', 'Contact Information')}
          </Text>

          {/* Manager Phone 1 */}
          <View className="mb-4">
            <Text className={`text-typography-700 mb-2 font-medium ${isRTL ? 'text-right' : ''}`}>
              {t('office.managerPhone1', 'Manager Phone 1')} *
            </Text>
            <TextInput
              value={form.managerPhone1}
              onChangeText={(v) => setForm((f) => ({ ...f, managerPhone1: v }))}
              placeholder="50 123 4567"
              keyboardType="phone-pad"
              className="bg-background-50 rounded-xl px-4 py-4 text-typography-900 border border-background-200"
            />
            <Text className="text-typography-400 text-xs mt-1">
              {t('office.phoneHint', 'Without country code (971)')}
            </Text>
          </View>

          {/* Manager Phone 2 */}
          <View className="mb-4">
            <Text className={`text-typography-700 mb-2 font-medium ${isRTL ? 'text-right' : ''}`}>
              {t('office.managerPhone2', 'Manager Phone 2')}
            </Text>
            <TextInput
              value={form.managerPhone2}
              onChangeText={(v) => setForm((f) => ({ ...f, managerPhone2: v }))}
              placeholder="55 987 6543"
              keyboardType="phone-pad"
              className="bg-background-50 rounded-xl px-4 py-4 text-typography-900 border border-background-200"
            />
          </View>

          {/* Center Phone */}
          <View className="mb-4">
            <Text className={`text-typography-700 mb-2 font-medium ${isRTL ? 'text-right' : ''}`}>
              {t('office.centerPhone', 'Center Phone')}
            </Text>
            <TextInput
              value={form.phone}
              onChangeText={(v) => setForm((f) => ({ ...f, phone: v }))}
              placeholder="02 123 4567"
              keyboardType="phone-pad"
              className="bg-background-50 rounded-xl px-4 py-4 text-typography-900 border border-background-200"
            />
          </View>

          {/* Email */}
          <View className="mb-4">
            <Text className={`text-typography-700 mb-2 font-medium ${isRTL ? 'text-right' : ''}`}>
              {t('office.email', 'Email')}
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

          {/* Website */}
          <View className="mb-6">
            <Text className={`text-typography-700 mb-2 font-medium ${isRTL ? 'text-right' : ''}`}>
              {t('office.website', 'Website')}
            </Text>
            <TextInput
              value={form.website}
              onChangeText={(v) => setForm((f) => ({ ...f, website: v }))}
              placeholder="www.example.com"
              keyboardType="url"
              autoCapitalize="none"
              className="bg-background-50 rounded-xl px-4 py-4 text-typography-900 border border-background-200"
            />
          </View>

          {/* Section: Location */}
          <Text className={`text-sm font-semibold text-typography-500 uppercase mb-3 ${isRTL ? 'text-right' : ''}`}>
            {t('office.location', 'Location')}
          </Text>

          {/* Address English */}
          <View className="mb-4">
            <Text className={`text-typography-700 mb-2 font-medium ${isRTL ? 'text-right' : ''}`}>
              {t('office.address', 'Address')}
            </Text>
            <TextInput
              value={form.address}
              onChangeText={(v) => setForm((f) => ({ ...f, address: v }))}
              placeholder={t('office.addressPlaceholder', 'Office address')}
              multiline
              numberOfLines={2}
              className="bg-background-50 rounded-xl px-4 py-4 text-typography-900 border border-background-200 min-h-[60px]"
              textAlignVertical="top"
            />
          </View>

          {/* Address Arabic */}
          <View className="mb-4">
            <Text className={`text-typography-700 mb-2 font-medium ${isRTL ? 'text-right' : ''}`}>
              {t('office.addressAr', 'العنوان (بالعربي)')}
            </Text>
            <TextInput
              value={form.addressAr}
              onChangeText={(v) => setForm((f) => ({ ...f, addressAr: v }))}
              placeholder="عنوان المكتب"
              multiline
              numberOfLines={2}
              className="bg-background-50 rounded-xl px-4 py-4 text-typography-900 border border-background-200 min-h-[60px] text-right"
              textAlignVertical="top"
            />
          </View>

          {/* Google Maps URL */}
          <View className="mb-6">
            <Text className={`text-typography-700 mb-2 font-medium ${isRTL ? 'text-right' : ''}`}>
              {t('office.googleMapsUrl', 'Google Maps Link')}
            </Text>
            <TextInput
              value={form.googleMapsUrl}
              onChangeText={(v) => setForm((f) => ({ ...f, googleMapsUrl: v }))}
              placeholder="https://maps.google.com/..."
              keyboardType="url"
              autoCapitalize="none"
              className="bg-background-50 rounded-xl px-4 py-4 text-typography-900 border border-background-200"
            />
          </View>

          {/* Submit Button */}
          <Pressable
            onPress={handleSubmit}
            disabled={!isValid || registerMutation.isPending}
            className={`py-4 rounded-xl items-center mb-6 ${
              !isValid || registerMutation.isPending ? 'bg-primary-200' : 'bg-primary-500'
            }`}
          >
            <Text className="text-white font-semibold text-lg">
              {registerMutation.isPending ? t('common.loading') : t('office.registerButton', 'Register Office')}
            </Text>
          </Pressable>

          {/* Info */}
          <View className="mb-10 p-4 bg-primary-50 rounded-xl">
            <Text className={`text-primary-700 text-sm ${isRTL ? 'text-right' : ''}`}>
              {t('office.registerInfo', 'After registration, your office will be reviewed by our team. You\'ll be able to start adding workers once verified.')}
            </Text>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Emirate Picker Modal */}
      <Modal
        visible={showEmiratePicker}
        animationType="slide"
        transparent
        onRequestClose={() => setShowEmiratePicker(false)}
      >
        <View className="flex-1 justify-end bg-black/50">
          <View className="bg-white rounded-t-3xl max-h-[70%]">
            <View className="flex-row justify-between items-center px-6 py-4 border-b border-background-100">
              <Text className="text-lg font-semibold text-typography-900">
                {t('office.selectEmirate', 'Select Emirate')}
              </Text>
              <Pressable onPress={() => setShowEmiratePicker(false)}>
                <Text className="text-primary-500 font-medium">{t('common.done')}</Text>
              </Pressable>
            </View>
            <FlatList
              data={EMIRATES}
              keyExtractor={(item) => item.id}
              renderItem={({ item }) => (
                <Pressable
                  onPress={() => {
                    setForm((f) => ({ ...f, emirate: item.id }));
                    setShowEmiratePicker(false);
                  }}
                  className={`px-6 py-4 border-b border-background-50 ${
                    form.emirate === item.id ? 'bg-primary-50' : ''
                  }`}
                >
                  <Text className={`text-typography-900 ${form.emirate === item.id ? 'font-semibold text-primary-600' : ''}`}>
                    {isRTL ? item.nameAr : item.nameEn}
                  </Text>
                </Pressable>
              )}
              contentContainerStyle={{ paddingBottom: 40 }}
            />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
