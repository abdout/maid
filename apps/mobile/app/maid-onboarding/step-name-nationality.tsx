import { View, Text, TextInput, Pressable } from 'react-native';
import { useTranslation } from 'react-i18next';
import { useMaidForm } from '@/store/maid-form';
import { NATIONALITIES } from '@/constants';
import { CountryFlag } from '@/components/country-flag';

export default function StepNameNationality() {
  const { i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';

  const { formData, updateFormData, errors } = useMaidForm();

  // Single-language name input based on app language
  const handleNameChange = (text: string) => {
    if (isRTL) {
      updateFormData({ nameAr: text });
    } else {
      updateFormData({ name: text });
    }
  };

  const nameValue = isRTL ? formData.nameAr : formData.name;

  return (
    <View className="pt-4">
      {/* Name - Single field based on language */}
      <View className="mb-6">
        <Text className={`text-typography-700 mb-2 font-medium ${isRTL ? 'text-right' : ''}`}>
          {isRTL ? 'الاسم' : 'Name'} *
        </Text>
        <TextInput
          value={nameValue}
          onChangeText={handleNameChange}
          placeholder={isRTL ? 'فاطمة' : 'Fatima'}
          placeholderTextColor="#9CA3AF"
          className={`bg-background-50 rounded-xl px-4 py-3.5 text-base text-typography-900 ${
            errors.name ? 'border border-error-500' : ''
          }`}
          textAlign={isRTL ? 'right' : 'left'}
        />
        {errors.name && (
          <Text className="text-error-500 text-sm mt-1">{errors.name}</Text>
        )}
        <Text className={`text-typography-400 text-xs mt-1 ${isRTL ? 'text-right' : ''}`}>
          {isRTL ? 'سيتم ترجمة الاسم تلقائياً' : 'Will be auto-translated'}
        </Text>
      </View>

      {/* Nationality */}
      <View>
        <Text className={`text-typography-700 mb-2 font-medium ${isRTL ? 'text-right' : ''}`}>
          {isRTL ? 'الجنسية' : 'Nationality'} *
        </Text>
        <View className={`flex-row flex-wrap gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
          {NATIONALITIES.map((nat) => (
            <Pressable
              key={nat.id}
              onPress={() => updateFormData({ nationalityId: nat.id })}
              className={`flex-row items-center gap-2 px-4 py-2.5 rounded-full border ${
                formData.nationalityId === nat.id
                  ? 'bg-primary-500 border-primary-500'
                  : 'bg-background-0 border-background-200'
              }`}
            >
              <CountryFlag code={nat.code} width={20} />
              <Text
                className={
                  formData.nationalityId === nat.id
                    ? 'text-white font-medium'
                    : 'text-typography-700'
                }
              >
                {isRTL ? nat.nameAr : nat.nameEn}
              </Text>
            </Pressable>
          ))}
        </View>
        {errors.nationalityId && (
          <Text className="text-error-500 text-sm mt-1">{errors.nationalityId}</Text>
        )}
      </View>
    </View>
  );
}
