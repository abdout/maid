import { useState } from 'react';
import {
  View,
  Text,
  Pressable,
  Modal,
  TextInput,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { BuildingIcon, XIcon, CheckIcon, ChevronRightIcon, ChevronLeftIcon } from './icons';

type TeamSize = 'small' | 'medium' | 'large';
type ServiceType = 'cleaning' | 'cooking' | 'babysitter' | 'elderly';

interface InquiryForm {
  name: string;
  phone: string;
  teamSize: TeamSize | null;
  services: ServiceType[];
  notes: string;
}

const TEAM_SIZES: { value: TeamSize; labelKey: string }[] = [
  { value: 'small', labelKey: 'businessInquiry.teamSizeOptions.small' },
  { value: 'medium', labelKey: 'businessInquiry.teamSizeOptions.medium' },
  { value: 'large', labelKey: 'businessInquiry.teamSizeOptions.large' },
];

const SERVICE_TYPES: { value: ServiceType; labelKey: string }[] = [
  { value: 'cleaning', labelKey: 'serviceTypes.cleaning' },
  { value: 'cooking', labelKey: 'serviceTypes.cooking' },
  { value: 'babysitter', labelKey: 'serviceTypes.babysitter' },
  { value: 'elderly', labelKey: 'serviceTypes.elderly' },
];

export function BusinessSection() {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const isRTL = i18n.language === 'ar';
  const [showModal, setShowModal] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState<InquiryForm>({
    name: '',
    phone: '',
    teamSize: null,
    services: [],
    notes: '',
  });

  const toggleService = (service: ServiceType) => {
    setForm((prev) => ({
      ...prev,
      services: prev.services.includes(service)
        ? prev.services.filter((s) => s !== service)
        : [...prev.services, service],
    }));
  };

  const handleSubmit = async () => {
    if (!form.name || !form.phone || !form.teamSize) return;

    setIsSubmitting(true);
    // Simulate API call - in production, send to backend
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setIsSubmitting(false);
    setShowSuccess(true);

    // Reset form after showing success
    setTimeout(() => {
      setShowModal(false);
      setShowSuccess(false);
      setForm({
        name: '',
        phone: '',
        teamSize: null,
        services: [],
        notes: '',
      });
    }, 2000);
  };

  const isValid = form.name.trim() && form.phone.trim() && form.teamSize;

  return (
    <>
      {/* Business Section - Distinct visual separation */}
      <View className="mt-4 pt-5 pb-6 bg-background-50">
        <Pressable
          onPress={() => setShowModal(true)}
          className="mx-6 bg-background-0 rounded-xl p-5"
          style={{
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.06,
            shadowRadius: 8,
            elevation: 2,
          }}
        >
          <View className={`flex-row items-center gap-4 ${isRTL ? 'flex-row-reverse' : ''}`}>
            <View className="w-14 h-14 rounded-full bg-primary-50 items-center justify-center">
              <BuildingIcon size={28} color="#FF385C" />
            </View>
            <View className="flex-1">
              <Text
                className={`text-lg font-bold text-typography-900 mb-1 ${isRTL ? 'text-right' : 'text-left'}`}
              >
                {t('home.business.title')}
              </Text>
              <Text
                className={`text-sm text-typography-500 ${isRTL ? 'text-right' : 'text-left'}`}
              >
                {t('home.business.subtitle')}
              </Text>
            </View>
            <View className="bg-primary-500 px-4 py-2 rounded-full">
              <Text className="text-white font-semibold text-sm">
                {t('home.business.cta')}
              </Text>
            </View>
          </View>
        </Pressable>
      </View>

      {/* Business Inquiry Modal */}
      <Modal visible={showModal} animationType="slide" transparent>
        <View className="flex-1 justify-end">
          <Pressable onPress={() => setShowModal(false)} className="flex-1 bg-black/50" />

          <View className="bg-background-0 rounded-t-3xl max-h-[90%]">
            {showSuccess ? (
              // Success State
              <View className="p-8 items-center">
                <View className="w-20 h-20 rounded-full bg-success-100 items-center justify-center mb-4">
                  <CheckIcon size={40} color="#22C55E" />
                </View>
                <Text className="text-xl font-bold text-typography-900 mb-2 text-center">
                  {t('businessInquiry.successTitle')}
                </Text>
                <Text className="text-typography-500 text-center">
                  {t('businessInquiry.success')}
                </Text>
              </View>
            ) : (
              <>
                {/* Header */}
                <View
                  className={`flex-row items-center justify-between p-6 border-b border-background-100 ${isRTL ? 'flex-row-reverse' : ''}`}
                >
                  <Text className="text-xl font-bold text-typography-900">
                    {t('businessInquiry.title')}
                  </Text>
                  <Pressable
                    onPress={() => setShowModal(false)}
                    className="w-8 h-8 rounded-full bg-background-100 items-center justify-center"
                  >
                    <XIcon size={18} color="#717171" />
                  </Pressable>
                </View>

                {/* View Plans Link */}
                <Pressable
                  onPress={() => {
                    setShowModal(false);
                    router.push('/(customer)/plans');
                  }}
                  className={`mx-6 mt-4 mb-2 p-4 bg-primary-50 rounded-xl flex-row items-center justify-between ${isRTL ? 'flex-row-reverse' : ''}`}
                >
                  <View className="flex-1">
                    <Text className={`text-primary-700 font-semibold ${isRTL ? 'text-right' : 'text-left'}`}>
                      {t('businessPlans.title')}
                    </Text>
                    <Text className={`text-primary-600 text-sm ${isRTL ? 'text-right' : 'text-left'}`}>
                      {t('businessPlans.subtitle')}
                    </Text>
                  </View>
                  {isRTL ? (
                    <ChevronLeftIcon size={20} color="#FF385C" />
                  ) : (
                    <ChevronRightIcon size={20} color="#FF385C" />
                  )}
                </Pressable>

                <ScrollView className="px-6 py-4" showsVerticalScrollIndicator={false}>
                  {/* Name Input */}
                  <View className="mb-5">
                    <Text
                      className={`text-typography-900 font-semibold mb-2 ${isRTL ? 'text-right' : ''}`}
                    >
                      {t('businessInquiry.name')}
                    </Text>
                    <TextInput
                      value={form.name}
                      onChangeText={(text) => setForm((prev) => ({ ...prev, name: text }))}
                      placeholder={t('businessInquiry.namePlaceholder')}
                      placeholderTextColor="#9CA3AF"
                      className={`bg-background-50 border border-background-200 rounded-xl px-4 py-3 text-typography-900 ${isRTL ? 'text-right' : ''}`}
                    />
                  </View>

                  {/* Phone Input */}
                  <View className="mb-5">
                    <Text
                      className={`text-typography-900 font-semibold mb-2 ${isRTL ? 'text-right' : ''}`}
                    >
                      {t('businessInquiry.phone')}
                    </Text>
                    <TextInput
                      value={form.phone}
                      onChangeText={(text) => setForm((prev) => ({ ...prev, phone: text }))}
                      placeholder={t('businessInquiry.phonePlaceholder')}
                      placeholderTextColor="#9CA3AF"
                      keyboardType="phone-pad"
                      className={`bg-background-50 border border-background-200 rounded-xl px-4 py-3 text-typography-900 ${isRTL ? 'text-right' : ''}`}
                    />
                  </View>

                  {/* Team Size */}
                  <View className="mb-5">
                    <Text
                      className={`text-typography-900 font-semibold mb-2 ${isRTL ? 'text-right' : ''}`}
                    >
                      {t('businessInquiry.teamSize')}
                    </Text>
                    <View className={`flex-row gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                      {TEAM_SIZES.map((size) => (
                        <Pressable
                          key={size.value}
                          onPress={() => setForm((prev) => ({ ...prev, teamSize: size.value }))}
                          className={`flex-1 py-3 rounded-xl border items-center ${
                            form.teamSize === size.value
                              ? 'bg-primary-500 border-primary-500'
                              : 'bg-background-0 border-background-200'
                          }`}
                        >
                          <Text
                            className={
                              form.teamSize === size.value
                                ? 'text-white font-medium'
                                : 'text-typography-700'
                            }
                          >
                            {t(size.labelKey)}
                          </Text>
                        </Pressable>
                      ))}
                    </View>
                  </View>

                  {/* Services */}
                  <View className="mb-5">
                    <Text
                      className={`text-typography-900 font-semibold mb-2 ${isRTL ? 'text-right' : ''}`}
                    >
                      {t('businessInquiry.services')}
                    </Text>
                    <View className={`flex-row flex-wrap gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                      {SERVICE_TYPES.map((service) => {
                        const isSelected = form.services.includes(service.value);
                        return (
                          <Pressable
                            key={service.value}
                            onPress={() => toggleService(service.value)}
                            className={`px-4 py-2 rounded-full border ${
                              isSelected
                                ? 'bg-primary-500 border-primary-500'
                                : 'bg-background-0 border-background-200'
                            }`}
                          >
                            <Text
                              className={isSelected ? 'text-white' : 'text-typography-700'}
                            >
                              {t(service.labelKey)}
                            </Text>
                          </Pressable>
                        );
                      })}
                    </View>
                  </View>

                  {/* Notes */}
                  <View className="mb-5">
                    <Text
                      className={`text-typography-900 font-semibold mb-2 ${isRTL ? 'text-right' : ''}`}
                    >
                      {t('businessInquiry.notes')}
                    </Text>
                    <TextInput
                      value={form.notes}
                      onChangeText={(text) => setForm((prev) => ({ ...prev, notes: text }))}
                      placeholder={t('businessInquiry.notesPlaceholder')}
                      placeholderTextColor="#9CA3AF"
                      multiline
                      numberOfLines={4}
                      textAlignVertical="top"
                      className={`bg-background-50 border border-background-200 rounded-xl px-4 py-3 text-typography-900 min-h-[100px] ${isRTL ? 'text-right' : ''}`}
                    />
                  </View>

                  <View className="h-24" />
                </ScrollView>

                {/* Submit Button - Sticky footer */}
                <View
                  className="p-6 bg-background-0"
                  style={{
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: -2 },
                    shadowOpacity: 0.06,
                    shadowRadius: 6,
                    elevation: 4,
                  }}
                >
                  <Pressable
                    onPress={handleSubmit}
                    disabled={!isValid || isSubmitting}
                    className={`py-4 rounded-xl items-center ${
                      isValid && !isSubmitting ? 'bg-primary-500' : 'bg-background-200'
                    }`}
                  >
                    {isSubmitting ? (
                      <ActivityIndicator color="#FFFFFF" />
                    ) : (
                      <Text
                        className={`font-semibold ${
                          isValid ? 'text-white' : 'text-typography-400'
                        }`}
                      >
                        {t('businessInquiry.submit')}
                      </Text>
                    )}
                  </Pressable>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>
    </>
  );
}

export default BusinessSection;
