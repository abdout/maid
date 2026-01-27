import { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  Pressable,
  ScrollView,
  Alert,
  Platform,
  Image,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { NATIONALITIES } from '@/constants';
import { XIcon, RotateCcwIcon } from './icons';
import { RangeSlider } from './range-slider';
import { LanguageToggle } from './language-toggle';
import type { MaidFilters, AgeRangePreset, ServiceType } from '@maid/shared';

// Filter constants
const SALARY_MIN = 0;
const SALARY_MAX = 10000;
const SALARY_STEP = 100;
const MAX_NATIONALITIES = 3;

// Age range presets per client requirement
const AGE_RANGE_PRESETS: { value: AgeRangePreset; labelEn: string; labelAr: string; min: number; max: number }[] = [
  { value: '20-30', labelEn: '20-30', labelAr: '20-30', min: 20, max: 30 },
  { value: '31-40', labelEn: '31-40', labelAr: '31-40', min: 31, max: 40 },
  { value: '40+', labelEn: '40+', labelAr: '+40', min: 40, max: 65 },
];

// Service type categories with PNG images
const serviceTypeImages = {
  cleaning: require('../../assets/wipe.png'),
  cooking: require('../../assets/chef-hat.png'),
  babysitter: require('../../assets/baby-stroller.png'),
  elderly: require('../../assets/old-people.png'),
} as const;

const SERVICE_TYPES: ReadonlyArray<{
  id: ServiceType;
  image: keyof typeof serviceTypeImages;
  labelEn: string;
  labelAr: string;
}> = [
  { id: 'cleaning', image: 'cleaning', labelEn: 'Cleaning', labelAr: 'تنظيف' },
  { id: 'cooking', image: 'cooking', labelEn: 'Cooking', labelAr: 'طبخ' },
  { id: 'babysitter', image: 'babysitter', labelEn: 'Babysitter', labelAr: 'مربية' },
  { id: 'elderly', image: 'elderly', labelEn: 'Elderly', labelAr: 'مسنين' },
];

interface FilterModalProps {
  visible: boolean;
  onClose: () => void;
  onApply: (filters: Partial<MaidFilters>) => void;
  initialFilters?: Partial<MaidFilters>;
}

export function FilterModal({
  visible,
  onClose,
  onApply,
  initialFilters = {},
}: FilterModalProps) {
  const { t, i18n } = useTranslation();
  const isRTL = i18n.language === 'ar';

  const [filters, setFilters] = useState<Partial<MaidFilters>>(initialFilters);

  useEffect(() => {
    setFilters(initialFilters);
  }, [initialFilters, visible]);

  const maritalStatusOptions = [
    { value: 'married', label: t('maritalStatus.married') },
    { value: 'not_married', label: t('maritalStatus.notMarried') },
  ];

  const religionOptions = [
    { value: 'muslim', label: t('religion.muslim') },
    { value: 'non_muslim', label: t('religion.non_muslim') },
  ];

  const handleReset = () => {
    setFilters({});
  };

  const handleApply = () => {
    // Convert age range preset to ageMin/ageMax for API
    const appliedFilters = { ...filters };
    if (appliedFilters.ageRange) {
      const preset = AGE_RANGE_PRESETS.find(p => p.value === appliedFilters.ageRange);
      if (preset) {
        appliedFilters.ageMin = preset.min;
        appliedFilters.ageMax = preset.value === '40+' ? undefined : preset.max;
      }
    }
    onApply(appliedFilters);
    onClose();
  };

  // Toggle nationality selection (multi-select with max 3)
  const toggleNationality = (nationalityId: string) => {
    const currentIds = filters.nationalityIds || [];

    if (currentIds.includes(nationalityId)) {
      // Remove if already selected
      const newIds = currentIds.filter(id => id !== nationalityId);
      setFilters(prev => ({
        ...prev,
        nationalityIds: newIds.length > 0 ? newIds : undefined,
      }));
    } else {
      // Add if under limit
      if (currentIds.length >= MAX_NATIONALITIES) {
        const message = isRTL
          ? `يمكنك اختيار ${MAX_NATIONALITIES} جنسيات كحد أقصى`
          : `You can select up to ${MAX_NATIONALITIES} nationalities`;

        if (Platform.OS === 'web') {
          window.alert(message);
        } else {
          Alert.alert('', message);
        }
        return;
      }
      setFilters(prev => ({
        ...prev,
        nationalityIds: [...currentIds, nationalityId],
      }));
    }
  };

  // Select "All" nationalities (clear selection)
  const selectAllNationalities = () => {
    setFilters(prev => ({
      ...prev,
      nationalityIds: undefined,
    }));
  };

  // Toggle age range preset
  const toggleAgeRange = (preset: AgeRangePreset) => {
    setFilters(prev => ({
      ...prev,
      ageRange: prev.ageRange === preset ? undefined : preset,
      // Clear manual age values when using preset
      ageMin: undefined,
      ageMax: undefined,
    }));
  };

  const updateFilter = (key: keyof MaidFilters, value: unknown) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value === prev[key] ? undefined : value,
    }));
  };

  const selectedNationalityIds = filters.nationalityIds || [];
  const isAllSelected = selectedNationalityIds.length === 0;

  return (
    <Modal visible={visible} animationType="slide">
      <View className="flex-1 bg-background-0">
          <ScrollView className="px-6 py-6" showsVerticalScrollIndicator={false}>
            {/* Service Type - First section */}
            <View className="mb-6">
              <Text className={`text-typography-900 font-semibold mb-3 ${isRTL ? 'text-right' : ''}`}>
                {t('filters.serviceType')}
              </Text>
              <View
                className="flex-row justify-between"
                style={{ flexDirection: isRTL ? 'row-reverse' : 'row' }}
              >
                {SERVICE_TYPES.map((type) => {
                  const isSelected = filters.serviceType === type.id;
                  return (
                    <Pressable
                      key={type.id}
                      onPress={() => updateFilter('serviceType', type.id)}
                      className={`flex-1 items-center py-3 mx-1 rounded-xl ${
                        isSelected ? 'border-2 border-typography-900' : 'border border-transparent'
                      }`}
                      style={{ opacity: isSelected ? 1 : 0.4 }}
                    >
                      <Image
                        source={serviceTypeImages[type.image]}
                        style={{ width: 36, height: 36 }}
                        resizeMode="contain"
                      />
                      <Text className="text-xs font-medium mt-2 text-typography-900">
                        {isRTL ? type.labelAr : type.labelEn}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            {/* Nationality - Multi-select with max 3 */}
            <View className="mb-6">
              <View className={`flex-row items-center justify-between mb-3 ${isRTL ? 'flex-row-reverse' : ''}`}>
                <Text className="text-typography-900 font-semibold">
                  {t('filters.nationality')}
                </Text>
                <Text className="text-typography-400 text-sm">
                  {isRTL
                    ? `${selectedNationalityIds.length}/${MAX_NATIONALITIES} مختارة`
                    : `${selectedNationalityIds.length}/${MAX_NATIONALITIES} selected`}
                </Text>
              </View>
              <View className={`flex-row flex-wrap gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                {/* All Option */}
                <Pressable
                  onPress={selectAllNationalities}
                  className={`px-4 py-2 rounded-full border ${
                    isAllSelected
                      ? 'bg-primary-500 border-primary-500'
                      : 'bg-background-0 border-background-200'
                  }`}
                >
                  <Text
                    className={isAllSelected ? 'text-white font-medium' : 'text-typography-700'}
                  >
                    {t('common.all')}
                  </Text>
                </Pressable>

                {/* Nationality Options */}
                {NATIONALITIES.map((nat) => {
                  const isSelected = selectedNationalityIds.includes(nat.id);
                  return (
                    <Pressable
                      key={nat.id}
                      onPress={() => toggleNationality(nat.id)}
                      className={`px-4 py-2 rounded-full border ${
                        isSelected
                          ? 'bg-primary-500 border-primary-500'
                          : 'bg-background-0 border-background-200'
                      }`}
                    >
                      <Text
                        className={isSelected ? 'text-white font-medium' : 'text-typography-700'}
                      >
                        {isRTL ? nat.nameAr : nat.nameEn}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>

            {/* Age Range - Preset buttons */}
            <View className="mb-6">
              <Text className={`text-typography-900 font-semibold mb-3 ${isRTL ? 'text-right' : ''}`}>
                {t('filters.ageRange')}
              </Text>
              <View className={`flex-row gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                {AGE_RANGE_PRESETS.map((preset) => (
                  <Pressable
                    key={preset.value}
                    onPress={() => toggleAgeRange(preset.value)}
                    className={`flex-1 px-4 py-3 rounded-xl border items-center ${
                      filters.ageRange === preset.value
                        ? 'bg-primary-500 border-primary-500'
                        : 'bg-background-0 border-background-200'
                    }`}
                  >
                    <Text
                      className={
                        filters.ageRange === preset.value
                          ? 'text-white font-medium'
                          : 'text-typography-700'
                      }
                    >
                      {isRTL ? preset.labelAr : preset.labelEn}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>

            {/* Marital Status */}
            <View className="mb-6">
              <Text className={`text-typography-900 font-semibold mb-3 ${isRTL ? 'text-right' : ''}`}>
                {t('filters.maritalStatus')}
              </Text>
              <View className={`flex-row flex-wrap gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                {maritalStatusOptions.map((option) => (
                  <Pressable
                    key={option.value}
                    onPress={() => updateFilter('maritalStatus', option.value)}
                    className={`px-4 py-2 rounded-full border ${
                      filters.maritalStatus === option.value
                        ? 'bg-primary-500 border-primary-500'
                        : 'bg-background-0 border-background-200'
                    }`}
                  >
                    <Text
                      className={
                        filters.maritalStatus === option.value
                          ? 'text-white'
                          : 'text-typography-700'
                      }
                    >
                      {option.label}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>

            {/* Religion */}
            <View className="mb-6">
              <Text className={`text-typography-900 font-semibold mb-3 ${isRTL ? 'text-right' : ''}`}>
                {t('filters.religion')}
              </Text>
              <View className={`flex-row flex-wrap gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                {religionOptions.map((option) => (
                  <Pressable
                    key={option.value}
                    onPress={() => updateFilter('religion', option.value)}
                    className={`px-4 py-2 rounded-full border ${
                      filters.religion === option.value
                        ? 'bg-primary-500 border-primary-500'
                        : 'bg-background-0 border-background-200'
                    }`}
                  >
                    <Text
                      className={
                        filters.religion === option.value
                          ? 'text-white'
                          : 'text-typography-700'
                      }
                    >
                      {option.label}
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>

            {/* Experience */}
            <View className="mb-6">
              <Text className={`text-typography-900 font-semibold mb-3 ${isRTL ? 'text-right' : ''}`}>
                {t('filters.experience')} ({isRTL ? 'الحد الأدنى' : 'min years'})
              </Text>
              <View className={`flex-row gap-2 ${isRTL ? 'flex-row-reverse' : ''}`}>
                {[0, 1, 2, 3, 5].map((years) => (
                  <Pressable
                    key={years}
                    onPress={() => updateFilter('experienceYears', years)}
                    className={`px-4 py-2 rounded-full border ${
                      filters.experienceYears === years
                        ? 'bg-primary-500 border-primary-500'
                        : 'bg-background-0 border-background-200'
                    }`}
                  >
                    <Text
                      className={
                        filters.experienceYears === years
                          ? 'text-white'
                          : 'text-typography-700'
                      }
                    >
                      {years}+
                    </Text>
                  </Pressable>
                ))}
              </View>
            </View>

            {/* Salary Range */}
            <View className="mb-6">
              <RangeSlider
                label={`${t('filters.salary')} (AED)`}
                min={SALARY_MIN}
                max={SALARY_MAX}
                step={SALARY_STEP}
                minValue={filters.salaryMin ?? SALARY_MIN}
                maxValue={filters.salaryMax ?? SALARY_MAX}
                onMinChange={(v) => setFilters((prev) => ({ ...prev, salaryMin: v === SALARY_MIN ? undefined : v }))}
                onMaxChange={(v) => setFilters((prev) => ({ ...prev, salaryMax: v === SALARY_MAX ? undefined : v }))}
                formatValue={(v) => v.toLocaleString()}
              />
            </View>

            <View className="h-32" />
          </ScrollView>

          {/* Actions - Compact icon row footer */}
          <View
            className={`flex-row items-center gap-4 px-4 py-3 bg-background-0 ${isRTL ? 'flex-row-reverse' : ''}`}
            style={{
              shadowColor: '#000',
              shadowOffset: { width: 0, height: -2 },
              shadowOpacity: 0.06,
              shadowRadius: 6,
              elevation: 4,
            }}
          >
            {/* Close - Icon button */}
            <Pressable
              onPress={onClose}
              className="w-10 h-10 rounded-full bg-background-100 items-center justify-center"
            >
              <XIcon size={20} color="#717171" />
            </Pressable>

            {/* Language Toggle - Icon style */}
            <LanguageToggle variant="icon" />

            {/* Reset - Icon button */}
            <Pressable
              onPress={handleReset}
              className="w-10 h-10 rounded-full bg-background-100 items-center justify-center"
            >
              <RotateCcwIcon size={20} color="#717171" />
            </Pressable>

            {/* Apply - Smaller button */}
            <Pressable
              onPress={handleApply}
              className={`flex-1 py-3 bg-primary-500 rounded-xl items-center ${isRTL ? 'mr-2' : 'ml-2'}`}
            >
              <Text className="text-white font-semibold">{t('filters.apply')}</Text>
            </Pressable>
          </View>
      </View>
    </Modal>
  );
}
